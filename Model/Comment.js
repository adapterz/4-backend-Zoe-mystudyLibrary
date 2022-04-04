// 댓글 모델
// 외장모듈
import mysql from "mysql2/promise";
// 내장모듈
import { myPool } from "../CustomModule/Db";
import { moment } from "../CustomModule/DateTime";
import { queryFailLog, querySuccessLog } from "../CustomModule/QueryLog";
import { changeDateTimeForm } from "../CustomModule/ChangeDataForm";

/*
 * 1. 댓글 작성
 * 2. 게시글의 댓글정보
 * 3. 수정시 기존댓글 불러오는 모듈
 * 4. 댓글 수정
 * 5. 댓글 삭제
 */
// 새 댓글 작성 모델
export async function writeCommentModel(boardIndex, parentIndex, userIndex, inputComment, ip) {
  let query;
  let commentSequence;
  // 성공시
  try {
    // 댓글 작성시 쿼리문
    if (parentIndex === "NULL") {
      query =
        "INSERT INTO COMMENT(boardIndex,userIndex,commentContent,commentSequence,createDateTime) VALUES (" +
        mysql.escape(boardIndex) +
        "," +
        mysql.escape(userIndex) +
        "," +
        mysql.escape(inputComment.content) +
        "," +
        mysql.escape(1) +
        "," +
        mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
        ")";
      // 쿼리문 메서드 성공
      await myPool.query(query);
      await querySuccessLog(ip, query);
      return { state: "댓글작성" };
    }
    // 대댓글 작성시 쿼리문
    else {
      // parentIndex의 댓글이 루트댓글이 아닌지 체크해주는 쿼리문
      query =
        "SELECT parentIndex FROM COMMENT WHERE deleteDateTime IS NULL AND boardDeleteDateTime IS NULL AND parentIndex IS NOT NULL AND commentIndex =" +
        mysql.escape(parentIndex);
      // 쿼리문 메서드 성공
      let [results, fields] = await myPool.query(query);
      await querySuccessLog(ip, query);
      // 대댓글 다려고 시도한 댓글이 루트댓글이 아닐 때
      if (results[0] !== undefined) {
        return { state: "대댓글에대댓글달기시도" };
      }
      // 해당 댓글 묶음의 마지막 commentSequence 구하기
      query =
        "SELECT commentSequence FROM COMMENT WHERE deleteDateTime IS NULL AND boardDeleteDateTime IS NULL AND parentIndex =" +
        mysql.escape(parentIndex) +
        " ORDER BY commentSequence desc limit 1";
      // 쿼리문 메서드 성공
      [results, fields] = await myPool.query(query);
      await querySuccessLog(ip, query);

      // 검색되는게 없을 때 루트댓글에 대댓글이 없다는 뜻이므로 commentSequence = 2
      if (results[0] === undefined) commentSequence = 2;
      // 검색되는게 있다면 그 다음 commentSequence는 +1 해주기
      else commentSequence = results[0].commentSequence + 1;

      query =
        "INSERT INTO COMMENT(boardIndex,userIndex,commentContent,parentIndex,commentSequence,createDateTime) VALUES (" +
        mysql.escape(boardIndex) +
        "," +
        mysql.escape(userIndex) +
        "," +
        mysql.escape(inputComment.content) +
        "," +
        mysql.escape(parentIndex) +
        "," +
        mysql.escape(commentSequence) +
        "," +
        mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
        ")";
      // 쿼리문 메서드 성공
      await myPool.query(query);
      await querySuccessLog(ip, query);

      return { state: "대댓글작성" };
    }
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await queryFailLog(err, ip, query);
    return { state: "mysql 사용실패" };
  }
}
// 게시글에서 댓글 상세 조회
export async function detailCommentModel(boardIndex, page, ip) {
  let commentData = [];
  let childCommentQuery;
  let query = "SELECT boardIndex FROM BOARD WHERE BOARD.deleteDateTime IS NULL AND boardIndex =" + mysql.escape(boardIndex);
  try {
    let [results, field] = await myPool.query(query);
    await querySuccessLog(ip, query);
    // 게시글이 존재하지 않을 때
    if (results[0] === undefined) return { state: "존재하지않는게시글" };
    // 해당 게시글의 루트 댓글만 가져오는 쿼리문
    const rootCommentQuery =
      "SELECT commentIndex,commentContent,User.nickName, createDateTime,deleteDateTime FROM COMMENT LEFT JOIN USER ON COMMENT.userIndex=USER.userIndex WHERE boardDeleteDateTIme IS NULL AND parentIndex IS NULL AND boardIndex =" +
      mysql.escape(boardIndex) +
      "ORDER BY IF(ISNULL(parentIndex), commentIndex, parentIndex), commentSequence LIMIT " + // 해당 게시글의 댓글 정보
      5 * (page - 1) +
      ",5;";
    const [rootResult, field1] = await myPool.query(rootCommentQuery);
    if (rootResult[0] === undefined) return { state: "댓글없음" };
    // 쿼리문 성공로그
    await querySuccessLog(ip, rootCommentQuery);
    // 해당 페이지 루트댓글의 대댓글 가져오는 쿼리문
    childCommentQuery =
      "SELECT commentContent,User.nickName, createDateTime,deleteDateTime, parentIndex FROM COMMENT LEFT JOIN USER ON COMMENT.userIndex=USER.userIndex WHERE boardDeleteDateTIme IS NULL AND boardIndex =" +
      mysql.escape(boardIndex);
    for (let commentIndex in rootResult) {
      childCommentQuery += " OR parentIndex =" + mysql.escape(rootResult[commentIndex].commentIndex);
    }

    childCommentQuery += " ORDER BY IF(ISNULL(parentIndex), commentIndex, parentIndex), commentSequence"; // 해당 게시글의 댓글 정보

    const [childResult, field2] = await myPool.query(childCommentQuery);
    // 쿼리문 성공로그
    await querySuccessLog(ip, childCommentQuery);
    // 댓글 정보 데이터
    for (let rootIndex in rootResult) {
      let tempRoot = {
        isRoot: true,
        isDeleted: false,
        nickname: rootResult[rootIndex].nickName,
        commentContent: rootResult[rootIndex].commentContent,
        createDate: await changeDateTimeForm(rootResult[rootIndex].createDateTime),
      };
      // 루트댓글이면서 삭제된 댓글일 때
      if (rootResult[rootIndex].deleteDateTime !== null)
        tempRoot = {
          isRoot: true,
          isDeleted: true,
          nickname: rootResult[rootIndex].nickName,
          commentContent: "삭제된 댓글입니다",
          createDate: null,
        };

      if (tempRoot.nickname === null) tempRoot.nickname = "삭제된 유저입니다";
      commentData.push(tempRoot);
      // 해당 댓글의 대댓글 정보 추가
      for (let childIndex in childResult) {
        let tempChild;
        // 대댓글의 parentIndex 가 해당 댓글일 때 commentData에 대댓글 정보 추가
        if (childResult[childIndex].parentIndex === rootResult[rootIndex].commentIndex) {
          if (childResult[childIndex].parentIndex !== null) {
            tempChild = {
              isRoot: false,
              isDeleted: false,
              nickname: childResult[childIndex].nickName,
              commentContent: childResult[childIndex].commentContent,
              createDate: await changeDateTimeForm(childResult[childIndex].createDateTime),
            };
            // 대댓글이면서 삭제된 댓글일 때
            if (childResult[childIndex].deleteDateTime !== null)
              tempChild = {
                isRoot: false,
                isDeleted: true,
                nickname: childResult[childIndex].nickName,
                commentContent: "삭제된 댓글입니다",
                createDate: null,
              };
          }
          if (tempChild.nickname === null) tempChild.nickname = "삭제된 유저입니다";
          commentData.push(tempChild);
        }
      }
    }
    return { state: "게시글의댓글정보", data: commentData };

    // 쿼리문 실행시 에러발생
  } catch (err) {
    await queryFailLog(err, ip, query);
    return { state: "mysql 사용실패" };
  }
}

// 수정시 기존 댓글 정보 불러오는 모델
export async function getCommentModel(commentIndex, loginCookie, ip) {
  const query =
    "SELECT commentContent FROM COMMENT WHERE deleteDateTime IS NULL AND boardDeleteDateTime IS NULL AND commentIndex =" +
    mysql.escape(commentIndex);
  // 성공시
  try {
    const [results, fields] = await myPool.query(query);
    // 쿼리문 성공 로그
    await querySuccessLog(ip, query);
    // DB에 데이터가 없을 때
    if (results[0] === undefined) {
      return { state: "존재하지않는댓글" };
    }
    const commentData = {
      commentContent: results[0].commentContent,
    };
    // DB에 데이터가 있을 때
    return { state: "댓글정보로딩", dataOfComment: commentData };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await queryFailLog(err, ip, query);
    return { state: "mysql 사용실패" };
  }
}

// 댓글 수정
export async function editCommentModel(commentIndex, loginCookie, inputComment, ip) {
  // 댓글 수정 쿼리문
  const query =
    "UPDATE COMMENT SET commentContent=" + mysql.escape(inputComment.content) + "WHERE commentIndex =" + mysql.escape(commentIndex);
  // 성공시
  try {
    await myPool.query(query);
    // 쿼리문 성공 로그
    await querySuccessLog(ip, query);
    // DB에 해당 인덱스의 댓글이 있을 때
    return { state: "댓글수정" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await queryFailLog(err, ip, query);
    return { state: "mysql 사용실패" };
  }
}

// 댓글 삭제
export async function deleteCommentModel(commentIndex, userIndex, ip) {
  // 해당 인덱스 댓글 삭제
  // 댓글 삭제 쿼리문
  const query =
    "UPDATE COMMENT SET deleteDateTime = " +
    mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
    " WHERE commentIndex = " +
    mysql.escape(commentIndex) +
    "AND userIndex = " +
    mysql.escape(userIndex);
  // 성공시
  try {
    await myPool.query(query);
    // 성공 로그찍기
    await querySuccessLog(ip, query);
    return { state: "댓글삭제" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await queryFailLog(err, ip, query);
    return { state: "mysql 사용실패" };
  }
}

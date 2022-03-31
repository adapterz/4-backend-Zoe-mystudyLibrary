// 댓글 모델
// 외장모듈
import mysql from "mysql2/promise";
// 내장모듈
import { myPool } from "../CustomModule/Db";
import { moment } from "../CustomModule/DateTime";
import { queryFailLog, querySuccessLog } from "../CustomModule/QueryLog";
/*
 * 1. 댓글 작성
 * 2. 수정시 기존댓글 불러오는 모듈
 * 3. 댓글 수정
 * 4. 댓글 삭제
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
// 수정시 기존 댓글 정보 불러오는 모델
export async function getCommentModel(commentIndex, loginCookie, ip) {
  const query = "SELECT commentContent FROM COMMENT WHERE deleteDateTime IS NULL AND commentIndex =" + mysql.escape(commentIndex);
  // 성공시
  try {
    const [results, fields] = await myPool.query(query);
    // 쿼리문 성공 로그
    await querySuccessLog(ip, query);
    // DB에 데이터가 없을 때
    if (results[0] === undefined) {
      return { state: "존재하지않는댓글" };
    }
    // DB에 데이터가 있을 때
    return { state: "댓글정보로딩", data: results };
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
    "UPDATE COMMENT SET  commentContent=" + mysql.escape(inputComment.content) + "WHERE commentIndex =" + mysql.escape(commentIndex);
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

// 댓글 모델
// 내장모듈
import { db, Op } from "../orm/models/index";
import { modelFailLog, modelSuccessLog } from "../customModule/modelLog";
import { changeTimestampForm, checkExistUser } from "../customModule/changeDataForm";

/*
 * 1. 댓글 작성
 * 2. 게시글의 댓글정보
 * 3. 수정시 기존댓글 불러오는 모듈
 * 4. 댓글 수정
 * 5. 댓글 삭제
 */
// 새 댓글 작성 모델
export async function writeCommentModel(boardIndex, parentIndex, userIndex, inputComment, ip) {
  let commentSequence;
  // 성공시
  try {
    // 댓글 작성
    if (parentIndex === "NULL") {
      await db["comment"].create({
        boardIndex: boardIndex,
        userIndex: userIndex,
        commentContent: inputComment.content,
        commentSequence: 1,
        createTimestamp: db.sequelize.fn("NOW"),
      });
      await modelSuccessLog(ip, "writeCommentModel");
      return { state: "댓글작성" };
    }
    // 대댓글 작성
    else {
      // parentIndex의 댓글이 루트댓글이 아닌지 체크
      let result = await db["comment"].findAll({
        attributes: ["parentIndex"],
        where: {
          deleteTimestamp: { [Op.is]: null },
          boardDeleteTimestamp: { [Op.is]: null },
          parentIndex: { [Op.ne]: null },
          commentIndex: { [Op.eq]: parentIndex },
        },
      });
      // 대댓글 다려고 시도한 댓글이 루트댓글이 아닐 때
      if (result[0] !== undefined) {
        await modelSuccessLog(ip, "writeCommentModel");
        return { state: "대댓글에대댓글달기시도" };
      }
      // 해당 댓글 묶음의 마지막 commentSequence 구하기
      result = await db["comment"].findAll({
        attributes: ["commentSequence"],
        limit: 1,
        order: [["commentSequence", "DESC"]],
        where: {
          deleteTimestamp: { [Op.is]: null },
          boardDeleteTimestamp: { [Op.is]: null },
          parentIndex: { [Op.eq]: parentIndex },
        },
      });
      // 검색되는게 없을 때 루트댓글에 대댓글이 없다는 뜻이므로 commentSequence = 2
      if (result[0] === undefined) commentSequence = 2;
      // 검색되는게 있다면 그 다음 commentSequence는 +1 해주기
      else commentSequence = result[0].commentSequence + 1;
      await db["comment"].create({
        boardIndex: boardIndex,
        userIndex: userIndex,
        commentContent: inputComment.content,
        parentIndex: parentIndex,
        commentSequence: commentSequence,
        createTimestamp: db.sequelize.fn("NOW"),
      });
      await modelSuccessLog(ip, "writeCommentModel");
      return { state: "대댓글작성" };
    }
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "writeCommentModel");
    return { state: "sequelize 사용실패" };
  }
}
// 게시글에서 댓글 상세 조회
export async function detailCommentModel(boardIndex, page, ip) {
  let commentData = [];
  let childCommentQuery;
  try {
    // 존재하는 게시글인지 체크
    let result = await db["board"].findAll({
      attributes: ["boardIndex"],
      where: {
        deleteTimestamp: { [Op.is]: null },
        boardIndex: { [Op.eq]: boardIndex },
      },
    });

    // 게시글이 존재하지 않을 때
    if (result[0] === undefined) {
      await modelSuccessLog(ip, "detailCommentModel");
      return { state: "존재하지않는게시글" };
    }
    // 해당 게시글의 루트 댓글만 가져오는 쿼리문
    const rootCommentQuery =
      `SELECT commentIndex,commentContent,User.nickname, Comment.createTimestamp,deleteTimestamp FROM COMMENT ` +
      `LEFT JOIN USER ON COMMENT.userIndex=USER.userIndex WHERE boardDeleteTimestamp IS NULL AND parentIndex IS NULL AND boardIndex = ? ` +
      `ORDER BY IF(ISNULL(parentIndex), commentIndex, parentIndex), commentSequence LIMIT ${5 * (page - 1)},5;`;
    let [rootResult, metadata1] = await db.sequelize.query(rootCommentQuery, {
      replacements: [boardIndex],
    });
    if (rootResult[0] === undefined) {
      await modelSuccessLog(ip, "detailCommentModel");
      return { state: "댓글없음" };
    }
    // 해당 페이지 루트댓글의 대댓글 가져오는 쿼리문
    childCommentQuery =
      `SELECT commentContent,User.nickname, Comment.createTimestamp,deleteTimestamp, parentIndex FROM COMMENT ` +
      `LEFT JOIN USER ON COMMENT.userIndex=USER.userIndex WHERE boardDeleteTimestamp IS NULL AND boardIndex = ?`;
    for (let commentIndex in rootResult) {
      childCommentQuery += ` OR parentIndex = ${rootResult[commentIndex].commentIndex}`;
    }

    childCommentQuery += ` ORDER BY IF(ISNULL(parentIndex), commentIndex, parentIndex), commentSequence`; // 해당 게시글의 댓글 정보
    let [childResult, metadata2] = await db.sequelize.query(childCommentQuery, {
      replacements: [boardIndex],
    });
    // 댓글 정보 데이터
    for (let rootIndex in rootResult) {
      let tempRoot = {
        isRoot: true,
        isDeleted: false,
        nickname: await checkExistUser(rootResult[rootIndex].nickname),
        commentContent: rootResult[rootIndex].commentContent,
        createDate: await changeTimestampForm(rootResult[rootIndex].createTimestamp),
      };
      // 루트댓글이면서 삭제된 댓글일 때
      if (rootResult[rootIndex].deleteTimestamp !== null)
        tempRoot = {
          isRoot: true,
          isDeleted: true,
          nickname: await checkExistUser(rootResult[rootIndex].nickname),
          commentContent: "삭제된 댓글입니다",
          createDate: await changeTimestampForm(rootResult[rootIndex].createTimestamp),
        };
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
              nickname: await checkExistUser(childResult[childIndex].nickname),
              commentContent: childResult[childIndex].commentContent,
              createDate: await changeTimestampForm(childResult[childIndex].createTimestamp),
            };
            // 대댓글이면서 삭제된 댓글일 때
            if (childResult[childIndex].deleteTimestamp !== null)
              tempChild = {
                isRoot: false,
                isDeleted: true,
                nickname: await checkExistUser(childResult[childIndex].nickname),
                commentContent: "삭제된 댓글입니다",
                createDate: null,
              };
          }
          commentData.push(tempChild);
        }
      }
    }

    await modelSuccessLog(ip, "detailCommentModel");
    return { state: "게시글의댓글정보", data: commentData };

    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "detailCommentModel");
    return { state: "sequelize 사용실패" };
  }
}

// 수정시 기존 댓글 정보 불러오는 모델
export async function getCommentModel(commentIndex, loginCookie, ip) {
  // 성공시
  try {
    // 존재하는 댓글인지 체크
    let result = await db["comment"].findAll({
      attributes: ["commentContent"],
      where: {
        deleteTimestamp: { [Op.is]: null },
        boardDeleteTimestamp: { [Op.is]: null },
        commentIndex: { [Op.eq]: commentIndex },
      },
    });
    // DB에 데이터가 없을 때
    if (result[0] === undefined) {
      await modelSuccessLog(ip, "getCommentModel");
      return { state: "존재하지않는댓글" };
    }
    const commentData = {
      commentContent: result[0].commentContent,
    };
    // DB에 데이터가 있을 때
    return { state: "댓글정보로딩", dataOfComment: commentData };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "getCommentModel");
    return { state: "sequelize 사용실패" };
  }
}

// 댓글 수정
export async function editCommentModel(commentIndex, loginCookie, inputComment, ip) {
  // 성공시
  try {
    // 댓글 수정
    await db["comment"].update(
      {
        commentContent: inputComment.content,
        updateTimestamp: db.sequelize.fn("NOW"),
      },
      { where: { commentIndex: commentIndex } }
    );
    // 성공 로그
    await modelSuccessLog(ip, "editCommentModel");
    // DB에 해당 인덱스의 댓글이 있을 때
    return { state: "댓글수정" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "editCommentModel");
    return { state: "sequelize 사용실패" };
  }
}

// 댓글 삭제
export async function deleteCommentModel(commentIndex, userIndex, ip) {
  // 해당 인덱스 댓글 삭제
  // 성공시
  try {
    await db["comment"].update(
      {
        deleteTimestamp: db.sequelize.fn("NOW"),
      },
      { where: { commentIndex: commentIndex, userIndex: userIndex } }
    );
    // 성공 로그찍기
    await modelSuccessLog(ip, "deleteCommentModel");
    return { state: "댓글삭제" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "deleteCommentModel");
    return { state: "sequelize 사용실패" };
  }
}

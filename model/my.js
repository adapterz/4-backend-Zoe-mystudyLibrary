// '내가 작성한 글' 정보 요청한 유저 글 정보 조회 (글제목, 조회수, 좋아요 수, 작성날짜)
const mysql = require("mysql2/promise");
const db = require("../a_mymodule/db");
const { querySuccessLog, queryFail } = require("../a_mymodule/const");

async function userPostModel(user_index, ip) {
  // 해당 유저가 작성한 게시글 정보 가져오기
  const query =
    "SELECT boardIndex,postTitle,viewCount,favoriteCount FROM BOARD WHERE deleteDateTime IS NULL AND userIndex = " +
    mysql.escape(user_index);
  // 성공시
  try {
    const [results, fields] = await db.pool.query(query);
    // 쿼리문 메서드 성공
    await querySuccessLog(ip, query);
    // 요청한 데이터가 없을 때
    if (results[0] === undefined) {
      return { state: "등록된글이없음" };
    }
    // 성공 로그찍기, 커밋하고 data return
    return { state: "내작성글조회", data: results };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await queryFail(err, ip, query);
    return { state: "mysql 사용실패" };
  }
}

// 해당유저가 작성한 댓글 조회 모델
async function userCommentModel(user_index, ip) {
  // 해당 유저가 작성한 댓글 정보 select 해오는 쿼리문
  const query =
    "SELECT COMMENT.commentIndex,COMMENT.commentContent,COMMENT.createDateTime,BOARD.postTitle FROM COMMENT INNER JOIN BOARD ON COMMENT.boardIndex =BOARD.boardIndex WHERE BOARD.deleteDateTime IS NULL AND COMMENT.deleteDateTime IS NULL AND COMMENT.userIndex=" +
    mysql.escape(user_index);

  // 성공시
  try {
    const [results, fields] = await db.pool.query(query);
    // 쿼리문 메서드 성공
    await querySuccessLog(ip, query);
    // DB에 데이터가 없을 때
    if (results[0] === undefined) {
      return { state: "등록된댓글없음" };
    }
    // DB에 데이터가 있을 때
    return { state: "성공적조회", data: results };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await queryFail(err, ip, query);
    return { state: "mysql 사용실패" };
  }
}

// 해당 유저가 작성한 후기 정보 가져오는 모델
async function userReviewModel(user_index, ip) {
  // 해당 유저가 작성한 후기 정보 가져오는 쿼리문
  const query =
    "SELECT REVIEW.reviewContent,REVIEW.grade,REVIEW.createDateTime,LIBRARY.libraryName FROM REVIEW INNER JOIN LIBRARY ON REVIEW.libraryIndex = LIBRARY.libraryIndex WHERE REVIEW.deleteDateTime IS NULL AND LIBRARY.deleteDateTime IS NULL AND REVIEW.userIndex=" +
    mysql.escape(user_index);

  // 성공시
  try {
    const [results, fields] = await db.pool.query(query);
    // 성공 로그
    await querySuccessLog(ip, query);
    // 데이터가 없을 때
    if (results[0] === undefined) {
      return { state: "등록된후기없음" };
    }
    // 데이터가 있을 때
    return { state: "성공적조회", data: results };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await queryFail(err, ip, query);
    return { state: "mysql 사용실패" };
  }
}
module.exports = {
  userPostModel: userPostModel,
  userCommentModel: userCommentModel,
  userReviewModel: userReviewModel,
};

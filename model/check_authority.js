const mysql = require("mysql2/promise");
const db = require("../a_mymodule/db");
const { queryFail, querySuccessLog } = require("../a_mymodule/const");

// 삭제/수정 요청한 유저가 해당 게시글의 작성자인지 체크 하는 메서드
async function isPostAuthorModel(board_index, user_index, ip) {
  // 해당 게시글 작성한 유저인덱스 select 해오는 쿼리문
  let query = "SELECT userIndex FROM BOARD WHERE deleteDateTime IS NULL AND boardIndex=" + mysql.escape(board_index);
  // 성공시
  try {
    let [results, fields] = await db.pool.query(query);
    await querySuccessLog(ip, query);
    // 요청한 boardIndex의 게시글이 존재하지 않을 때
    if (results[0] === undefined) {
      return { state: "존재하지않는게시글" };
    }
    // 해당 boardIndex의 게시글이 로그인한 유저가 작성한 것이 아닐 때
    query =
      "SELECT userIndex FROM BOARD WHERE deleteDateTime IS NULL AND boardIndex=" +
      mysql.escape(board_index) +
      "AND userIndex=" +
      mysql.escape(user_index);
    [results, fields] = await db.pool.query(query);
    await querySuccessLog(ip, query);
    // 해당 게시글의 작성자와 요청유저가 일치하지 않을 때
    if (results[0] === undefined) {
      return { state: "접근권한없음" };
    }
    // 해당 게시글의 작성자와 요청유저가 일치할 때
    return { state: "접근성공" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await queryFail(err, ip, query);
    return { state: "mysql 사용실패" };
  }
}
// 삭제/수정 요청한 유저가 해당 댓글의 작성자인지 체크 하는 함수
async function isCommentAuthorModel(board_index, comment_index, user_index, ip) {
  // 해당 댓글의 게시글이 존재하는지 확인
  let query = "SELECT * FROM BOARD WHERE deleteDateTime IS NULL AND boardIndex=" + mysql.escape(board_index);
  // 성공시
  try {
    // 게시글이 존재하는지 확인할 쿼리문 실행
    let [results, fields] = await db.pool.query(query);
    await querySuccessLog(ip, query);
    if (results[0] === undefined) {
      return { state: "존재하지않는게시글" };
    }
    // 해당 댓글 작성한 유저인덱스 select 해오는 쿼리문
    query = "SELECT userIndex FROM COMMENT WHERE deleteDateTime IS NULL AND commentIndex=" + mysql.escape(comment_index);
    [results, fields] = await db.pool.query(query);
    await querySuccessLog(ip, query);
    // 요청한 commentIndex의 게시글이 존재하지 않을 때
    if (results[0] === undefined) {
      return { state: "존재하지않는댓글" };
    }

    // 해당 댓글을 해당 유저가 작성한 것인지 확인
    query =
      "SELECT userIndex FROM COMMENT WHERE deleteDateTime IS NULL AND commentIndex=" +
      mysql.escape(comment_index) +
      "AND userIndex=" +
      mysql.escape(user_index);
    // 쿼리문 실행
    [results, fields] = await db.pool.query(query);
    await querySuccessLog(ip, query);
    // 해당 댓글의 작성자와 요청유저가 일치하지 않을 때
    if (results[0] === undefined) {
      return { state: "접근권한없음" };
    }
    // 해당 댓글의 작성자와 요청유저가 일치할 때
    return { state: "접근성공" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await queryFail(err, ip, query);
    return { state: "mysql 사용실패" };
  }
}
// 삭제/수정 요청한 유저가 해당 후기의 작성자인지 체크 하는 함수
async function isReviewAuthorModel(library_index, review_index, user_index, ip) {
  // 해당 도서관이 존재하는지 확인
  let query = "SELECT * FROM LIBRARY WHERE deleteDateTime IS NULL AND libraryIndex=" + mysql.escape(library_index);
  // 성공시
  try {
    // 쿼리문 실행
    let [results, fields] = await db.pool.query(query);
    await querySuccessLog(ip, query);
    // 요청한 reviewIndex의 도서관이 존재하지 않을 때
    if (results[0] === undefined) {
      return { state: "존재하지않는도서관" };
    }
    // 해당 후기 작성한 유저인덱스 select 해오는 쿼리문
    query = "SELECT userIndex FROM REVIEW WHERE deleteDateTime IS NULL AND reviewIndex=" + mysql.escape(review_index);
    [results, fields] = await db.pool.query(query);
    // 성공로그
    await querySuccessLog(ip, query);
    // 요청한 reviewIndex의 게시글이 존재하지 않을 때
    if (results[0] === undefined) {
      return { state: "존재하지않는후기" };
    }
    // 해당 댓글을 해당 유저가 작성한 것인지 확인
    query =
      "SELECT userIndex FROM REVIEW WHERE deleteDateTime IS NULL AND reviewIndex=" +
      mysql.escape(review_index) +
      "AND userIndex=" +
      mysql.escape(user_index);
    [results, fields] = await db.pool.query(query);
    // 성공로그
    await querySuccessLog(ip, query);
    // 해당 후기의 작성자와 요청유저가 일치하지 않을 때
    if (results[0] === undefined) {
      return { state: "접근권한없음" };
    }
    // 해당 후기의 작성자와 요청유저가 일치할 때
    return { state: "접근성공" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await queryFail(err, ip, query);
    return { state: "mysql 사용실패" };
  }
}

module.exports = {
  isPostAuthorModel: isPostAuthorModel,
  isCommentAuthorModel: isCommentAuthorModel,
  isReviewAuthorModel: isReviewAuthorModel,
};

const mysql = require("mysql2/promise");
const db = require("./db");
const { queryFail, querySuccessLog } = require("./query_log");
// 데이터의 유무나 권한 체크하는 모듈

// 삭제/수정 요청시 해당 게시글의 존재유무, 해당 게시글의 작성자인지 체크 하는 함수
async function checkPostModel(board_index, user_index, ip) {
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

// 삭제/수정 요청시 해당 게시글,댓글의 존재유무, 해당 댓글의 작성자인지 체크 하는 함수
async function checkCommentModel(board_index, comment_index, user_index, ip) {
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
    query =
      "SELECT * FROM COMMENT WHERE deleteDateTime IS NULL AND boardIndex=" +
      mysql.escape(board_index) +
      "AND commentIndex=" +
      mysql.escape(comment_index);
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

// 삭제/수정 요청한 도서관정보가 있는지, 후기 정보가 있는지 유저가 해당 후기의 작성자인지 체크 하는 함수
async function checkReviewModel(library_index, review_index, user_index, ip) {
  // 해당 도서관이 존재하는지 확인
  let query = "SELECT libraryIndex FROM LIBRARY WHERE deleteDateTime IS NULL AND libraryIndex=" + mysql.escape(library_index);
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

// 삭제할 관심도서관 정보가 있는지 체크 하는 함수
async function checkMyLibModel(library_index, user_index, ip) {
  // 해당 도서관이 존재하는지 확인
  let query = "SELECT libraryIndex FROM LIBRARY WHERE deleteDateTime IS NULL AND libraryIndex=" + mysql.escape(library_index);
  // 성공시
  try {
    // 쿼리문 실행
    let [results, fields] = await db.pool.query(query);
    await querySuccessLog(ip, query);
    // 관심도서관 등록한 적이 없을 때
    if (results[0] === undefined) {
      return { state: "존재하지않는도서관" };
    }
    // 해당 유저가 관심도서관 등록한 적이 있는지 확인
    query =
      "SELECT libraryIndex FROM USERLIBRARY WHERE deleteDateTime IS NULL AND userIndex=" +
      mysql.escape(user_index) +
      "AND libraryIndex=" +
      mysql.escape(library_index);
    [results, fields] = await db.pool.query(query);
    await querySuccessLog(ip, query);
    // 성공로그
    // 요청한 reviewIndex의 게시글이 존재하지 않을 때
    if (results[0] === undefined) {
      return { state: "등록되지않은관심도서관" };
    }
    return { state: "접근성공" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await queryFail(err, ip, query);
    return { state: "mysql 사용실패" };
  }
}

module.exports = {
  checkPostModel: checkPostModel,
  checkCommentModel: checkCommentModel,
  checkReviewModel: checkReviewModel,
  checkMyLibModel: checkMyLibModel,
};

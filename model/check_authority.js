const mysql = require("mysql");
const db = require("../a_mymodule/db");
const moment = require("../a_mymodule/date_time");
const { queryFail, querySuccessLog } = require("../a_mymodule/const");

// 삭제/수정 요청한 유저가 해당 게시글의 작성자인지 체크 하는 메서드
function isPostAuthorModel(board_index, user_index, ip) {
  // 해당 게시글 작성한 유저인덱스 select 해오는 쿼리문
  const query = "SELECT userIndex FROM BOARD WHERE deleteDateTime IS NULL AND boardIndex=" + mysql.escape(board_index);

  db.db_connect.query(query, function (err, results) {
    queryFail(err);
    querySuccessLog(ip, query);
    // 요청한 boardIndex의 게시글이 존재하지 않을 때
    if (results[0] === undefined) return { state: "존재하지않는게시글" };
    // 해당 게시글의 작성자와 요청유저가 일치하지 않을 때
    if (user_index !== results[0].userIndex) return { state: "접근권한없음" };
    // 해당 게시글의 작성자와 요청유저가 일치할 때
    return { state: "접근성공" };
  });
}
// 삭제/수정 요청한 유저가 해당 댓글의 작성자인지 체크 하는 함수
function isCommentAuthorModel(comment_index, user_index, ip) {
  // 해당 댓글 작성한 유저인덱스 select 해오는 쿼리문
  const query = "SELECT userIndex FROM COMMENT WHERE deleteDateTime IS NULL AND commentIndex=" + mysql.escape(comment_index);
  // 쿼리문 실행
  db.db_connect.query(query, function (err, results) {
    queryFail(err);
    querySuccessLog(ip, query);
    // 요청한 commentIndex의 게시글이 존재하지 않을 때
    if (results[0] === undefined) return { state: "존재하지않는댓글" };
    // 해당 댓글의 작성자와 요청유저가 일치하지 않을 때
    if (user_index !== results[0].userIndex) return { state: "접근권한없음" };
    // 해당 댓글의 작성자와 요청유저가 일치할 때
    return { state: "접근성공" };
  });
}
// 삭제/수정 요청한 유저가 해당 후기의 작성자인지 체크 하는 함수
function isReviewAuthorModel(review_index, user_index, ip) {
  // 해당 후기 작성한 유저인덱스 select 해오는 쿼리문
  const query = "SELECT userIndex FROM REVIEW WHERE deleteDateTime IS NULL AND reviewIndex=" + mysql.escape(review_index);
  // 쿼리문 실행
  db.db_connect.query(query, function (err, results) {
    queryFail(err);
    querySuccessLog(ip, query);
    // 요청한 reviewIndex의 게시글이 존재하지 않을 때
    if (results[0] === undefined) return { state: "존재하지않는후기" };
    // 해당 후기의 작성자와 요청유저가 일치하지 않을 때
    if (user_index !== results[0].userIndex) return { state: "접근권한없음" };
    // 해당 후기의 작성자와 요청유저가 일치할 때
    return { state: "접근성공" };
  });
}

module.exports = {
  isPostAuthorModel: isPostAuthorModel,
  isCommentAuthorModel: isCommentAuthorModel,
  isReviewAuthorModel: isReviewAuthorModel,
};

// 모듈
const mysql = require("mysql");
const db = require("../a_mymodule/db");
const moment = require("../a_mymodule/date_time");
const { queryFail, querySuccessLog } = require("../a_mymodule/const");

// 해당 게시글의 작성자인지 체크 하는 함수
function isPostAuthorModel(board_index, user_index, ip) {
  const query = "SELECT userIndex FROM BOARDS WHERE deleteDate IS NULL AND boardIndex=" + mysql.escape(board_index);
  // 쿼리문 실행
  db.db_connect.query(query, function (err, results) {
    queryFail(err);
    querySuccessLog(ip, query);
    if (results[0] === undefined) return { state: "존재하지않는게시글" };
    if (user_index !== results[0].userIndex) return { state: "접근권한없음" };
    return { state: "접근성공" };
  });
}
// 해당 댓글의 작성자인지 체크 하는 함수
function isCommentAuthorModel(comment_index, user_index, ip) {
  const query = "SELECT userIndex FROM COMMENTS WHERE deleteDate IS NULL AND commentIndex=" + mysql.escape(comment_index);
  // 쿼리문 실행
  db.db_connect.query(query, function (err, results) {
    queryFail(err);
    querySuccessLog(ip, query);
    if (results[0] === undefined) return { state: "존재하지않는댓글" };
    if (user_index !== results[0].userIndex) return { state: "접근권한없음" };
    return { state: "접근성공" };
  });
}
// 해당 후기의 작성자인지 체크 하는 함수
function isReviewAuthorModel(review_index, user_index, ip) {
  const query = "SELECT userIndex FROM REVIEW WHERE deleteDate IS NULL AND reviewIndex=" + mysql.escape(review_index);
  // 쿼리문 실행
  db.db_connect.query(query, function (err, results) {
    queryFail(err);
    querySuccessLog(ip, query);
    if (results[0] === undefined) return { state: "존재하지않는후기" };
    if (user_index !== results[0].userIndex) return { state: "접근권한없음" };
    return { state: "접근성공" };
  });
}

module.exports = {
  isPostAuthorModel: isPostAuthorModel,
  isCommentAuthorModel: isCommentAuthorModel,
  isReviewAuthorModel: isReviewAuthorModel,
};

const mysql = require("mysql");
const db = require("../a_mymodule/db");
const moment = require("../a_mymodule/date_time");
const { queryFail, querySuccessLog } = require("../a_mymodule/const");

// 해당 유저가 작성한 후기 정보 가져오는 모델
function userReviewModel(user_index, ip) {
  // 해당 유저가 작성한 후기 정보 가져오는 쿼리문
  const query =
    "SELECT REVIEW.reviewContent,REVIEW.grade,REVIEW.createDateTime,LIBRARY.libraryName FROM REVIEW INNER JOIN LIBRARY ON REVIEW.libraryIndex = LIBRARY.libraryIndex WHERE REVIEW.deleteDateTime IS NULL AND LIBRARY.deleteDateTime IS NULL AND REVIEW.userIndex=" +
    mysql.escape(user_index);

  db.db_connect.query(query, function (err, results) {
    queryFail(err);
    querySuccessLog(ip, query);
    // 데이터가 없을 때
    if (results[0] === undefined) {
      return { state: "등록된후기없음" };
    }
    // 데이터가 있을 때
    return { state: "성공적조회", data: results };
  });
}
// 도서관 후기 등록하는 모델
function registerCommentModel(library_index, user_index, input_comment, ip) {
  // 후기 등록 쿼리문
  const query =
    "INSERT INTO REVIEW(libraryIndex,userIndex,reviewContent,createDateTime,grade) VALUES (" +
    mysql.escape(library_index) +
    "," +
    mysql.escape(user_index) +
    "," +
    mysql.escape(input_comment.reviewContent) +
    "," +
    mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
    "," +
    mysql.escape(input_comment.grade) +
    ")";
  db.db_connect.query(query, function (err) {
    queryFail(err);
    querySuccessLog(ip, query);

    return { state: "도서관후기등록" };
  });
}

// 해당 인덱스 후기 삭제
function deleteReviewModel(review_index, user_index, ip) {
  const query =
    "UPDATE REVIEW SET deleteDateTime=" +
    mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
    "  WHERE reviewIndex = " +
    mysql.escape(review_index) +
    "AND userIndex=" +
    mysql.escape(user_index);

  // 오류 발생
  db.db_connect.query(query, function (err) {
    queryFail(err);
    querySuccessLog(ip, query);
    return { state: "후기삭제" };
  });
}

module.exports = { userReviewModel: userReviewModel, registerCommentModel: registerCommentModel, deleteReviewModel: deleteReviewModel };

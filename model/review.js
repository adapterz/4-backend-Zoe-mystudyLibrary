const mysql = require("mysql");
const db = require("../a_mymodule/db");
const moment = require("../a_mymodule/date_time");
const { queryFail, querySuccessLog } = require("../a_mymodule/const");
const check_authority_model = require("./check_authority");
const comment_model = require("./comment");

// 해당 유저가 작성한 후기 정보 가져오는 모델
function userReviewModel(user_index, ip) {
  // 해당 유저가 작성한 후기 정보 가져오는 쿼리문
  const query =
    "SELECT REVIEW.reviewContent,REVIEW.grade,REVIEW.createDateTime,LIBRARY.libraryName FROM REVIEW INNER JOIN LIBRARY ON REVIEW.libraryIndex = LIBRARY.libraryIndex WHERE REVIEW.deleteDateTime IS NULL AND LIBRARY.deleteDateTime IS NULL AND REVIEW.userIndex=" +
    mysql.escape(user_index);

  db.db_connect.query(query, function (err, results) {
    queryFail(err, ip, query);
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
function registerReviewModel(library_index, user_index, input_comment, ip) {
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
    queryFail(err, ip, query);
    querySuccessLog(ip, query);

    return { state: "도서관후기등록" };
  });
}

// 기존 댓글 수정하기 버튼 눌렀을 때 기존 후기 정보 불러오는 모델
function getReviewModel(review_index, login_cookie, ip) {
  const query = "SELECT reviewContent FROM REVIEW WHERE deleteDateTime IS NULL AND reviewIndex =" + mysql.escape(review_index);

  db.db_connect.query(query, function (err, results) {
    // 쿼리문 메서드 실패
    queryFail(err, ip, query);
    // 쿼리문 메서드 성공
    querySuccessLog(ip, query);
    // DB에 데이터가 없을 때
    if (results[0] === undefined) return { state: "존재하지않는후기" };

    // DB에 데이터가 있을 때
    return { state: "후기정보로딩", data: results };
  });
}

// 후기 수정 요청 모델
function reviseReviewModel(review_index, login_cookie, input_review, ip) {
  // 후기 수정 쿼리문
  const query =
    "UPDATE REVIEW SET  reviewContent=" +
    mysql.escape(input_review.reviewContent) +
    ",grade = " +
    mysql.escape(input_review.grade) +
    " WHERE reviewIndex =" +
    mysql.escape(review_index);

  db.db_connect.query(query, function (err, results) {
    // 쿼리문 메서드 실패
    queryFail(err, ip, query);
    // 쿼리문 메서드 성공
    querySuccessLog(ip, query);
    // DB에 해당 인덱스의 댓글이 없을 때
    if (results[0] === undefined) return { state: "존재하지않는후기" };
    // DB에 해당 인덱스의 댓글이 있을 때
    return { state: "후기수정" };
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
    queryFail(err, ip, query);
    querySuccessLog(ip, query);
    return { state: "후기삭제" };
  });
}

module.exports = {
  userReviewModel: userReviewModel,
  registerReviewModel: registerReviewModel,
  getReviewModel: getReviewModel,
  reviseReviewModel: reviseReviewModel,
  deleteReviewModel: deleteReviewModel,
};

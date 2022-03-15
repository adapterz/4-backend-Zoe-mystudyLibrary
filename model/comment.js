const mysql = require("mysql");
const db = require("../a_mymodule/db");
const moment = require("../a_mymodule/date_time");
const { queryFail, querySuccessLog } = require("../a_mymodule/const");

// 해당유저가 작성한 댓글 조회 모델
function userCommentModel(user_index, ip) {
  // 해당 유저가 작성한 댓글 정보 select 해오는 쿼리문
  const query =
    "SELECT COMMENT.commentIndex,COMMENT.commentContent,COMMENT.createDateTime,BOARD.postTitle FROM COMMENT INNER JOIN BOARD ON COMMENT.boardIndex =BOARD.boardIndex WHERE BOARD.deleteDateTime IS NULL AND COMMENT.deleteDateTime IS NULL AND COMMENT.userIndex=" +
    mysql.escape(user_index);

  db.db_connect.query(query, function (err, results) {
    // 쿼리문 메서드 실패
    queryFail(err, ip, query);
    // 쿼리문 메서드 성공
    querySuccessLog(ip, query);
    // DB에 데이터가 없을 때
    if (results[0] === undefined) {
      return { state: "등록된댓글없음" };
    }
    // DB에 데이터가 있을 때
    return { state: "성공적조회", data: results };
  });
}
// 기존 댓글 수정하기 버튼 눌렀을 때 기존 댓글 정보 불러오는 모델
function getCommentModel(comment_index, login_cookie, ip) {
  const query = "SELECT commentContent FROM COMMENT WHERE deleteDateTime IS NULL AND commentIndex =" + mysql.escape(comment_index);

  db.db_connect.query(query, function (err, results) {
    // 쿼리문 메서드 실패
    queryFail(err, ip, query);
    // 쿼리문 메서드 성공
    querySuccessLog(ip, query);
    // DB에 데이터가 없을 때
    if (results[0] === undefined) return { state: "등록된댓글없음" };

    // DB에 데이터가 있을 때
    return { state: "댓글정보로딩", data: results };
  });
}

// 댓글 수정 요청
function reviseCommentModel(comment_index, login_cookie, input_comment, ip) {
  // 댓글 수정 쿼리문
  const query =
    "UPDATE COMMENT SET  commentContent=" + mysql.escape(input_comment.content) + "WHERE commentIndex =" + mysql.escape(comment_index);

  db.db_connect.query(query, function (err, results) {
    // 쿼리문 메서드 실패
    queryFail(err, ip, query);
    // 쿼리문 메서드 성공
    querySuccessLog(ip, query);
    // DB에 해당 인덱스의 댓글이 없을 때
    if (results[0] === undefined) return { state: "등록된댓글없음" };
    // DB에 해당 인덱스의 댓글이 있을 때
    return { state: "댓글수정" };
  });
}

// 새 댓글 작성 모델
function writeCommentModel(board_index, user_index, input_comment, ip) {
  // 댓글 등록 쿼리문
  const query =
    "INSERT INTO COMMENT(boardIndex,userIndex,commentContent,createDateTime) VALUES (" +
    mysql.escape(board_index) +
    "," +
    mysql.escape(user_index) +
    "," +
    mysql.escape(input_comment.content) +
    "," +
    mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
    ")";

  db.db_connect.query(query, function (err) {
    // 쿼리문 메서드 실패
    queryFail(err, ip, query);
    // 쿼리문 메서드 성공
    querySuccessLog(ip, query);
    return { state: "댓글작성" };
  });
}
// 댓글 삭제 모델
function deleteCommentModel(comment_index, user_index, ip) {
  // 해당 인덱스 댓글 삭제
  // 댓글 삭제 쿼리문
  const query =
    "UPDATE COMMENT SET deleteDateTime = " +
    mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
    " WHERE commentIndex = " +
    mysql.escape(comment_index) +
    "AND userIndex = " +
    mysql.escape(user_index);

  db.db_connect.query(query, function (err) {
    // 쿼리문 메서드 실패
    queryFail(err, ip, query);
    // 쿼리문 메서드 성공
    querySuccessLog(ip, query);
    return { state: "댓글삭제" };
  });
}

module.exports = {
  userCommentModel: userCommentModel,
  getCommentModel: getCommentModel,
  reviseCommentModel: reviseCommentModel,
  writeCommentModel: writeCommentModel,
  deleteCommentModel: deleteCommentModel,
};

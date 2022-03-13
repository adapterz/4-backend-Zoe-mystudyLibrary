// 필요모듈
const mysql = require("mysql");
const db = require("../a_mymodule/db");
const moment = require("../a_mymodule/date_time");
const {query_fail_log, query_success_log} = require("../a_mymodule/const");

// 해당유저가 작성한 댓글 조회
function userCommentModel(user_index, ip) {
  let state;
  // 해당 유저가 작성한 후기 정보 가져오기
  const query =
    "SELECT COMMENTS.commentIndex,COMMENTS.commentContent,COMMENTS.created,BOARDS.postTitle FROM COMMENTS INNER JOIN BOARDS ON COMMENT.boardIndex =BOARDS.boardIndex WHERE BOARDS.deleteDate IS NULL AND COMMENTS.deleteDate IS NULL AND COMMENTS.userIndex=" +
    mysql.escape(user_index);
  // 쿼리문 실행
  db.db_connect.query(query, function (err, results) {
    query_fail_log(err);
    query_success_log(ip,query);
    // 데이터가 없을 때 보여줄 페이지
    if (results[0] === undefined) {
      state = { state: "등록된댓글없음" };
      return state;
    }
    // 성공적으로 데이터 전달
    state = { state: "성공적조회", data: results };
    return state;
  });
}

// 댓글 작성
function writeCommentModel(board_index, user_index, input_comment, ip) {
  // 댓글 등록 쿼리문
  const query =
    "INSERT INTO COMMENTS(boardIndex,userIndex,commentContent,created) VALUES (" +
    mysql.escape(board_index) +
    "," +
    mysql.escape(user_index) +
    "," +
    mysql.escape(input_comment.content) +
    "," +
    mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
    ")";
  // 쿼리문 실행
  db.db_connect.query(query, function (err) {
    query_fail_log(err);
    query_success_log(ip,query);
    return { state: "댓글작성" };
  });
}

function deleteCommentModel(comment_index, user_index, ip) {
  // 해당 인덱스 댓글 삭제
  // 댓글 삭제 쿼리문
  const query =
    "UPDATE COMMENTS SET deleteDate = " +
    mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
    " WHERE commentIndex = " +
    mysql.escape(comment_index) +
    "AND userIndex = " +
    mysql.escape(user_index);

  db.db_connect.query(query, function (err) {
    query_fail_log(err);
    query_success_log(ip,query);
    return { state: "댓글삭제" };
  });
}

module.exports = { userCommentModel: userCommentModel, writeCommentModel: writeCommentModel, deleteCommentModel: deleteCommentModel };

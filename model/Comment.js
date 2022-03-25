// 댓글 모델
const mysql = require("mysql2/promise");
const db = require("../custom_module/Db");
const moment = require("../custom_module/DateTime");
const { queryFailLog, querySuccessLog } = require("../custom_module/QueryLog");

// 새 댓글 작성 모델
async function writeCommentModel(board_index, user_index, input_comment, ip) {
  // 해당 게시글이 존재하는지 체크
  let query = "SELECT boardIndex FROM BOARD WHERE deleteDateTime IS NULL AND boardIndex =" + mysql.escape(board_index);
  // 댓글 등록 쿼리문

  // 성공시
  try {
    const [results, fields] = await db.pool.query(query);
    // 쿼리문 메서드 성공
    await querySuccessLog(ip, query);
    console.log(results);
    if (results[0] === undefined) {
      return { state: "존재하지않는게시글" };
    }

    query =
      "INSERT INTO COMMENT(boardIndex,userIndex,commentContent,createDateTime) VALUES (" +
      mysql.escape(board_index) +
      "," +
      mysql.escape(user_index) +
      "," +
      mysql.escape(input_comment.content) +
      "," +
      mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
      ")";
    // 쿼리문 메서드 성공
    await db.pool.query(query);
    await querySuccessLog(ip, query);
    return { state: "댓글작성" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await queryFailLog(err, ip, query);
    return { state: "mysql 사용실패" };
  }
}
// 수정시 기존 댓글 정보 불러오는 모델
async function getCommentModel(comment_index, login_cookie, ip) {
  const query = "SELECT commentContent FROM COMMENT WHERE deleteDateTime IS NULL AND commentIndex =" + mysql.escape(comment_index);
  // 성공시
  try {
    const [results, fields] = await db.pool.query(query);
    // 쿼리문 성공 로그
    await querySuccessLog(ip, query);
    // DB에 데이터가 없을 때
    if (results[0] === undefined) {
      return { state: "존재하지않는댓글" };
    }
    // DB에 데이터가 있을 때
    return { state: "댓글정보로딩", data: results };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await queryFailLog(err, ip, query);
    return { state: "mysql 사용실패" };
  }
}

// 댓글 수정
async function reviseCommentModel(comment_index, login_cookie, input_comment, ip) {
  // 댓글 수정 쿼리문
  const query =
    "UPDATE COMMENT SET  commentContent=" + mysql.escape(input_comment.content) + "WHERE commentIndex =" + mysql.escape(comment_index);
  // 성공시
  try {
    await db.pool.query(query);
    // 쿼리문 성공 로그
    await querySuccessLog(ip, query);
    // DB에 해당 인덱스의 댓글이 있을 때
    return { state: "댓글수정" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await queryFailLog(err, ip, query);
    return { state: "mysql 사용실패" };
  }
}

// 댓글 삭제
async function deleteCommentModel(comment_index, user_index, ip) {
  // 해당 인덱스 댓글 삭제
  // 댓글 삭제 쿼리문
  const query =
    "UPDATE COMMENT SET deleteDateTime = " +
    mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
    " WHERE commentIndex = " +
    mysql.escape(comment_index) +
    "AND userIndex = " +
    mysql.escape(user_index);
  // 성공시
  try {
    await db.pool.query(query);
    // 성공 로그찍기
    await querySuccessLog(ip, query);
    return { state: "댓글삭제" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await queryFailLog(err, ip, query);
    return { state: "mysql 사용실패" };
  }
}

module.exports = {
  writeCommentModel: writeCommentModel,
  getCommentModel: getCommentModel,
  reviseCommentModel: reviseCommentModel,
  deleteCommentModel: deleteCommentModel,
};
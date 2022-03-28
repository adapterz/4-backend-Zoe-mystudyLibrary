// 후기 모델
import mysql from "mysql2/promise";
import { myPool } from "../CustomModule/Db";
import { moment } from "../CustomModule/DateTime";
import { queryFailLog, querySuccessLog } from "../CustomModule/QueryLog";

// 도서관 후기 등록하는 모델
export async function registerReviewModel(library_index, user_index, input_comment, ip) {
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
  // 성공시
  try {
    await myPool.query(query);
    // 쿼리문 성공 로그
    await querySuccessLog(ip, query);
    return { state: "도서관후기등록" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await queryFailLog(err, ip, query);
    return { state: "mysql 사용실패" };
  }
}

// 수정시 기존 후기 정보 불러오는 모델
export async function getReviewModel(review_index, login_cookie, ip) {
  const query = "SELECT reviewContent, grade FROM REVIEW WHERE deleteDateTime IS NULL AND reviewIndex =" + mysql.escape(review_index);
  // 성공시
  try {
    const [results, fields] = await myPool.query(query);
    // 성공 로그
    await querySuccessLog(ip, query);
    // DB에 데이터가 없을 때
    if (results[0] === undefined) {
      return { state: "존재하지않는후기" };
    }

    // DB에 데이터가 있을 때
    return { state: "후기정보로딩", data: results };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await queryFailLog(err, ip, query);
    return { state: "mysql 사용실패" };
  }
}

// 후기 수정 요청
export async function editReviewModel(review_index, login_cookie, input_review, ip) {
  // 후기 수정 쿼리문
  const query =
    "UPDATE REVIEW SET reviewContent=" +
    mysql.escape(input_review.reviewContent) +
    ",grade = " +
    mysql.escape(input_review.grade) +
    " WHERE reviewIndex =" +
    mysql.escape(review_index);
  // 성공시
  try {
    await myPool.query(query);
    // 성공 로그
    await querySuccessLog(ip, query);
    // DB에 해당 인덱스의 댓글이 있을 때
    return { state: "후기수정" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await queryFailLog(err, ip, query);
    return { state: "mysql 사용실패" };
  }
}

// 후기 삭제 요청
export async function deleteReviewModel(review_index, user_index, ip) {
  // 후기삭제 쿼리문
  const query =
    "UPDATE REVIEW SET deleteDateTime=" +
    mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
    "  WHERE reviewIndex = " +
    mysql.escape(review_index);
  // 성공시
  try {
    await myPool.query(query);
    // 성공 로그
    await querySuccessLog(ip, query);
    return { state: "후기삭제" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await queryFailLog(err, ip, query);
    return { state: "mysql 사용실패" };
  }
}

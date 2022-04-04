// 후기 모델
// 외장모듈
import mysql from "mysql2/promise";
// 내장모듈
import { myPool } from "../CustomModule/Db";
import { moment } from "../CustomModule/DateTime";
import { queryFailLog, querySuccessLog } from "../CustomModule/QueryLog";
import { changeDateTimeForm, changeReviewDataForm } from "../CustomModule/ChangeDataForm";
/*
 * 1. 도서관 후기 등록
 * 2. 도서관의 후기 정보
 * 3. 수정시 기존 후기 정보 불러오기
 * 4. 후기 수정 요청
 * 5. 후기 삭제 요청
 */

// 도서관 후기 등록하는 모델
export async function registerReviewModel(libraryIndex, userIndex, inputComment, ip) {
  // 후기 등록 쿼리문
  const query =
    "INSERT INTO REVIEW(libraryIndex,userIndex,reviewContent,createDateTime,grade) VALUES (" +
    mysql.escape(libraryIndex) +
    "," +
    mysql.escape(userIndex) +
    "," +
    mysql.escape(inputComment.reviewContent) +
    "," +
    mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
    "," +
    mysql.escape(inputComment.grade) +
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

// 도서관 후기 조회
export async function detailReviewModel(libraryIndex, page, ip) {
  let reviewData = [];
  // 도서관 정보가 있나 체크
  let query = "SELECT libraryIndex FROM LIBRARY WHERE LIBRARY.deleteDateTime IS NULL AND libraryIndex =" + mysql.escape(libraryIndex);
  try {
    let [results, field] = await myPool.query(query);
    // 쿼리문 성공로그
    await querySuccessLog(ip, query);
    if (results[0] === undefined) return { state: "존재하지않는도서관" };
    // 해당 도서관의 후기 가져오는 쿼리문
    query =
      "SELECT nickName,reviewContent,grade,createDateTime FROM REVIEW LEFT JOIN USER ON USER.userIndex = REVIEW.userIndex WHERE deleteDateTime IS NULL AND libraryIndex =" +
      mysql.escape(libraryIndex) +
      " ORDER BY reviewIndex DESC LIMIT " +
      5 * (page - 1) +
      ",5";

    [results, field] = await myPool.query(query);
    // 쿼리문 성공로그
    await querySuccessLog(ip, query);
    if (results[0] === undefined) return { state: "후기없음" };
    // 쿼리문 성공로그
    await querySuccessLog(ip, query);
    // 후기 정보 데이터
    for (let index in results) {
      const processedResults = await changeReviewDataForm(results[index]);
      const tempData = {
        nickname: results[index].nickName,
        reviewContent: results[index].reviewContent,
        grade: processedResults.grade,
        createDate: await changeDateTimeForm(results[index].createDateTime),
      };
      reviewData.push(tempData);
    }
    return { state: "도서관의후기정보", dataOfReview: reviewData };

    // 쿼리문 실행시 에러발생
  } catch (err) {
    await queryFailLog(err, ip, query);
    return { state: "mysql 사용실패" };
  }
}
// 수정시 기존 후기 정보 불러오는 모델
export async function getReviewModel(reviewIndex, loginCookie, ip) {
  const query = "SELECT reviewContent, grade FROM REVIEW WHERE deleteDateTime IS NULL AND reviewIndex =" + mysql.escape(reviewIndex);
  // 성공시
  try {
    const [results, fields] = await myPool.query(query);
    // 성공 로그
    await querySuccessLog(ip, query);
    // DB에 데이터가 없을 때
    if (results[0] === undefined) {
      return { state: "존재하지않는후기" };
    }

    // 리뷰 데이터 가공
    const reviewData = {
      reviewContent: results[0].reviewContent,
      grade: Math.round(results[0].grade),
    };

    // DB에 데이터가 있을 때
    return { state: "후기정보로딩", dataOfReview: reviewData };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await queryFailLog(err, ip, query);
    return { state: "mysql 사용실패" };
  }
}

// 후기 수정 요청
export async function editReviewModel(reviewIndex, loginCookie, inputReview, ip) {
  // 후기 수정 쿼리문
  const query =
    "UPDATE REVIEW SET reviewContent=" +
    mysql.escape(inputReview.reviewContent) +
    ",grade = " +
    mysql.escape(inputReview.grade) +
    " WHERE reviewIndex =" +
    mysql.escape(reviewIndex);
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
export async function deleteReviewModel(reviewIndex, userIndex, ip) {
  // 후기삭제 쿼리문
  const query =
    "UPDATE REVIEW SET deleteDateTime=" +
    mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
    "  WHERE reviewIndex = " +
    mysql.escape(reviewIndex);
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

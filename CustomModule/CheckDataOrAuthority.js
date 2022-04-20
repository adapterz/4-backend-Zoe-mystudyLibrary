// 데이터의 유무나 권한 체크하는 모듈
// 외장모듈
import mysql from "mysql2/promise";
// 내장모듈
import { myPool } from "./Db";
import { modelFailLog, modelSuccessLog } from "./QueryLog";

// 삭제/수정 요청시 해당 게시글의 존재유무 체크, 해당 게시글의 작성자인지 체크 하는 함수
export async function checkBoardMethod(boardIndex, userIndex, ip) {
  // 해당 게시글 작성한 유저인덱스 select 해오는 쿼리문
  let query = "SELECT userIndex FROM BOARD WHERE deleteTimestamp IS NULL AND boardIndex=" + mysql.escape(boardIndex);
  // 성공시
  try {
    let [results, fields] = await myPool.query(query);
    await modelSuccessLog(ip, query);
    // 요청한 게시글이 존재하지 않을 때
    if (results[0] === undefined) {
      return { state: "존재하지않는게시글" };
    }

    // 해당 게시글이 로그인한 유저가 작성한 것이 아닐 때
    query =
      "SELECT userIndex FROM BOARD WHERE deleteTimestamp IS NULL AND boardIndex=" +
      mysql.escape(boardIndex) +
      "AND userIndex=" +
      mysql.escape(userIndex);
    [results, fields] = await myPool.query(query);
    await modelSuccessLog(ip, query);
    // 해당 게시글의 작성자와 요청유저가 일치하지 않을 때
    if (results[0] === undefined) {
      return { state: "접근권한없음" };
    }
    // 해당 게시글의 작성자와 요청유저가 일치할 때
    return { state: "접근성공" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, query);
    return { state: "mysql 사용실패" };
  }
}

// 삭제/수정 요청시 해당 게시글,댓글의 존재유무 체크, 해당 댓글의 작성자인지 체크 하는 메서드
export async function checkCommentMethod(boardIndex, commentIndex, userIndex, isFirstWrite, ip) {
  // 해당 게시글이 존재하는지 확인
  let query = "SELECT userIndex FROM BOARD WHERE deleteTimestamp IS NULL AND boardIndex=" + mysql.escape(boardIndex);
  // 성공시
  try {
    // 게시글이 존재하는지 확인할 쿼리문 실행
    let [results, fields] = await myPool.query(query);
    await modelSuccessLog(ip, query);
    // 게시글이 존재하지 않을 때
    if (results[0] === undefined) {
      return { state: "존재하지않는게시글" };
    }

    // 해당 댓글이 존재하는지 확인
    if (commentIndex !== "NULL") {
      query =
        "SELECT userIndex FROM COMMENT WHERE deleteTimestamp IS NULL AND boardDeleteTimestamp IS NULL AND boardIndex=" +
        mysql.escape(boardIndex) +
        "AND commentIndex=" +
        mysql.escape(commentIndex);
      [results, fields] = await myPool.query(query);
      await modelSuccessLog(ip, query);
      // 댓글이 존재하지 않을 때
      if (results[0] === undefined) {
        return { state: "존재하지않는댓글" };
      }
    }
    if (isFirstWrite === false) {
      // 해당 댓글을 해당 유저가 작성한 것인지 확인
      query =
        "SELECT userIndex FROM COMMENT WHERE deleteTimestamp IS NULL AND commentIndex=" +
        mysql.escape(commentIndex) +
        "AND userIndex=" +
        mysql.escape(userIndex);
      // 쿼리문 실행
      [results, fields] = await myPool.query(query);
      await modelSuccessLog(ip, query);
      // 해당 댓글의 작성자와 요청유저가 일치하지 않을 때
      if (results[0] === undefined) {
        return { state: "접근권한없음" };
      }
    }
    return { state: "접근성공" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, query);
    return { state: "mysql 사용실패" };
  }
}

// 삭제/수정 요청한 도서관정보가 있는지, 후기 정보가 있는지 유저가 해당 후기의 작성자인지 체크 하는 함수
export async function checkReviewMethod(libraryIndex, reviewIndex, userIndex, ip) {
  // 해당 도서관이 존재하는지 확인
  let query =
    "SELECT libraryType FROM LIBRARY WHERE deleteTimestamp IS NULL AND libraryIndex=" + mysql.escape(libraryIndex);
  // 성공시
  try {
    // 쿼리문 실행
    let [results, fields] = await myPool.query(query);
    await modelSuccessLog(ip, query);
    // 도서관 정보가 존재하지 않을 때
    if (results[0] === undefined) {
      return { state: "존재하지않는도서관" };
    }
    // 해당 후기가 존재하는지 확인
    query = "SELECT userIndex FROM REVIEW WHERE deleteTimestamp IS NULL AND reviewIndex=" + mysql.escape(reviewIndex);
    [results, fields] = await myPool.query(query);
    // 성공로그
    await modelSuccessLog(ip, query);
    // 해당 후기가 존재하지 않을 때
    if (results[0] === undefined) {
      return { state: "존재하지않는후기" };
    }
    // 해당 댓글을 해당 유저가 작성한 것인지 확인
    query =
      "SELECT userIndex FROM REVIEW WHERE deleteTimestamp IS NULL AND reviewIndex=" +
      mysql.escape(reviewIndex) +
      "AND userIndex=" +
      mysql.escape(userIndex);
    [results, fields] = await myPool.query(query);
    // 성공로그
    await modelSuccessLog(ip, query);
    // 해당 후기의 작성자와 요청유저가 일치하지 않을 때
    if (results[0] === undefined) {
      return { state: "접근권한없음" };
    }
    // 해당 후기의 작성자와 요청유저가 일치할 때
    return { state: "접근성공" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, query);
    return { state: "mysql 사용실패" };
  }
}

// 삭제할 관심도서관 정보가 있는지 체크 하는 함수
export async function checkUserLibraryMethod(libraryIndex, userIndex, ip) {
  // 해당 도서관이 존재하는지 확인
  let query =
    "SELECT libraryType FROM LIBRARY WHERE deleteTimestamp IS NULL AND libraryIndex=" + mysql.escape(libraryIndex);
  // 성공시
  try {
    // 쿼리문 실행
    let [results, fields] = await myPool.query(query);
    await modelSuccessLog(ip, query);
    // 관심도서관 등록한 적이 없을 때
    if (results[0] === undefined) {
      return { state: "존재하지않는도서관" };
    }
    // 해당 유저가 관심도서관 등록한 적이 있는지 확인
    query =
      "SELECT libraryType FROM USERLIBRARY WHERE deleteTimestamp IS NULL AND userIndex=" +
      mysql.escape(userIndex) +
      " AND libraryIndex=" +
      mysql.escape(libraryIndex);
    [results, fields] = await myPool.query(query);
    await modelSuccessLog(ip, query);
    // 성공로그
    // 기존에 관심도서관으로 등록되지 않았을 때
    if (results[0] === undefined) {
      return { state: "등록되지않은관심도서관" };
    }
    return { state: "접근성공" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, query);
    return { state: "mysql 사용실패" };
  }
}

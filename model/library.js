const mysql = require("mysql2/promise");
const db = require("../a_mymodule/db");
const moment = require("../a_mymodule/date_time");
const { queryFail, querySuccessLog } = require("../a_mymodule/const");

// 유저가 등록한 관심도서관 정보 불러오는 모델
async function userLibModel(user_index, ip) {
  // TODO 삼중조인 해보기
  // 해당 유저가 관심도서관으로 등록한 도서관 정보 가져오기
  let query =
    "SELECT LIBRARY.libraryIndex,libraryName,libraryType,closeDay,openWeekday,endWeekday,openSaturday,endSaturday,openHoliday,endHoliday,nameOfCity,districts,address,libraryContact,AVG(grade),COUNT(grade) FROM USERLIBRARY LEFT JOIN LIBRARY ON LIBRARY.libraryIndex = USERLIBRARY.libraryIndex LEFT JOIN REVIEW ON USERLIBRARY.libraryIndex = REVIEW.libraryIndex WHERE LIBRARY.deleteDateTime IS NULL AND USERLIBRARY.deleteDateTime IS NULL AND REVIEW.deleteDateTime IS NULL AND USERLIBRARY.userIndex=" +
    mysql.escape(user_index) +
    "GROUP BY libraryIndex";
  //";" +
  //"SELECT AVG(grade) FROM REVIEW INNER JOIN USERLIBRARY ON REVIEW.libraryIndex=USERLIBRARY.libraryIndex  WHERE REVIEW.deleteDateTime IS NULL AND USERLIBRARY.deleteDateTime IS NULL GROUP BY USERLIBRARY.libraryIndex;";
  try {
    const [results, fields] = await db.pool.query(query);
    // 쿼리 성공 로그
    await querySuccessLog(ip, query);
    if (results[0] === undefined) {
      return { state: "등록된정보없음" };
    }
    return { state: "유저의관심도서관", data: results };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await queryFail(err, ip, query);
    return { state: "mysql 사용실패" };
  }
}

// 해당 인덱스의 도서관 관심도서관으로 등록하는 모델
async function registerMyLibModel(library_index, user_index, ip) {
  let query =
    "SELECT userIndex,libraryIndex FROM USERLIBRARY WHERE userIndex=" +
    mysql.escape(user_index) +
    "AND libraryIndex=" +
    mysql.escape(library_index);
  // 성공시
  try {
    const [results, fields] = await db.pool.query(query);
    if (results[0] !== undefined) {
      return { state: "중복된등록요청" };
    }
    // USERLIBRARY 테이블에 유저인덱스와 해당 유저가 등록한 도서관인덱스 추가하는 쿼리문
    query =
      "INSERT INTO USERLIBRARY(userIndex,libraryIndex,updateDateTime) VALUES (" +
      mysql.escape(user_index) +
      "," +
      mysql.escape(library_index) +
      "," +
      mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
      ")";
    await db.pool.query(query);
    // 쿼리문 메서드 성공
    await querySuccessLog(ip, query);
    return { state: "관심도서관추가" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await queryFail(err, ip, query);
    return { state: "mysql 사용실패" };
  }
}
// 해당 인덱스의 도서관 관심도서관 취소하는 모델
async function deleteMyLibModel(library_index, user_index, ip) {
  // 등록한 관심도서관이 존재하는지 확인하는 쿼리문
  let query =
    "SELECT userIndex FROM USERLIBRARY WHERE userIndex =" + mysql.escape(user_index) + "AND libraryIndex =" + mysql.escape(library_index);

  try {
    let [results, fields] = await db.pool.query(query);
    // 쿼리문 성공 로그
    await querySuccessLog(ip, query);
    // 기존에 해당 유저 인덱스로 해당 관심도서관이 등록되지 않았을 때
    if (results[0] === undefined) {
      return { state: "존재하지않는정보" };
    }
    // 등록한 관심도서관 삭제하는 쿼리문
    query =
      "UPDATE USERLIBRARY SET deleteDateTime =" +
      mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
      "WHERE libraryIndex =" +
      mysql.escape(library_index);
    await db.pool.query(query);
    // 쿼리문 성공 로그
    await querySuccessLog(ip, query);
    return { state: "관심도서관삭제" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await queryFail(err, ip, query);
    return { state: "mysql 사용실패" };
  }
}

// 전체 도서관 정보 불러오는 모델
async function allLibModel(ip) {
  // 전체 도서관 정보 가져오는 쿼리문 + 도서관 별 후기 평균 평점, 평점개수 가져오는 쿼리문
  const query =
    "SELECT LIBRARY.libraryIndex,libraryName,libraryType,closeDay,openWeekday,endWeekday,openSaturday,endSaturday,openHoliday,endHoliday,nameOfCity,districts,address,libraryContact,COUNT(grade),AVG(grade) FROM LIBRARY LEFT JOIN REVIEW ON LIBRARY.libraryIndex=REVIEW.libraryIndex WHERE LIBRARY.deleteDateTime IS NULL AND REVIEW.deleteDateTime IS NULL GROUP BY libraryIndex";
  try {
    // 쿼리문 메서드 성공
    const [results, fields] = await db.pool.query(query);
    // 성공 로그찍기
    await querySuccessLog(ip, query);
    return { state: "전체도서관정보", data: results };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await queryFail(err, ip, query);
    return { state: "mysql 사용실패" };
  }
}

// 입력한 지역에 따라 도서관 정보주는 모델
async function localLibModel(input_local, ip) {
  // 유저가 요청한 시도명/시군구명에 맞게 데이터 가져오는 쿼리문
  const query =
    "SELECT LIBRARY.libraryIndex,libraryName,libraryType,closeDay,openWeekday,endWeekday,openSaturday,endSaturday,openHoliday,endHoliday,nameOfCity,districts,address,libraryContact,AVG(grade) FROM LIBRARY LEFT JOIN REVIEW ON LIBRARY.deleteDateTime=REVIEW.deleteDateTime WHERE LIBRARY.deleteDateTime IS NULL AND REVIEW.deleteDateTime IS NULL AND nameOfCity =" +
    mysql.escape(input_local.nameOfCity) +
    " AND districts =" +
    mysql.escape(input_local.districts) +
    "GROUP BY libraryIndex";
  try {
    const [results, fields] = await db.pool.query(query);
    // 성공 로그찍기
    await querySuccessLog(ip, query);
    // 유저가 요청한 지역에 도서관이 존재하지 않을 때
    if (results[0] === undefined) {
      return { state: "존재하지않는정보" };
    }
    // 유저가 요청한 지역에 도서관이 존재할 때
    return { state: "주변도서관", data: results };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await queryFail(err, ip, query);
    return { state: "mysql 사용실패" };
  }
}

// 특정 도서관 정보 가져오는 모델
async function particularLibModel(library_index, ip) {
  // 특정 libIndex의 도서관 정보+ 해당 도서관인덱스의 후기 정보, 후기의 평균 평점/평점개수 가져오는 다중 쿼리문
  const query =
    "SELECT LIBRARY.libraryIndex,libraryName,libraryType,closeDay,openWeekday,endWeekday,openSaturday,endSaturday,openHoliday,endHoliday,nameOfCity,districts,address,libraryContact,COUNT(grade),AVG(grade) FROM LIBRARY LEFT JOIN REVIEW ON LIBRARY.libraryIndex=REVIEW.libraryIndex WHERE LIBRARY.deleteDateTime IS NULL AND REVIEW.deleteDateTime IS NULL AND LIBRARY.libraryIndex=" +
    mysql.escape(library_index) +
    " GROUP BY libraryIndex;" +
    "SELECT reviewIndex,libraryIndex,userIndex,reviewContent,grade,createDateTime FROM REVIEW WHERE deleteDateTime IS NULL AND libraryIndex =" +
    mysql.escape(library_index) +
    ";";

  // 성공시
  try {
    const [results, fields] = await db.pool.query(query);
    // 성공 로그
    await querySuccessLog(ip, query);
    // 유저가 요청한 인덱스의 도서관 정보가 존재하지 않을 때
    if (results[0] === undefined) {
      return { state: "존재하지않는정보" };
    }
    // 유저가 요청한 도서관 정보가 존재할 때
    return { state: "상세도서관정보", data: results };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await queryFail(err, ip, query);
    return { state: "mysql 사용실패" };
  }
}

module.exports = {
  userLibModel: userLibModel,
  registerMyLibModel: registerMyLibModel,
  deleteMyLibModel: deleteMyLibModel,
  allLibModel: allLibModel,
  localLibModel: localLibModel,
  particularLibModel: particularLibModel,
};

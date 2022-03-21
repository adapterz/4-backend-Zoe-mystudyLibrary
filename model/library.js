// 도서관 모델
const mysql = require("mysql2/promise");
const db = require("../my_module/db");
const { queryFail, querySuccessLog } = require("../my_module/query_log");

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
  // 특정 libraryIndex의 도서관 정보+ 해당 도서관인덱스의 후기 정보, 후기의 평균 평점/평점개수 가져오는 다중 쿼리문
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
    if (results[0][0] === undefined) {
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
  allLibModel: allLibModel,
  localLibModel: localLibModel,
  particularLibModel: particularLibModel,
};

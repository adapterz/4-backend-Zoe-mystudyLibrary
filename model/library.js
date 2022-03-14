// 필요모듈
const mysql = require("mysql");
const db = require("../a_mymodule/db");
const moment = require("../a_mymodule/date_time");
const { queryFail, querySuccessLog } = require("../a_mymodule/const");

// 유저 관심도서관
function userLibModel(user_index, ip) {
  // 해당 유저가 관심도서관으로 등록한 도서관 정보 가져오기
  let query =
    "SELECT libIndex,libName,libType,closeDay,openWeekday,endWeekday,openSaturday,endSaturday,openHoliday,endHoliday,nameOfCity,districts,address,libContact FROM LIBRARY LEFT JOIN userLib ON LIBRARY.libIndex = userLib.userLib WHERE LIBRARY.deleteDate IS NULL AND userLib.deleteDate IS NULL AND userIndex=" +
    mysql.escape(user_index);
  // 쿼리문 실행
  db.db_connect.query(query, function (err, results) {
    queryFail(err);
    querySuccessLog(ip, query);
    return { state: "유저의관심도서관", data: results };
  });
}

// 내 정보 '관심도서관' 항목에 해당 인덱스의 도서관 데이터 추가
function registerMyLibModel(lib_index, user_index, ip) {
  // userLib 테이블에 해당 유저인덱스에 관심도서관 인덱스 추가
  const query = "INSERT INTO userLib(userIndex,userLib) VALUES (" + mysql.escape(user_index) + "," + mysql.escape(lib_index) + ")";
  // 해당 인덱스의 도서관 정보 응답
  db.db_connect.query(query, function (err) {
    queryFail(err);
    querySuccessLog(ip, query);

    return { state: "관심도서관추가" };
  });
}

// 전체 도서관 정보
function allLibModel(ip) {
  // 전체 도서관 정보 가져오는 쿼리문 + 도서관 별 review 평점 평균 가져오는 쿼리문
  const query =
    "SELECT libIndex,libName,libType,closeDay,openWeekday,endWeekday,openSaturday,endSaturday,openHoliday,endHoliday,nameOfCity,districts,address,libContact FROM LIBRARY WHERE deleteDate IS NULL;" +
    "SELECT AVG(grade) FROM REVIEW GROUP BY libIndex;";

  db.db_connect.query(query, function (err, results) {
    queryFail(err);
    querySuccessLog(ip, query);
    return { state: "전체도서관정보", data: results };
  });
}

// 입력한 지역에 따라 도서관 정보주는 모델
function localLibModel(input_local, ip) {
  // 유저가 요청한 시도명/시군구명에 맞게 데이터 가져오는 쿼리문
  const query =
    "SELECT libIndex,libName,libType,closeDay,openWeekday,endWeekday,openSaturday,endSaturday,openHoliday,endHoliday,nameOfCity,districts,address,libContact FROM LIBRARY WHERE deleteDate IS NULL nameOfCity =" +
    mysql.escape(input_local.nameOfCity) +
    " AND districts =" +
    mysql.escape(input_local.districts) +
    ";" +
    "SELECT AVG(grade) FROM REVIEW GROUP BY libIndex;";

  db.db_connect.query(query, function (err, results) {
    queryFail(err);
    querySuccessLog(ip, query);
    if (results[0] === undefined) return { state: "존재하지않는정보" };
    return { state: "주변도서관정보", data: results };
  });
}

// 특정 도서관 정보 자세히 보기
function particularLibModel(lib_index, ip) {
  // 특정 libIndex의 도서관 정보 자세히 보기
  const query =
    "SELECT libIndex, libName,libType,closeDay,timeWeekday,timeSaturday,timeHoliday,address,libContact,nameOfCity,districts,reviewContent,created,grade FROM LIBRARY LEFT JOIN REVIEW ON LIBRARY.libIndex=REVIEW.libIndex WHERE LIBRARY.deleteDate IS NULL AND REVIEW.deleteDate IS NULL AND libIndex = " +
    mysql.escape(lib_index) +
    ";" +
    "SELECT AVG(grade) FROM REVIEW GROUP BY libIndex;";

  // 해당 인덱스의 도서관 정보 응답
  db.db_connect.query(query, function (err, results) {
    queryFail(err);
    querySuccessLog(ip, query);
    if (results[0] === undefined) return { state: "존재하지않는정보" };
    return { state: "상세도서관정보", data: results };
  });
}

module.exports = {
  userLibModel: userLibModel,
  registerMyLibModel: registerMyLibModel,
  allLibModel: allLibModel,
  localLibModel: localLibModel,
  particularLibModel: particularLibModel,
};

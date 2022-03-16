const mysql = require("mysql");
const db = require("../a_mymodule/db");
const moment = require("../a_mymodule/date_time");
const { queryFail, querySuccessLog } = require("../a_mymodule/const");
const { db_connect } = require("../a_mymodule/db");

// 유저가 등록한 관심도서관 정보 불러오는 모델
async function userLibModel(user_index, ip) {
  db.db_connect.beginTransaction(async function (error) {
    if (error) throw error;
    // 해당 유저가 관심도서관으로 등록한 도서관 정보 가져오기
    let query =
      "SELECT libraryIndex,libraryName,libraryType,closeDay,openWeekday,endWeekday,openSaturday,endSaturday,openHoliday,endHoliday,nameOfCity,districts,address,libraryContact FROM LIBRARY LEFT JOIN USERLIBRARY ON LIBRARY.libraryIndex = USERLIBRARY.libraryIndex WHERE LIBRARY.deleteDateTime IS NULL AND USERLIBRARY.deleteDateTime IS NULL AND userIndex=" +
      mysql.escape(user_index);

    db.db_connect.query(query, async function (err, results) {
      // 쿼리문 실패
      const fail = await queryFail(err, ip, query);
      if (fail.state === "mysql 사용실패") {
        db_connect.rollback();
        return { state: "mysql 사용실패" };
      }
      // 쿼리문 메서드 성공
      await querySuccessLog(ip, query);
      db_connect.commit();
      return { state: "유저의관심도서관", data: results };
    });
  });
}

// 해당 인덱스의 도서관 관심도서관으로 등록하는 모델
async function registerMyLibModel(library_index, user_index, ip) {
  db.db_connect.beginTransaction(async function (error) {
    if (error) throw error;
    // USERLIBRARY 테이블에 유저인덱스와 해당 유저가 등록한 도서관인덱스 추가하는 쿼리문
    const query =
      "INSERT INTO USERLIBRARY(userIndex,libraryIndex,updateDateTime) VALUES (" +
      mysql.escape(user_index) +
      "," +
      mysql.escape(library_index) +
      "," +
      mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
      ")";

    db.db_connect.query(query, async function (err) {
      // 쿼리 메서드 실패
      const fail = await queryFail(err, ip, query);
      if (fail.state === "mysql 사용실패") {
        db_connect.rollback();
        return { state: "mysql 사용실패" };
      }
      // 쿼리문 메서드 성공
      await querySuccessLog(ip, query);
      db_connect.commit();
      return { state: "관심도서관추가" };
    });
  });
}
// 해당 인덱스의 도서관 관심도서관 취소하는 모델
async function deleteMyLibModel(library_index, user_index, ip) {
  db.db_connect.beginTransaction(async function (error) {
    if (error) throw error;
    // 등록한 관심도서관 삭제하는 쿼리문
    const query =
      "UPDATE USERLIBRARY SET deleteDateTime =" +
      mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
      "WHERE libraryIndex =" +
      mysql.escape(library_index);

    db.db_connect.query(query, async function (err, results) {
      // 쿼리 메서드 실패
      const fail = await queryFail(err, ip, query);
      if (fail.state === "mysql 사용실패") {
        db_connect.rollback();
        return { state: "mysql 사용실패" };
      }
      // 쿼리문 메서드 성공
      await querySuccessLog(ip, query);
      // 기존에 해당 유저 인덱스로 해당 관심도서관이 등록되지 않았을 때
      if (results[0] === undefined) {
        db_connect.rollback();
        return { state: "존재하지않는정보" };
      }
      // 해당 관심도서관 정보 삭제
      db_connect.commit();
      return { state: "관심도서관삭제" };
    });
  });
}

// 전체 도서관 정보 불러오는 모델
async function allLibModel(ip) {
  db.db_connect.beginTransaction(async function (error) {
    if (error) throw error;
    // 전체 도서관 정보 가져오는 쿼리문 + 도서관 별 후기 평균 평점 가져오는 다중쿼리문
    const query =
      "SELECT libraryIndex,libraryName,libraryType,closeDay,openWeekday,endWeekday,openSaturday,endSaturday,openHoliday,endHoliday,nameOfCity,districts,address,libraryContact FROM LIBRARY WHERE deleteDateTime IS NULL;" +
      "SELECT AVG(grade) FROM REVIEW GROUP BY libraryIndex;"; // 후기 평균 평점 select 해오는 쿼리문

    db.db_connect.query(query, async function (err, results) {
      // 쿼리 메서드 실패
      const fail = await queryFail(err, ip, query);
      if (fail.state === "mysql 사용실패") {
        db_connect.rollback();
        return { state: "mysql 사용실패" };
      }
      // 쿼리문 메서드 성공
      await querySuccessLog(ip, query);
      db_connect.commit();
      return { state: "전체도서관정보", data: results };
    });
  });
}

// 입력한 지역에 따라 도서관 정보주는 모델
async function localLibModel(input_local, ip) {
  db.db_connect.beginTransaction(async function (error) {
    if (error) throw error;
    // 유저가 요청한 시도명/시군구명에 맞게 데이터 가져오는 쿼리문
    const query =
      "SELECT libraryIndex,libraryName,libraryType,closeDay,openWeekday,endWeekday,openSaturday,endSaturday,openHoliday,endHoliday,nameOfCity,districts,address,libraryContact FROM LIBRARY WHERE deleteDateTime IS NULL nameOfCity =" +
      mysql.escape(input_local.nameOfCity) +
      " AND districts =" +
      mysql.escape(input_local.districts) +
      ";" +
      "SELECT AVG(grade) FROM REVIEW WHERE deleteDateTime IS NULL GROUP BY libraryIndex;";

    db.db_connect.query(query, async function (err, results) {
      // 쿼리 메서드 실패
      const fail = await queryFail(err, ip, query);
      //TODO 비동기처리
      if (fail.state === "mysql 사용실패") {
        db_connect.rollback();
        return { state: "mysql 사용실패" };
      }
      // 쿼리문 메서드 성공
      await querySuccessLog(ip, query);
      // 유저가 요청한 지역에 도서관이 존재하지 않을 때
      if (results[0] === undefined) {
        db_connect.rollback();
        return { state: "존재하지않는정보" };
      }
      // 유저가 요청한 지역에 도서관이 존재할 때
      db_connect.commit();
      return { state: "주변도서관정보", data: results };
    });
  });
}

// 특정 도서관 정보 가져오는 모델
async function particularLibModel(library_index, ip) {
  db.db_connect.beginTransaction(async function (error) {
    if (error) throw error;
    // 특정 libIndex의 도서관 정보+ 해당 도서관인덱스의 후기 정보, 후기의 평균 평점 가져오는 다중 쿼리문
    const query =
      "SELECT libraryIndex, libraryName,libraryType,closeDay,timeWeekday,timeSaturday,timeHoliday,address,libraryContact,nameOfCity,districts,reviewContent,createDateTime,grade FROM LIBRARY LEFT JOIN REVIEW ON LIBRARY.libraryIndex=REVIEW.libraryIndex WHERE LIBRARY.deleteDateTime IS NULL AND REVIEW.deleteDateTime IS NULL AND LIBRARY.libraryIndex = " +
      mysql.escape(library_index) +
      ";" +
      "SELECT COUNT(*),AVG(grade) FROM REVIEW WHERE deleteDateTime IS NULL AND libraryIndex=" +
      mysql.escape(library_index) +
      "GROUP BY libraryIndex;" +
      "SELECT COUNT(*) FROM USERLIBRARY WHERE deleteDateTime IS NULL AND libraryIndex =" +
      mysql.escape(library_index) +
      "GROUP BY libraryIndex;";

    db.db_connect.query(query, async function (err, results) {
      // 쿼리 메서드 실패
      const fail = await queryFail(err, ip, query);
      if (fail.state === "mysql 사용실패") {
        db_connect.rollback();
        return { state: "mysql 사용실패" };
      }
      // 쿼리문 메서드 성공
      await querySuccessLog(ip, query);
      // 유저가 요청한 인덱스의 도서관 정보가 존재하지 않을 때
      if (results[0] === undefined) {
        db_connect.rollback();
        return { state: "존재하지않는정보" };
      }
      // 유저가 요청한 도서관 정보가 존재할 때
      db_connect.commit();
      return { state: "상세도서관정보", data: results };
    });
  });
}

module.exports = {
  userLibModel: userLibModel,
  registerMyLibModel: registerMyLibModel,
  deleteMyLibModel: deleteMyLibModel,
  allLibModel: allLibModel,
  localLibModel: localLibModel,
  particularLibModel: particularLibModel,
};

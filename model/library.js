// 필요모듈
const mysql = require("mysql");
const db = require("../a_mymodule/db");
const moment = require("../a_mymodule/date_time");

// 유저 관심도서관
function userLib(user_index, ip) {
  // 해당 유저가 관심도서관으로 등록한 도서관 정보 가져오기
  let query =
    "SELECT libIndex,libName,libType,closeDay,openWeekday,endWeekday,openSaturday,endSaturday,openHoliday,endHoliday,nameOfCity,districts,address,libContact FROM LIBRARY LEFT JOIN userLib ON LIBRARY.libIndex = userLib.userLib WHERE LIBRARY.deleteDate IS NULL AND userLib.deleteDate IS NULL AND userIndex=" +
    mysql.escape(user_index);
  // 쿼리문 실행
  db.db_connect.query(query, function (err, results) {
    if (err) {
      console.log(("model-userLib 메서드 mysql 모듈사용 실패:" + err).red.bold);
      return { state: "mysql 사용실패" };
    }
    console.log(("CLIENT IP: " + ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + query).blue.bold);
    return { state: "유저의관심도서관", data: results };
  });
}

module.exports = { userLib: userLib };

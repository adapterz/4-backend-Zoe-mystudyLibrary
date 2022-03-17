// const lib_request = require("request");
// const db = require("./db");
// const { queryFail, querySuccessLog } = require("./const");
// const { db_connect } = require("./db");
// const mysql = require("mysql");
//
// // request 옵션
// const default_options = {
//   method: "GET",
//   url: "http://api.data.go.kr/openapi/tn_pubr_public_lbrry_api?serviceKey=dzgTW9lop64rX2OX7avlDecm%2Fv8Vy5toFBvrU6GbKriq6t9H2xMgiaWeFf3FH0CWIivTA%2FpiUgOkfmvtejKANA%3D%3D&type=json&numOfRows=3457",
//   header: {},
// };
// async function library_request() {
//   // 도서관 데이터 insert 할 쿼리문
//   let lib_query = "";
//   // 페이지마다 데이터 가져오기
//   //for (let current_page = 1; exit === false; ++current_page) {
//   // 페이지마다 데이터를 가져오기 위한 option의 url 설정
//   // let current_options = default_options;
//   //current_options.url += current_page;
//   //console.log(current_options.url);
//   // 배열에 도서관 데이터 저장
//   lib_request(default_options, async function (err, response, body) {
//     if (err) throw new Error(err);
//     // body 정보 가져오기
//     const info = await JSON.parse(body);
//     // // 현재 페이지가 전체 페이지 수보다 크면 반복문 종료
//     // if (current_page > total_page) {
//     //   exit = true;
//     //   return;
//     // }
//     for (const index in info["response"]["body"]["items"]) {
//       // 해당 로우의 데이터 컬럼값들 저장
//       const library_name = info["response"]["body"]["items"][index]["lbrryNm"];
//       const name_of_city = info["response"]["body"]["items"][index]["ctprvnNm"];
//       const districts = info["response"]["body"]["items"][index]["signguNm"];
//       const library_type = info["response"]["body"]["items"][index]["lbrrySe"];
//       const close_day = info["response"]["body"]["items"][index]["closeDay"];
//       const open_weekday = info["response"]["body"]["items"][index]["weekdayOperOpenHhmm"];
//       const close_weekday = info["response"]["body"]["items"][index]["weekdayOperColseHhmm"];
//       const open_saturday = info["response"]["body"]["items"][index]["satOperOperOpenHhmm"];
//       const close_saturday = info["response"]["body"]["items"][index]["satOperCloseHhmm"];
//       const open_holiday = info["response"]["body"]["items"][index]["holidayOperOpenHhmm"];
//       const close_holiday = info["response"]["body"]["items"][index]["holidayCloseOpenHhmm"];
//       const address = info["response"]["body"]["items"][index]["rdnmadr"];
//       const library_contact = info["response"]["body"]["items"][index]["phoneNumber"];
//
//       // 해당 로우 추가해주는 쿼리 명령어 추가
//       lib_query =
//         "INSERT INTO LIBRARY(libraryName,libraryType,closeDay,openWeekday,endWeekday,openSaturday,endSaturday,openHoliday,endHoliday,nameOfCity,districts,address,libraryContact) VALUES (" +
//         mysql.escape(library_name) +
//         "," +
//         mysql.escape(library_type) +
//         "," +
//         mysql.escape(close_day) +
//         "," +
//         mysql.escape(open_weekday) +
//         "," +
//         mysql.escape(close_weekday) +
//         "," +
//         mysql.escape(open_saturday) +
//         "," +
//         mysql.escape(close_saturday) +
//         "," +
//         mysql.escape(open_holiday) +
//         "," +
//         mysql.escape(close_holiday) +
//         "," +
//         mysql.escape(name_of_city) +
//         "," +
//         mysql.escape(districts) +
//         "," +
//         mysql.escape(address) +
//         "," +
//         mysql.escape(library_contact) +
//         ");";
//     }
//     // 데이터 넣는 반복문 종료 후 데이터가 잘 들어왔는지 로그 찍어보기
//     function delay(ms) {
//       return new Promise((resolve) => setTimeout(resolve, ms));
//     }
//     await delay(5000);
//     await console.log(lib_query);
//     await db.db_connect.beginTransaction();
//     await db.db_connect.query(lib_query, async function (err, results) {
//       const fail = await queryFail(err, null, lib_query);
//       if (fail.state === "mysql 사용실패") {
//         db_connect.rollback();
//         return { state: "mysql 사용실패" };
//       }
//       // 쿼리문 메서드 성공
//       await querySuccessLog(null, lib_query);
//       // 테이블에 도서관 정보 넣기 성공
//       db_connect.commit();
//       // 데이터가 잘 넣어졌는지 로그 찍어보기
//       console.log(results);
//     });
//     db.db_connect.release();
//   });
//
//   //await insert_library_data(query);
// }
//
// module.exports = { library_request: library_request };

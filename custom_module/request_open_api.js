// 공공데이터 OPEN API 에서 전국 도서관정보 가져오는 모듈
const lib_request = require("request");
const db = require("./db");
const { querySuccessLog, queryFail } = require("./query_log");

// 공공데이터 요청
async function reqOpenData() {
  let info;
  await db.pool.query("START TRANSACTION");
  // 해당 공공데이터 api 총 페이지 수가 346 개라서 346번 반복문 돌려주기
  for (let page = 1; page <= 346; ++page) {
    const libList = [];
    // 해당 페이지 JSON 데이터 js 객체로 변환하고 libList 에 해당 로우 배열로 추가
    info = JSON.parse(await requestData(page));
    console.log(info);
    for (const index in info["response"]["body"]["items"]) {
      // 해당 로우의 데이터 컬럼값들 저장
      const library_name = info["response"]["body"]["items"][index]["lbrryNm"];
      const name_of_city = info["response"]["body"]["items"][index]["ctprvnNm"];
      const districts = info["response"]["body"]["items"][index]["signguNm"];
      const library_type = info["response"]["body"]["items"][index]["lbrrySe"];
      const close_day = info["response"]["body"]["items"][index]["closeDay"];
      const open_weekday = info["response"]["body"]["items"][index]["weekdayOperOpenHhmm"];
      const close_weekday = info["response"]["body"]["items"][index]["weekdayOperColseHhmm"];
      const open_saturday = info["response"]["body"]["items"][index]["satOperOperOpenHhmm"];
      const close_saturday = info["response"]["body"]["items"][index]["satOperCloseHhmm"];
      const open_holiday = info["response"]["body"]["items"][index]["holidayOperOpenHhmm"];
      const close_holiday = info["response"]["body"]["items"][index]["holidayCloseOpenHhmm"];
      const address = info["response"]["body"]["items"][index]["rdnmadr"];
      const library_contact = info["response"]["body"]["items"][index]["phoneNumber"];
      libList.push([
        library_name,
        library_type,
        close_day,
        open_weekday,
        close_weekday,
        open_saturday,
        close_saturday,
        open_holiday,
        close_holiday,
        name_of_city,
        districts,
        address,
        library_contact,
      ]);
    }
    // 도서관 배열 정보 query문으로 추가해줄 메서드에 전달
    if (libList.length > 0) {
      await queryData([libList]);
    }
  }

  await db.pool.query("COMMIT");
}
// 페이지 단위로 공공데이터 가져오기
async function requestData(page) {
  let libList = [];
  const default_options = {
    method: "GET",
    url:
      "http://api.data.go.kr/openapi/tn_pubr_public_lbrry_api?serviceKey=dzgTW9lop64rX2OX7avlDecm%2Fv8Vy5toFBvrU6GbKriq6t9H2xMgiaWeFf3FH0CWIivTA%2FpiUgOkfmvtejKANA%3D%3D&type=json&pageNo=" +
      page,
    header: {},
  };

  return new Promise(function (resolve, reject) {
    lib_request(default_options, function (error, res, body) {
      try {
        resolve(body);
      } catch (error) {
        reject(error);
      }
    });
  });
}
// DB에 배열에 저장된 도서관정보 전달해줄 메서드
async function queryData([values]) {
  const query =
    "INSERT INTO LIBRARY(libraryName,libraryType,closeDay,openWeekday,endWeekday,openSaturday,endSaturday,openHoliday,endHoliday,nameOfCity,districts,address,libraryContact) VALUES ?";
  try {
    const [postLibraryRow] = await db.pool.query(query, [values]);
    await querySuccessLog(null, query);
    return postLibraryRow;
  } catch (err) {
    // 쿼리문 실행시 에러발생
    await queryFail(err, null, query);
    await db.pool.query("ROLLBACK");
  }
}

module.exports = { reqOpenData: reqOpenData };

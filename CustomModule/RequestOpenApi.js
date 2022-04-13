// 공공데이터 OPEN API 에서 전국 도서관정보 가져오는 모듈
// 외장모듈
import request from "request";
// 내장모듈
import { myPool } from "./Db";
const { querySuccessLog, queryFailLog } = require("./QueryLog");

// 공공데이터 요청
export async function reqOpenData() {
  let info;
  // 해당 공공데이터 api 총 페이지 수가 346 개라서 346번 반복문 돌려주기
  for (let page = 1; page <= 346; ++page) {
    const libList = [];
    // 해당 페이지 JSON 데이터 js 객체로 변환하고 libList 에 해당 로우 배열로 추가
    info = JSON.parse(await requestData(page));
    console.log(info);
    for (const index in info["response"]["body"]["items"]) {
      // 해당 로우의 데이터 컬럼값들 저장
      const libraryName = info["response"]["body"]["items"][index]["lbrryNm"];
      const nameOfCity = info["response"]["body"]["items"][index]["ctprvnNm"];
      const districts = info["response"]["body"]["items"][index]["signguNm"];
      const closeDay = info["response"]["body"]["items"][index]["closeDay"];
      const openWeekday = info["response"]["body"]["items"][index]["weekdayOperOpenHhmm"];
      const closeWeekday = info["response"]["body"]["items"][index]["weekdayOperColseHhmm"];
      const openSaturday = info["response"]["body"]["items"][index]["satOperOperOpenHhmm"];
      const closeSaturday = info["response"]["body"]["items"][index]["satOperCloseHhmm"];
      const openHoliday = info["response"]["body"]["items"][index]["holidayOperOpenHhmm"];
      const closeHoliday = info["response"]["body"]["items"][index]["holidayCloseOpenHhmm"];
      const address = info["response"]["body"]["items"][index]["rdnmadr"];
      const libraryContact = info["response"]["body"]["items"][index]["phoneNumber"];
      // 도서관 종류 정수로 치환
      let libraryType = info["response"]["body"]["items"][index]["lbrrySe"];
      if (info["response"]["body"]["items"][index]["lbrrySe"] === "작은도서관") libraryType = 0;
      if (info["response"]["body"]["items"][index]["lbrrySe"] === "공공도서관") libraryType = 1;
      if (info["response"]["body"]["items"][index]["lbrrySe"] === "어린이도서관") libraryType = 2;
      if (info["response"]["body"]["items"][index]["lbrrySe"] === "전문도서관") libraryType = 3;
      if (info["response"]["body"]["items"][index]["lbrrySe"] === "대학도서관") libraryType = 4;
      if (info["response"]["body"]["items"][index]["lbrrySe"] === "학교도서관") libraryType = 5;

      libList.push([
        libraryName,
        libraryType,
        closeDay,
        openWeekday,
        closeWeekday,
        openSaturday,
        closeSaturday,
        openHoliday,
        closeHoliday,
        nameOfCity,
        districts,
        address,
        libraryContact,
      ]);
    }
    // 도서관 배열 정보 query문으로 추가해줄 메서드에 전달
    if (libList.length > 0) {
      await queryData([libList]);
    }
  }
}
// 페이지 단위로 공공데이터 가져오기
async function requestData(page) {
  const default_options = {
    method: "GET",
    url:
      "http://api.data.go.kr/openapi/tn_pubr_public_lbrry_api?serviceKey=dzgTW9lop64rX2OX7avlDecm%2Fv8Vy5toFBvrU6GbKriq6t9H2xMgiaWeFf3FH0CWIivTA%2FpiUgOkfmvtejKANA%3D%3D&type=json&pageNo=" +
      page,
    header: {},
  };

  return new Promise(function (resolve, reject) {
    request(default_options, function (error, res, body) {
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
    const [postLibraryRow] = await myPool.query(query, [values]);
    await querySuccessLog(null, query);
    return postLibraryRow;
  } catch (err) {
    // 쿼리문 실행시 에러발생
    await queryFailLog(err, null, query);
  }
}

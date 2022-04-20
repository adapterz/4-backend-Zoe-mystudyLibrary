// 외장모듈
import axios from "axios";
import cheerio from "cheerio";
// 내장모듈
import { myPool } from "../CustomModule/Db";
import { modelFailLog, modelSuccessLog } from "./QueryLog";
import mysql from "mysql2/promise";

// 해당 url html 파일 가져오기 (성공을 위한 명언 50가지)
async function getHtml() {
  try {
    return await axios.get("https://agibbyeongari.tistory.com/141");
  } catch (error) {
    console.error(error);
  }
}

// html 파싱해서 데이터 wiseSayingData에 넣기
export async function getScraping() {
  getHtml()
    .then((html) => {
      const $ = cheerio.load(html.data);
      // 배열 구조 - [명언,명언을 말한사람]
      const wiseSayingData = [];
      for (let i = 0; i < 23; ++i) {
        wiseSayingData.push([
          $(`#content > div.inner > div.entry-content > div > p:nth-child(${9 + 4 * i})`)
            .text()
            .substring(3),
          $(`#content > div.inner > div.entry-content > div > p:nth-child(${11 + 4 * i})`).text(),
        ]);
      }
      for (let i = 0; i < 27; ++i) {
        wiseSayingData.push([
          $(`#content > div.inner > div.entry-content > div > p:nth-child(${107 + 4 * i})`)
            .text()
            .substring(3),
          $(`#content > div.inner > div.entry-content > div > p:nth-child(${109 + 4 * i})`).text(),
        ]);
      }
      return wiseSayingData;
    })
    .then(async (res) => {
      // 명언 배열에 있는 정보 DB에 넣기
      let query = "";
      for (let index in res) {
        query +=
          "INSERT INTO wiseSaying(wiseSayingContent,celebrity) VALUES (" +
          mysql.escape(res[index][0]) +
          "," +
          mysql.escape(res[index][1]) +
          ");";
      }
      try {
        await myPool.query(query);
        await modelSuccessLog(null, query);
      } catch (err) {
        await modelFailLog(err, null, query);
      }
    });
}

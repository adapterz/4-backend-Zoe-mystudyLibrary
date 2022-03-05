// 홈화면의 라우터의 컨트롤러
// 로그인돼있는 예시 회원정보
const db = require("../a_mymodule/db");
const moment = require("../a_mymodule/date_time");
const mysql = require("mysql");
const user = {
  id: "Zoe",
  nickName: "Zoe",
  userIndex: 1312,
};
// 최신글 정보가져오기
const getRecentPost = function (req, res) {
  // 최신글 자유게시판 글 5개/공부인증샷 글 4개 불러오기
  const query =
    "SELECT postTitle,nickName,hits,favorite FROM BOARDS WHERE category = ? order by boardIndex DESC limit 5;" +
    "SELECT postTitle,nickName,hits,favorite FROM BOARDS WHERE category = ? order by boardIndex DESC limit 4;";
  db.db_connect.query(query, ["자유게시판", "공부인증샷"], function (err, results) {
    // 오류발생
    if (err) {
      console.log(("getRecentPost 메서드 mysql 모듈사용 실패:" + err).red.bold);
      return res.status(500).json({ state: "getRecentPost 메서드 mysql 모듈사용 실패:" + err });
    }
    // 쿼리문 정상적으로 실행
    console.log(("CLIENT IP: " + req.ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + query).blue.bold);
    return res.status(200).json(results);
  });
};

// 내 관심도서관(adj_lib 코드 작성 후 구현)
const myLib = function (req, res) {
  // 로그인이 안 돼있을 때
  if (user.id === null) return res.status(401).json({ state: "인증되지 않은 사용자입니다." });
  // 내 관심도서관 문자열 가져오기 ex. myLib = 늘푸른도서관index(숫자);123123;3634523;3432; <이런형태
  let myLib_string;
  let query = "SELECT userLib FROM USER WHERE id=? ";
  // 쿼리문 실행
  db.db_connect.query(query, [user.id], function (err, results) {
    if (err) {
      console.log(("myLib 메서드 mysql 모듈사용 실패:" + err).red.bold);
      return res.status(500).json({ state: "myLib 메서드 mysql 모듈사용 실패:" + err });
    }
    console.log(("CLIENT IP: " + req.ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + query).blue.bold);
    // myLib_string = results;
  });

  let myLib_split = myLib_string.split(";");
  // WHERE 조건문에 파싱한 libIndex 조건들 추가해주기
  query =
    "SELECT libIndex,libName,libType,closeDay,timeWeekday,timeSaturday,timeHoliday,grade,address,libContact,nameOfCity,districts FROM LIBRARY WHERE libIndex=";
  let split_query = mysql.escape(myLib_split[0]);
  const arr_size = myLib_split.length;
  for (let cnt = 1; cnt < arr_size; ++cnt) {
    split_query += "OR libIndex =";
    split_query += mysql.escape(myLib_split[cnt]);
  }
  query += mysql.escape(split_query);

  // 내가 관심있어하는 도서관 정보보기
  db.db_connect.query(query, function (err, results) {
    if (err) {
      console.log(("myLib 메서드 mysql 모듈사용 실패:" + err).red.bold);
      return res.status(500).json({ state: "myLib 메서드 mysql 모듈사용 실패:" + err });
    }
    console.log(("CLIENT IP: " + req.ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + query).blue.bold);

    // 성공적으로 리턴
    return res.status(200).json(results);
  });
};
// 모듈화
module.exports = {
  getRecentPost: getRecentPost,
  myLib: myLib,
};

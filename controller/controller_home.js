// 홈화면의 라우터의 컨트롤러
// 로그인돼있는 예시 회원정보
const db = require("../a_mymodule/db");
const moment = require("../a_mymodule/date_time");
const mysql = require("mysql");
const user = {
  id: "Zoe",
  nickName: "Zoe",
  userIndex: 123123,
};
// 최신글 정보가져오기
const getRecentPost = function (req, res) {
  // 최신글 자유게시판 글 5개/공부인증샷 글 4개 불러오기
  const query =
    "SELECT postTitle,nickName,hits,favorite FROM BOARDS LEFT JOIN USER ON BOARDS.userIndex=user.userIndex WHERE BOARDS.deleteDate IS NULL AND category = ? order by boardIndex DESC limit 5;" +
    "SELECT postTitle,nickName,hits,favorite FROM BOARDS LEFT JOIN USER ON BOARDS.userIndex=user.userIndex WHERE BOARDS.deleteDate IS NULL AND category = ? order by boardIndex DESC limit 4;";
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
  if (user.userIndex === null) return res.status(401).json({ state: "인증되지 않은 사용자입니다." });
  // 해당 유저가 관심도서관으로 등록한 도서관 정보 가져오기
  let query =
    "SELECT libIndex,libName,libType,closeDay,openWeekday,endWeekday,openSaturday,endSaturday,openHoliday,endHoliday,nameOfCity,districts,address,libContact FROM library LEFT JOIN userLib ON LIBRARY.libIndex = userLib.userLib WHERE LIBRARY.deleteDate IS NULL AND userLib.deleteDate IS NULL AND userIndex=" +
    mysql.escape(user.userIndex);
  // 쿼리문 실행
  db.db_connect.query(query, function (err, results) {
    if (err) {
      console.log(("myLib 메서드 mysql 모듈사용 실패:" + err).red.bold);
      return res.status(500).json({ state: "myLib 메서드 mysql 모듈사용 실패:" + err });
    }
    console.log(("CLIENT IP: " + req.ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + query).blue.bold);
    return res.status(200).json(results);
  });
};
// 모듈화
module.exports = {
  getRecentPost: getRecentPost,
  myLib: myLib,
};

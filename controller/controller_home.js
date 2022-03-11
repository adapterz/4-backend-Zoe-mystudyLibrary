// 홈화면의 라우터의 컨트롤러
// 로그인돼있는 예시 회원정보
const db = require("../a_mymodule/db");
const moment = require("../a_mymodule/date_time");
const mysql = require("mysql");
// 모델
const post_model = require("../model/post");
const user = {
  id: "Zoe",
  nickName: "Zoe",
  userIndex: 123123,
};
// 최신글 정보가져오기
const getRecentPost = function (req, res) {
  // 최신글 자유게시판 글 5개/공부인증샷 글 4개 불러오는 모델
  const model_results = post_model.getRecentPostModel(req.ip);
  /* TODO 비동기 공부 후 다시작성
  if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results.state);
  else if (model_results.state === "최신글정보") return res.status(200).json(model_results.data);
  
   */
};

// 내 관심도서관(adj_lib 코드 작성 후 구현)
const myLib = function (req, res) {
  const login_cookie = req.signedCookies.user;
  // 로그인 여부 검사
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 해당 유저가 관심도서관으로 등록한 도서관 정보 가져오기
  let query =
    "SELECT libIndex,libName,libType,closeDay,openWeekday,endWeekday,openSaturday,endSaturday,openHoliday,endHoliday,nameOfCity,districts,address,libContact FROM LIBRARY LEFT JOIN userLib ON LIBRARY.libIndex = userLib.userLib WHERE LIBRARY.deleteDate IS NULL AND userLib.deleteDate IS NULL AND userIndex=" +
    mysql.escape(login_cookie);
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

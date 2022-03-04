// 홈화면의 라우터의 컨트롤러
// 로그인돼있는 예시 회원정보
const db = require("../a_mymodule/db");
const moment = require("../a_mymodule/date_time");
const user = {
  nickName: "Zoe",
  userIndex: 1312,
};
// 최신글 정보가져오기
const getRecentPost = function (req, res) {
  // 최신글 자유게시판 글 5개/공부인증샷 글 4개 불러오기
  const query =
    "SELECT postTitle,nickName,hits,like FROM BOARDS WHERE category = ? order by boardIndex DESC limit 0,5;" +
    "SELECT postTitle,nickName,hits,like FROM BOARDS WHERE category = ? order by boardIndex DESC limit 0,4;";
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
// TODO 로그인 기능/파싱 배우고 다시작성
// 내가 관심도서관으로 등록한 도서관 정보
const myLibData = function (req, res) {
  // 로그인이 안 돼있을 때
  if (user.id === null) return res.status(401).json({ state: "해당 기능을 이용하기 위해서는 로그인이 필요합니다." });
  // 해당 유저의 관심도서관 정보 가져오기
  const query = "SELECT userLib FROM USER WHERE id = ?";

  db.db_connect.query(query, [user.id], function (err, results) {
    // 오류발생
    if (err) {
      console.log(("myLibData 메서드 mysql 모듈사용 실패:" + err).red.bold);
      return res.status(500).json({ state: "myLibData 메서드 mysql 모듈사용 실패:" + err });
    }
    // 정상적으로 쿼리문 실행
    console.log(("CLIENT IP: " + req.ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + query).blue.bold);
    return res.status(200).json(results);
  });
};

// 모듈화
module.exports = {
  getRecentPost: getRecentPost,
  myLibData: myLibData,
};

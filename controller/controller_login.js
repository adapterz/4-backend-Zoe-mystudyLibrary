// 로그인화면의 라우터의 컨트롤러
// 예시 유저 정보
const db = require("../a_mymodule/db");
const moment = require("../a_mymodule/date_time");
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const { encryption } = require("../a_mymodule/crypto");
const user = {
  id: "Zoe",
  nickName: "Zoe",
  userIndex: 123123,
};

// 로그인
const login = function (req, res) {
  const login_cookie = req.signedCookies.user;
  // 기존에 로그인 돼있을 때
  if (login_cookie) return res.status(409).json({ state: "이미 로그인했습니다." });
  // 유저가 입력한 정보 가져오기
  const query = "SELECT userIndex,id,pw,name,gender,phoneNumber,nickName,profileShot FROM USER WHERE id = " + mysql.escape(req.body.id);
  // 쿼리문 실행
  db.db_connect.query(query, function (err, results) {
    if (err) {
      console.log(("login 메서드 mysql 모듈사용 실패:" + err).red.bold);
      return res.status(500).json({ state: "login 메서드 mysql 모듈사용 실패:" + err });
    }
    console.log(("CLIENT IP: " + req.ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + query).blue.bold);

    // 1. 존재하는 아이디가 없을 때
    if (results[0] === undefined) return res.status(404).json({ state: "존재하는 id가 없습니다." });
    // 2. 등록된 유저 pw와 입력한 pw가 다르면 로그인 실패
    const hashed_pw = encryption(req.body.pw);
    console.log(hashed_pw);
    if (!bcrypt.compare(hashed_pw, results[0].pw)) return res.status(400).json({ state: "비밀번호가 일치하지 않습니다." });

    // 로그인 성공
    req.session.login = true;
    req.session.userIndex = results[0].userIndex;
    const user_info = {
      id: results[0].id,
      name: results[0].name,
      gender: results[0].gender,
      phoneNumber: results[0].phoneNumber,
      nickName: results[0].nickName,
      profileShot: results[0].profileShot,
    };
    res.cookie("user", user_info, { expires: new Date(Date.now() + 1000 * 60 * 60), httpOnly: true, signed: true });
    return res.status(200).json({ login: true });
  });
};
// 로그아웃
const logout = function (req, res) {
  const login_cookie = req.signedCookies.user;
  // 기존에 로그인 돼있을 때
  if (login_cookie) {
    req.session.destroy();
    res.clearCookie("user");
    res.status(200).json({ state: "로그아웃" });
  }
  if (!login_cookie) {
    res.status(401).json({ state: "기존에 로그인 되어있지 않습니다." });
  }
};
// 모듈화
module.exports = {
  login: login,
  logout: logout,
};

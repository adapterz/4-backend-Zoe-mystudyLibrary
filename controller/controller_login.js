// 로그인화면의 라우터의 컨트롤러
// 예시 유저 정보
const db = require("../a_mymodule/db");
const moment = require("../a_mymodule/date_time");
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const { encryption } = require("../a_mymodule/crypto");
const login_model = require("../model/login");
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
  // 로그인 모델
  const model_results = login_model.loginModel(req.body, req.ip);
  // 로그인 모델 결과에 따라 분기처리
  /* TODO 비동기 배운 후 적용
  if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
  else if (model_results.state === "일치하는 id 없음") return res.status(404).json(model_results);
  else if (model_results.state === "비밀번호 불일치") return res.status(400).json(model_results);
  else if (model_results.state === "로그인성공") {
    req.session.login = true;
    req.session.userIndex = model_results.userIndex;
    res.cookie("user", model_results.userIndex, { expires: new Date(Date.now() + 1000 * 60 * 60), httpOnly: true, signed: true });
    return res.status(200).json({ login: true });
  }

   */
};
// 로그아웃
const logout = function (req, res) {
  const login_cookie = req.signedCookies.user;
  console.log(login_cookie);
  // 기존에 로그인 돼있을 때
  if (login_cookie) {
    req.session.destroy(function (err) {});
    res.clearCookie("user");
    res.status(200).json({ state: "로그아웃" });
  }
  if (login_cookie) {
    res.status(401).json({ state: "기존에 로그인 되어있지 않습니다." });
  }
};
// 모듈화
module.exports = {
  login: login,
  logout: logout,
};

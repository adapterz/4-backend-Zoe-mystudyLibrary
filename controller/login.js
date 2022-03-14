// 로그인화면의 라우터의 컨트롤러
const login_model = require("../model/login");
// 로그인
const login = function (req, res) {
  /*
  req.body
    id: 아이디
    pw: 비밀번호
   */
  // 기존에 로그인 돼있을 때
  const login_cookie = req.signedCookies.user;
  if (login_cookie) return res.status(409).json({ state: "이미 로그인했습니다." });
  // 로그인 모델 실행 결과
  const model_results = login_model.loginModel(req.body, req.ip);
  // 로그인 모델 실행 결과에 따라 분기처리
  /* TODO 비동기 배운 후 적용
  // mysql query 메서드 실패
  if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
  // DB에 해당 사용자가 로그인 요청한 id가 없을 때
  else if (model_results.state === "일치하는 id 없음") return res.status(404).json(model_results);
  // 존재하는 id는 있으나 id에 대한 요청 pw가 일치하지 않을 때
  else if (model_results.state === "비밀번호 불일치") return res.status(400).json(model_results);
  // 성공적으로 로그인 요청 수행
  else if (model_results.state === "로그인성공") {
  // 로그인세션, 쿠키
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
  // 기존에 로그인 돼있을 때 성공적으로 로그아웃 요청 수행
  if (login_cookie) {
    req.session.destroy(function (err) {});
    res.clearCookie("user");
    res.status(200).json({ state: "로그아웃" });
  }
  // 기존에 로그인이 돼있지 않을 때 로그아웃 요청은 올바르지 않은 요청
  if (login_cookie) {
    res.status(401).json({ state: "기존에 로그인 되어있지 않습니다." });
  }
};
// 모듈화
module.exports = {
  login: login,
  logout: logout,
};

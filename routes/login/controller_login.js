// 로그인화면의 라우터의 컨트롤러
// 비즈니스 로직 객체
const service_user = require("/service/user");
// 해당 라우터에서 get 요청을 받았을 때
const get_login = function (req, res) {
  res.send("로그인 창");

  console.log("/login");
};

// 로그인
const login = function (req, res) {
  const body = req.body;
  // body 프로퍼티 임시로 정의(나중에 데이터 가져올 떄 코드 다시 짜주기)
  body.pw = undefined;

  service_user.Login(body.id.toString(), body.pw.toString());

  res.end();
};
module.exports = {
  get_login: get_login,
  login: login,
};

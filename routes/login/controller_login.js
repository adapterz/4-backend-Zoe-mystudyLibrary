// 로그인화면의 라우터의 컨트롤러
// 비즈니스 로직 객체
const service_user = require("/service/user");
// 해당 라우터에서 get 요청을 받았을 때(기본화면)
const get_login = function (req, res) {
  res.send("로그인 창");
};

// 로그인
const login = function (req, res) {
  const body = req.body;
  // body 프로퍼티 임시로 정의(나중에 데이터 가져올 떄 코드 다시 짜주기)
  body.pw = undefined;

  // 로그인 성공 여부
  const is_login = service_user.Login(body.id.toString(), body.pw.toString());
  // return 값에 따라 분기처리
  if (is_login === 0) res.send("ID가 존재하지 않습니다.");
  else if (is_login === 1) res.send("비밀번호가 일치하지 않습니다.");
  else if (is_login === 2) res.send("로그인 성공");
  else res.end();
};
module.exports = {
  get_login: get_login,
  login: login,
};

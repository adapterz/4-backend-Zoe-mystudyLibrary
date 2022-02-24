// 로그인화면의 라우터의 컨트롤러
// 비즈니스 로직 객체
const model_user = require("/model/user");
// 해당 라우터에서 get 요청을 받았을 때(기본화면)
const get_login = function (req, res) {
  res.status(200).send("로그인 창");
};

// 로그인
const login = function (req, res) {
  const body = req.body;
  // body 프로퍼티 임시로 정의(나중에 데이터 가져올 떄 코드 다시 짜주기)
  body.pw = null;

  // 로그인 성공 여부
  const can_login = model_user.Login(body.id.toString(), body.pw.toString());
  // return 값에 따라 분기처리
  if (!can_login) res.status(401).send("로그인실패");
  else if (can_login) res.status(200).send("로그인 성공");
};

// 모듈화
module.exports = {
  get_login: get_login,
  login: login,
};

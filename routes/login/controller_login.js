// 로그인화면의 라우터의 컨트롤러
// 모델 객체
const model_user = require("/model/user");

// 해당 라우터에서 get 요청을 받았을 때(기본화면)
const get_login = function (req, res) {
  res.status(200).send("로그인 창");
};

// 로그인
const login = function (req, res) {
  // 로그인 입력 정보 가져오기
  const body = req.body;

  // 로그인 성공 여부
  const can_login = model_user.Login(body.id.toString(), body.pw.toString());
  // 로그인 실패
  if (!can_login) res.status(401).send("로그인실패");
  // 로그인 후 홈화면으로 가기
  else if (can_login) res.status(200).redirect("/");
};

// 모듈화
module.exports = {
  get_login: get_login,
  login: login,
};

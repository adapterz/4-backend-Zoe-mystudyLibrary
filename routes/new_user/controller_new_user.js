// 회원가입 화면의 라우터의 컨트롤러
// 비즈니스 로직 객체
const service_user = require("/service/user");

// 해당 라우터에서 get 요청을 받았을 때(기본화면)
const get_new_user = function (req, res) {
  res.send("회원가입");

  console.log("/new_user");
};

// 회원가입 요청
const sign_up = function (req, res) {
  const body = req.body;
  // 프로퍼티 임시로 정의(나중에 데이터 가져올 떄 코드 다시 짜주기)
  body.phone_num = undefined;
  body.gender = undefined;
  body.confirm_pw = undefined;

  service_user.SignUp(
    body.id.toString(),
    body.pw.toString(),
    body.confirm_pw.toString(),
    body.name.toString(),
    body.gender.toString(),
    body.phone_num.toString()
  );

  res.end();
};

module.exports = {
  get_new_user: get_new_user,
  sign_up: sign_up,
};

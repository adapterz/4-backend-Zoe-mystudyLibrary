// 내 정보 라우터의 컨트롤러
// 모델 객체
const model_user = require("/model/user");

// 해당 라우터에서 get 요청을 받았을 때(기본 화면)
const get_user = function (req, res) {
  res.status(200).send("내정보창");
};

// 비밀번호 수정(get)
const get_revise_pw = function (req, res) {
  res.status(200).send("비밀번호변경창");
};

// 비밀번호 수정(patch)
const patch_revise_pw = function (req, res) {
  // 입력된 비밀번호 정보 가져오기
  const new_user_data = req.body;
  // 비밀번호 변경
  model_user.revise_pw(
    new_user_data.pw.toString(),
    new_user_data.confirm_pw.toString()
  );
  // 상태코드
  res.send(200).send("비밀번호 변경 성공");
};

// 모듈화
module.exports = {
  get_user: get_user,
  get_revise_pw: get_revise_pw,
  patch_revise_pw: patch_revise_pw,
};

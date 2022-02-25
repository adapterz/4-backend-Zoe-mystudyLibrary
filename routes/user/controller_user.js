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
// 고민: 자동입력방지 문자는 어떻게하지...?
const patch_revise_pw = function (req, res) {
  // 기존 유저 정보 가져오기(DB배우고 수정)
  const user_data = null;

  // 입력된 비밀번호 정보 가져오기
  const new_user_data = req.body;
  // 임시 필드 생성(나중에 수정)
  new_user_data.new_pw = undefined;

  // 비밀번호 변경
  model_user.revise_pw(
    user_data.pw.toString(),
    new_user_data.new_pw.toString(),
    new_user_data.confirm_pw.toString(),
    user_data.ID.toString()
  );

  // 상태코드
  res.send(200).send("비밀번호 변경 성공");
};

//

// 모듈화
module.exports = {
  get_user: get_user,
  get_revise_pw: get_revise_pw,
  patch_revise_pw: patch_revise_pw,
};

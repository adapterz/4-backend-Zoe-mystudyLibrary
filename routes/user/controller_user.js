// 내 정보 라우터의 컨트롤러
// 모델 객체
const model_user = require("/model/user");

// 해당 라우터에서 get 요청을 받았을 때(기본 화면)
const get_user = function (req, res) {
  res.status(200).send("내정보창");
};
// 내 프로필(get)
const get_profile = function (req, res) {
  res.status(200).send("내프로필창");
};

// 내 프로필 수정(patch)
const patch_profile = function (req, res) {
  // 기존 유저 정보 가져오기(DB배우고 수정)
  const user_data = null;

  // 입력된 프로필 정보 가져오기
  const new_user_data = req.body;

  // 프로필 정보 변경
  model_user.revise_profile(
    new_user_data.profile_shot,
    new_user_data.nickname,
    user_data.id
  );

  // 내정보창으로 이동
  res.status(200).redirect("/user");
};

// 연락처 및 회원 정보 창(get)
const get_user_data = function (req, res) {
  res.status(200).send("내회원정보창");
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

  // 내정보창으로 이동
  res.send(200).redirect("/user");
};

//

// 모듈화
module.exports = {
  get_user: get_user,
  get_profile: get_profile,
  patch_profile: patch_profile,
  get_user_data: get_user_data,
  get_revise_pw: get_revise_pw,
  patch_revise_pw: patch_revise_pw,
};

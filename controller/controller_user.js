// 내 정보 라우터의 컨트롤러
const user_model = require("../model/user");
// 예시정보
const user = {
  userIndex: 1,
  id: "syjg1234",
  password: "hassing_pw1",
  name: "Zoe",
  gender: "여",
  phoneNumber: "01028400631",
  salt: "1234#",
  nickName: null,
  profileShot: null,
};
// 내 프로필 수정
const reviseProfile = function (req, res) {
  const login_cookie = req.signedCookies.user;
  // 로그인 여부 검사
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });

  // 입력된 새 프로필 정보 수정 요청
  const new_profile = req.body;
  // 프로필 수정 모델
  let model_results = user_model.reviseProfileModel(new_profile, req.ip, login_cookie);
  /* 비동기 배운 후 적용
  console.log(model_results);
  if (model_results === "mysql 사용실패") return res.status(500).json({ state: model_results });
  else if (model_results === "중복닉네임") return res.status(400).json({ state: model_results });
  else if (model_results === "프로필변경성공") return res.status(200).end({ state: model_results });
   */
};

// 회원정보 수정(연락처 수정)
const revisePhoneNumber = function (req, res) {
  const login_cookie = req.signedCookies.user;
  // 로그인 여부 검사
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 새 개인정보 정보 수정해줄 쿼리문
  const new_contact = req.body;
  // 연락처 수정 모델
  const model_results = user_model.revisePhoneNumberModel(new_contact, req.ip, login_cookie);
  // TODO 비동기 배운후 적용
  // if(model_results === "mysql 사용실패") return res.status(500).json({state: model_results});
  // if(model_results === "연락처변경성공") return res.status(400).json({state:model_results});
};

// 비밀번호 수정(patch)
const revisePw = function (req, res) {
  /*
  body : oldPw/newPw/confirmPw
   */

  const login_cookie = req.signedCookies.user;
  // 로그인 여부 검사
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  const input_pw = req.body;
  // 비밀번호 수정 모델
  const model_results = user_model.revisePwModel(input_pw, req.ip, login_cookie);
  // TODO 비동기 배운 후 적용
  // if (model_results === "mysql 사용실패") return res.status(500).json({ state: model_results });
  // else if (model_results === "기존비밀번호 불일치") return res.status(400).json({ state: model_results });
  // else if (model_results === "비밀번호/비밀번호확인 불일치") return res.status(400).json({ state: model_results });
  // else if (model_results === "비밀번호변경성공") return res.status(200).json({ state: model_results });
};

// TODO 체크박스 체크여부 갖고올 수 있을 때 다시 작성
// 회원탈퇴 요청
const dropOut = function (req, res) {
  // 예시 바디
  const example_body = {
    checkBox1: false,
  };
  const login_cookie = req.signedCookies.user;
  // 로그인 여부 검사
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 회원탈퇴 안내조항에 체크 했는지
  const is_agreed = req.body;
  // 안내조항에 체크하지 않았을 때 회원탈퇴 실패
  if (!is_agreed) return res.status(400).json({ state: "회원탈퇴를 위해서는 안내조항에 동의해주세요." });
  // 회원탈퇴 모델
  const model_results = user_model.dropOutModel(req.ip, login_cookie);
  // TODO 비동기 배운후 적용
  //if(model_results ==="mysql 사용실패") return res.status(500).json({state:model_results});
  //else if(model_results === "회원탈퇴") return res.status(204).json({state:model_results});
};

// 모듈화
module.exports = {
  reviseProfile: reviseProfile,
  revisePhoneNumber: revisePhoneNumber,
  revisePw: revisePw,
  dropOut: dropOut,
};

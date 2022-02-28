// 내 정보 라우터의 컨트롤러
// 예시 유저
const crypto = require("crypto");
const user = {
  id: "syjg1234",
  password: "hassing_pw1",
  name: "Zoe",
  gender: "Woman",
  phoneNumber: "01028400631",
  salt: "1234#",
  nickName: null,
  profileShot: null,
};
// 내 프로필 수정
const reviseProfile = function (req, res) {
  // 예시 바디
  const example_profile = {
    profileShot: "사진 url",
    nickName: "새닉네임",
  };

  // 입력된 새 프로필 정보 수정 요청
  const new_profile = req.body;

  // 닉네임 2~8글자 사이인지 검사 (유효하지 않을시 상태코드 400)
  if (new_profile.nickName.length < 2 || new_profile.nickName.length > 8) return res.status(400).json({ state: "닉네임은 2~8글자 사이로 입력해주세요" });
  // 프로필 수정 성공
  res.status(200).end();
};

// 회원정보 수정(연락처 수정)
const revisePhoneNumber = function (req, res) {
  // 예시 바디
  const example_phoneNumber = {
    phoneNumber: "01028401234",
  };

  // 새로운 연락처로 수정 요청
  // const new_phone_number = req.body;
  // 연락처 수정 성공
  res.status(200).end();
};

// 비밀번호 수정(patch)
const revisePw = function (req, res) {
  // 예시 바디
  const example_body = {
    oldPw: "oldPw123!",
    newPw: "newPw123!",
    confirmPw: "newPw123!",
  };

  // 입력된 비밀번호 정보 가져오기
  const revise_pw = req.body;

  // 유효성 검사
  // 1. 유저 비밀번호와 oldPw 비교
  // input oldPw 해싱
  const salt = user.salt;
  const hashed_input_pw = crypto
    .createHash("sha512")
    .update(revise_pw.oldPw + salt)
    .digest("hex");
  // 유저의 비밀번호와 입력한 oldPw가 일치하지 않으면 유효하지 않음
  if (hashed_input_pw !== user.pw) return res.send(400).json({ state: "비밀번호가 일치하지 않습니다." });
  // 2. '새 비밀번호'와 '새 비밀번호 확인'이 일치하지 않으면 비밀번호 변경 불가
  if (revise_pw.newPw !== revise_pw.confirmPw) return res.send(400).json({ state: "'비밀번호'와 '비밀번호 확인'이 일치하지 않습니다." });
  // 3. 새 비밀번호가 문자,숫자,특수문자가 1글자 이상 씩 포함되며 8~16자 사이인 조건을 만족하는지 확인
  let is_valid_pw = "^(?=.*[A-Za-z])(?=.*d)(?=.*[@$!%*#?&])[A-Za-zd@$!%*#?&]{8,16}$";
  // 비밀번호가 조건을 만족하지 않을 때
  if (!is_valid_pw.test(revise_pw.pw)) return res.status(400).json({ state: "비밀번호가 유효하지 않습니다." });

  // 비밀번호 변경 성공
  res.send(200).end();
};

// 회원탈퇴 요청
const dropOut = function (req, res) {
  // 예시 바디
  const example_body = {
    checkBox1: false,
  };
  // 회원탈퇴 안내조항에 체크 했는지
  const is_agreed = req.body;
  // 회원탈퇴 안내조항에 체크했을 때 성공적으로 회원탈퇴
  if (is_agreed) return res.status(204).end();
  // 안내조항에 체크하지 않았을 때 회원탈퇴 실패
  res.status(400).json({ state: "회원탈퇴를 위해서는 안내조항에 동의해주세요." });
};

// 모듈화
module.exports = {
  reviseProfile: reviseProfile,
  revisePhoneNumber: revisePhoneNumber,
  revisePw: revisePw,
  dropOut: dropOut,
};

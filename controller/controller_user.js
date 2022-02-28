// 내 정보 라우터의 컨트롤러
// 예시 유저 ( 로그인 한 유저의 정보)
const crypto = require("crypto");
const { validationResult } = require("express-validator");
const user = {
  userIndex: 1,
  id: "syjg1234",
  password: "hassing_pw1",
  name: "Zoe",
  gender: "Woman",
  phoneNumber: "01028400631",
  salt: "1234#",
  nickName: null,
  profileShot: null,
};

// 예시 유저 정보(기존에 존재하는 모든 유저 데이터)
const users = [
  {
    userIndex: 1,
    id: "syjg1234",
    pw: "hassing_pw1",
    name: "Zoe",
    gender: "Woman",
    phoneNumber: "01028400631",
    salt: "1234#",
    nickName: null,
    profileShot: null,
  },
  {
    userIndex: 2,
    id: "ye1919",
    password: "hassing_pw2",
    name: "Yeji",
    gender: "Woman",
    phoneNumber: "01128400631",
    salt: "1234!",
    nickName: null,
    profileShot: null,
  },
  {
    userIndex: 3,
    id: "hihi123",
    password: "hassing_pw3",
    name: "Leehi",
    gender: "Man",
    phoneNumber: "01234567890",
    salt: "12a13",
    nickName: null,
    profileShot: null,
  },
];

// 내 프로필 수정
const reviseProfile = function (req, res) {
  // 라우터에서 정의한 유효성 검사결과
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ state: "유효하지 않은 데이터입니다." });

  // 예시 바디
  const example_profile = {
    profileShot: "사진 url",
    nickName: "새닉네임",
  };
  // 로그인이 안 돼있을 때
  if (user.userIndex === null) return res.status(401).json({ state: "인증되지 않은 사용자입니다. " });

  // 입력된 새 프로필 정보 수정 요청
  const new_profile = req.body;
  // 유효성 검사
  // 기존에 있는 닉네임인지 검사
  for (const temp_nick of users.nickName) {
    if (temp_nick === new_profile.nickName) return res.status(400).json({ state: "기존에 존재하는 닉네임입니다." });
  }
  // 프로필 수정 성공
  res.status(200).end();
};

// 회원정보 수정(연락처 수정)
const revisePhoneNumber = function (req, res) {
  // 라우터에서 정의한 유효성 검사결과
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ state: "유효하지 않은 데이터입니다." });

  // 예시 바디
  const example_phoneNumber = {
    phoneNumber: "01028401234",
    name: "김예지",
    userIndex: 1,
  };
  // 로그인이 안 돼있을 때
  if (user.userIndex === null) return res.status(401).json({ state: "인증되지 않은 사용자입니다." });

  // 연락처 수정 성공
  res.status(200).end();
};

// 비밀번호 수정(patch)
const revisePw = function (req, res) {
  // 라우터에서 정의한 유효성 검사결과
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ state: "유효하지 않은 데이터입니다." });

  // 예시 바디
  /*
  const example_body = {
    oldPw: "oldPw123!",
    newPw: "newPw123!",
    confirmPw: "newPw123!",
  };
*/
  // 입력된 비밀번호 정보 가져오기
  const revise_pw = req.body;
  // 로그인이 안 돼있을 때
  if (user.userIndex === null) return res.status(401).json({ state: "인증되지 않은 사용자입니다." });

  // 유효성 검사
  // 1. 유저 비밀번호와 oldPw 비교
  // input oldPw 해싱
  const salt = user.salt;
  const hashed_input_pw = crypto
    .createHash("sha512")
    .update(revise_pw.oldPw + salt)
    .digest("hex");
  // 유저의 비밀번호와 입력한 oldPw가 일치하지 않으면 유효하지 않음
  if (hashed_input_pw !== user.pw) return res.status(400).json({ state: "비밀번호가 일치하지 않습니다." });
  // 2. '새 비밀번호'와 '새 비밀번호 확인'이 일치하지 않으면 비밀번호 변경 불가
  if (revise_pw.newPw !== revise_pw.confirmPw) return res.status(400).json({ state: "'비밀번호'와 '비밀번호 확인'이 일치하지 않습니다." });

  // 비밀번호 변경 성공
  res.status(200).end();
};

// 회원탈퇴 요청
const dropOut = function (req, res) {
  // 예시 바디
  const example_body = {
    checkBox1: false,
  };
  // 로그인이 안 돼있을 때
  if (user.userIndex === null) return res.status(401).json({ state: "인증되지 않은 사용자입니다." });
  // 회원탈퇴 안내조항에 체크 했는지
  const is_agreed = req.body;
  // 회원탈퇴 안내조항에 체크했을 때 성공적으로 회원탈퇴
  if (is_agreed) return res.status(204).end();
  // 안내조항에 체크하지 않았을 때 회원탈퇴 실패
  res.status(400).json({ state: "회원탈퇴를 위해서는 안내조항에 동의해주세요." });
};

// TODO
// 내 관심도서관(adj_lib 코드 작성 후 구현)

// 모듈화
module.exports = {
  reviseProfile: reviseProfile,
  revisePhoneNumber: revisePhoneNumber,
  revisePw: revisePw,
  dropOut: dropOut,
};

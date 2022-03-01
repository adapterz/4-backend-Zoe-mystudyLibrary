// 로그인화면의 라우터의 컨트롤러
// 예시 유저 정보
const crypto = require("crypto");
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

// 로그인
const login = function (req, res) {
  /* 예시 정보
  body = {
  id: "syjg1234",
  pw: "st123456#"
  }
   */

  // 유저가 입력한 정보 가져오기
  const input_login = req.body;

  // 입력한 아이디와 DB의 아이디들과 대조
  let is_existed = false;
  let user_index = -1;
  for (const index in users) {
    if (input_login.id === users[index].id) {
      is_existed = true;
      user_index = index;
      break;
    }
  }
  // 유효성 검사
  // 1. 존재하는 아이디가 없을 때
  if (!is_existed) return res.status(400).json({ state: "유효하지 않은 데이터입니다." });
  // 입력한 비밀번호 해싱
  const salts = users[user_index].salt;
  const hash_pw = crypto
    .createHash("sha512")
    .update(input_login.pw + salts)
    .digest("hex");
  // 2. 등록된 유저 pw와 입력한 pw가 다르면 로그인 실패
  if (hash_pw !== users[user_index].pw) return res.status(400).json({ state: "유효하지 않은 데이터입니다." });

  // 로그인 성공
  return res.status(200).json(users[user_index]);
};

// 모듈화
module.exports = {
  login: login,
};

// 회원가입 화면의 라우터의 컨트롤러
// 예시 유저 정보(기존에 존재하는 유저 데이터)
const users12 = [
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

// 회원가입 약관확인
const signUpGuide = function (req, res) {
  // 약관동의 체크박스(예시 body)
  const example_body = {
    checkBox1: false,
    checkBox2: false,
    checkBox3: false,
  };

  const is_agreed = req.body;
  // 약관확인에서 세 개의 체크박스에 모두 체크를 했을 때
  if (is_agreed.checkBox1 && is_agreed.checkBox2 && is_agreed.checkBox3) return res.status(200).end();
  // 체크박스에 체크하지 않았을 때
  res.status(400).json({ state: "안내사항을 읽고 동의해주세요." });
};
// 회원가입 요청
const signUp = function (req, res) {
  // 예시 body
  const example_body = {
    id: "아이디",
    pw: "비번",
    confirmPw: "비밀번호확인",
    name: "이름",
    gender: "성별",
    phoneNumber: "폰 번호",
  };

  // 회원가입 시 입력한 유저 정보
  const input_user = req.body;
  // 라우터에 정의된 것 외의 유효성 검사
  // 1. 기존에 존재하는 아이디 인지 검사
  for (const temp_id of users.id) {
    if (temp_id === input_user.id) return res.status(400).json({ state: "기존에 존재하는 아이디입니다." });
  }
  // 2. 비밀번호 유효성 검사
  // 입력한 비밀번호와 비밀번호 확인이 다를 때
  if (input_user.pw !== input_user.confirmPw) return res.status(400).json({ state: "'비밀번호'와 '비밀번호 확인'이 일치하지 않습니다." });

  // 회원가입 성공
  res.status(201).end();
};

module.exports = {
  signUpGuide: signUpGuide,
  signUp: signUp,
};

// 회원가입 화면의 라우터의 컨트롤러
// 예시 유저 정보(기존에 존재하는 유저 데이터)
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

// 회원가입 약관확인
const signUpGuide = function (req, res) {
  // 약관동의 체크박스 2개(예시 body)
  const example_body = {
    checkBox1: false,
    checkBox2: false,
  };

  const isAgreed = req.body;
  // 약관확인에서 두 개의 체크박스에 모두 체크를 했을 때
  if (isAgreed.checkBox1 && isAgreed.checkBox2) return res.status(200).end();
  // 체크박스에 체크하지 않았을 때
  return res.status(400).json({ state: "안내사항을 읽고 동의해주세요." });
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
  // 유효성 검사
  // 1. 기존에 존재하는 아이디 인가?
  for (const temp_id of users.ID) {
    if (temp_id === input_user.id)
      return res.status(400).json({ state: "기존에 존재하는 아이디입니다." });
  }
  // 2. 비밀번호 유효성 검사
  // 입력한 비밀번호와 비밀번호 확인이 다를 때
  if (input_user.pw !== input_user.confirmPw)
    return res
      .status(400)
      .json({ state: "'비밀번호'와 '비밀번호 확인'이 일치하지 않습니다." });
  // 3. 하나 이상의 문자, 숫자, 특수문자 8 ~ 16자(비밀번호 정규식 사용)
  let is_valid_pw =
    "^(?=.*[A-Za-z])(?=.*d)(?=.*[@$!%*#?&])[A-Za-zd@$!%*#?&]{8,16}$";
  // 비밀번호가 조건을 만족하지 않을 때
  if (!is_valid_pw.test(input_user.pw))
    return res.status(400).json({ state: "비밀번호가 유효하지 않습니다." });

  // 회원가입 성공
  res.status(201).end();
};

module.exports = {
  signUpGuide: signUpGuide,
  signUp: signUp,
};

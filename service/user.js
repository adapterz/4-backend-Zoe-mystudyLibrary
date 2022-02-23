// 로그인, 회원가입, 내 정보 관련 비즈니스 로직
// 암호화에 필요한 모듈
const crypto = require("crypto");

// 예시 유저 정보
const users = [
  {
    ID: "syjg1234",
    Password: "hassing_pw1",
    Name: "Zoe",
    Gender: "Woman",
    Phone_number: "01028400631",
    salt: "1234#",
  },
  {
    ID: "ye1919",
    Password: "hassing_pw2",
    Name: "Yeji",
    Gender: "Woman",
    Phone_number: "01128400631",
    salt: "1234!",
  },
  {
    ID: "hihi123",
    Password: "hassing_pw3",
    Name: "Leehi",
    Gender: "Man",
    Phone_number: "01234567890",
    salt: "12a13",
  },
];

// 로그인 기능
function Login(input_id, input_pw) {
  let user_index = null;
  // 입력한 ID의 user index 찾기
  for (const index in users) {
    if (input_id === users[index].id) {
      user_index = index;
      break;
    }
  }
  // 존재하지 않는 ID를 입력했을 경우 false 리턴
  if (user_index === null) {
    console.log("입력한 ID가 존재하지 않습니다");
    return false;
  }
  // 암호화
  // 해당 유저의 salts 불러오기
  const salts = users[user_index].salt;
  // 해싱
  const hash_pw = crypto
    .createHash("sha512")
    .update(input_pw + salts)
    .digest("hex");
  // 등록된 유저 pw와 입력한 pw가 다르면 로그인 실패
  if (hash_pw !== users[user_index].Password) {
    console.log("입력한 PW가 일치하지 않습니다.");
    return false;
  }

  console.log("로그인 성공");
  return true;
}

// 회원가입 로직
// 1. 아이디 중복 체크
function IsNonExistedID(input_id) {
  // 기존 유저들의 아이디와 새로 가입하려는 유저가 입력한 아이디와 비교해서 겹치는 아이디가 있으면 false 반환
  for (const temp_id of users.ID) {
    if (temp_id === input_id) return false;
  }
  // 기존 유저들의 아이디와 중복되지 않으면 true 반환
  return true;
}

// 2. 비밀번호 유효성 검사
function IsValid(input_pw) {
  // 1) 글자수가 8 미만이거나 16 초과면 유효하지 않은 비밀번호
  let pw_len = input_pw.length;
  if (pw_len < 8 || pw_len > 16) return false;

  // 2) 영문,숫자 특수문자 조합의 비밀번호인지 확인
  // 영문,숫자, 특수문자가 모두 한 번 이상 들어갔는지 확인해줄 변수들
  let have_char = false;
  let have_num = false;
  let have_special_char = false;

  const arr_pw = input_pw.split("");
  for (const temp_pw of arr_pw) {
    // 해당 인덱스의 string 요소 값 체크 해줄 변수들
    let is_char = false;
    let is_num = false;
    let is_special_char = false;

    if (temp_pw >= "a" && temp_pw <= "z") is_char = true;
    if (temp_pw >= "A" && temp_pw <= "Z") is_char = true;
    if (temp_pw >= "0" && temp_pw <= "9") is_num = true;
    if (
      temp_pw === "!" ||
      temp_pw === "@" ||
      temp_pw === "#" ||
      temp_pw === "$" ||
      temp_pw === "%" ||
      temp_pw === "^" ||
      temp_pw === "&" ||
      temp_pw === "*"
    )
      is_special_char = true;

    // 영문, 숫자, 특수문자 중 어떤 것도 아니면 유효하지 않은 비밀번호
    if (is_char === false && is_num === false && is_special_char === false)
      return false;

    // 해당 인덱스에 영문,숫자, 특수문자가 있었는지 변수값 변경시켜주기
    if (is_char) have_char = true;
    if (is_num) have_num = true;
    if (is_special_char) have_special_char = true;
  }
  // 3) 영문, 숫자, 특수문자가 다 true가 아니면 유효하지 않음 (영문, 숫자, 특수문자가 한 번 이상 포함되야함)
  if (
    !(have_char === true && have_num === true && have_special_char === true)
  ) {
    return false;
  }

  // 4) 유효성 검사에서 한 번도 false에 걸리지 않으면 true
  return true;
}

// 3. 비밀번호와 비밀번호 확인 일치여부
function IsSamePw(input_pw, input_confirm_pw) {
  // 같으면 true
  if (input_pw === input_confirm_pw) return true;
  // 다르면 false
  return false;
}

// main. 회원가입 로직
export function SignUp(
  input_id,
  input_pw,
  input_confirm_pw,
  name,
  gender,
  phone_num
) {
  // 유효성 검사
  // 1. 기존에 존재하는 아이디면 회원가입 불가
  if (!IsNonExistedID(input_id)) return false;
  // 2. '비밀번호'와 '비밀번호 확인'이 일치하지 않으면 회원가입 불가
  if (!IsSamePw(input_pw, input_confirm_pw)) return false;
  // 3. '비밀번호'가 유효하지 않으면 회원가입 불가
  if (!IsValid(input_pw)) return false;

  // 암호화
  // 기존의 암호를 알아내기 힘들도록 salts 쳐주기
  const salts = crypto.randomBytes(128).toString("base64");
  const hash_pw = crypto
    .createHash("sha512")
    .update(input_pw + salts)
    .digest("hex");

  // 유효성 검사 통과하면 유저 정보에 신규 유저 추가
  const new_user = {
    ID: input_id,
    Password: hash_pw,
    Name: name,
    Gender: gender,
    Phone_number: phone_num,
    salt: salts,
  };

  users.push(new_user);
  return true;
}

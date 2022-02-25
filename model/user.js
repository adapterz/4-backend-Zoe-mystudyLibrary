// 로그인/회원가입/ 내 정보 관련 model

// 필요모듈
const crypto = require("crypto");
const business_logic = require("/service/user");

// 예시 유저 정보
const users = [
  {
    ID: "syjg1234",
    Password: "hassing_pw1",
    Name: "Zoe",
    Gender: "Woman",
    Phone_number: "01028400631",
    salt: "1234#",
    nickname: null,
    profile_shot: null,
  },
  {
    ID: "ye1919",
    Password: "hassing_pw2",
    Name: "Yeji",
    Gender: "Woman",
    Phone_number: "01128400631",
    salt: "1234!",
    nickname: null,
    profile_shot: null,
  },
  {
    ID: "hihi123",
    Password: "hassing_pw3",
    Name: "Leehi",
    Gender: "Man",
    Phone_number: "01234567890",
    salt: "12a13",
    nickname: null,
    profile_shot: null,
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
  // 존재하지 않는 ID를 입력했을 경우 false
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

// 회원가입 기능
// 회원가입 전 약관동의 체크 여부
// 인자1: 해당 서비스 이용약관 동의에 체크 했는지 여부, 인자2: 개인정보 수집 및 이용 동의에 체크 했는지 여부
function IsAllCheckedBeforeSignUp(
  checking_terms_of_use,
  checking_about_personal_information
) {
  // 두 인자 모두 true면 true 반환
  if (checking_terms_of_use && checking_about_personal_information) return true;
  return false;
}

// main. 회원가입 로직
function SignUp(input_id, input_pw, input_confirm_pw, name, gender, phone_num) {
  // 유효성 검사
  // 1. 기존에 존재하는 아이디면 회원가입 불가
  if (!business_logic.IsNonExistedID(input_id)) return false;
  // 2. '비밀번호'와 '비밀번호 확인'이 일치하지 않으면 회원가입 불가
  if (!business_logic.IsSamePw(input_pw, input_confirm_pw)) return false;
  // 3. '비밀번호'가 유효하지 않으면 회원가입 불가
  if (!business_logic.IsValid(input_pw)) return false;

  // 암호 해싱
  const hashing_data = business_logic.hash_pw(input_pw);

  // 유효성 검사 통과하면 유저 정보에 신규 유저 추가
  const new_user = {
    ID: input_id.toString(),
    Password: hashing_data.temp_hash_pw.toString(),
    Name: name.toString(),
    Gender: gender.toString(),
    Phone_number: phone_num.toString(),
    salt: hashing_data.temp_salts.toString(),
    nickname: null,
    profile_shot: null,
  };

  users.push(new_user);
  return true;
}

// 프로필 변경
function revise_profile(input_photo, input_nickname, input_id) {
  // 유효성 검사
  // 닉네임 길이 2~8글자가 아니면 false 반환
  if (!business_logic.check_len_nickname(input_nickname)) return false;

  // user 정보 찾기
  // 입력한 ID의 user index 찾기
  let user_index = null;
  for (const index in users) {
    if (input_id === users[index].id) {
      user_index = index;
      break;
    }
  }
  users[user_index].nickname = input_nickname;

  // TODO
  // 사진 변경
}

// 비밀번호 변경
function revise_pw(input_pw, input_new_pw, input_confirm_new_pw, input_id) {
  // user 정보 찾기
  // 입력한 ID의 user index 찾기
  let user_index = null;
  for (const index in users) {
    if (input_id === users[index].id) {
      user_index = index;
      break;
    }
  }
  // 유저 정보의 비밀번호와 입력한 현재 비밀번호가 다르면 비밀번호 변경 불가
  if (users[user_index].Password !== input_pw) return false;

  // 비밀번호 유효성 검사
  // 1. '비밀번호'와 '비밀번호 확인'이 일치하지 않으면 비밀번호 변경 불가
  if (!business_logic.IsSamePw(input_new_pw, input_confirm_new_pw))
    return false;
  // 2. '비밀번호'가 유효하지 않으면 비밀번호 변경 불가
  if (!business_logic.IsValid(input_confirm_new_pw)) return false;

  // 암호 해싱
  const hashing_data = business_logic.hash_pw(input_new_pw);

  // 기존 유저 비밀번호/salts 변경
  users[user_index].Password = hashing_data.temp_hash_pw;
  users[user_index].salts = hashing_data.temp_salts;
}

// 모듈화
module.exports = {
  Login: Login,
  IsAllCheckedBeforeSignUp: IsAllCheckedBeforeSignUp,
  SignUp: SignUp,
  revise_profile: revise_profile,
  revise_pw: revise_pw,
};

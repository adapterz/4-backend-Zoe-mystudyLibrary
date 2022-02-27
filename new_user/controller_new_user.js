// 회원가입 화면의 라우터의 컨트롤러
// 비즈니스 로직 객체
// 모델 객체
const model_user = require("../../model/user");

// 해당 라우터에서 get 요청을 받았을 때(약관확인 창)
const get_new_user = function (req, res) {
  const sign_up_page = {
    checkbox1: "해당 사이트 이용약관, 개인정보 수집 및 이용에 모두 동의합니다.",
    checkbox2: "mystudyLibrary 이용약관 동의(필수)",
    checkbox2_content: "여러분을 환영합니다",
    checkbox3: "개인정보 수집 및 이용 동의(필수)",
    checkbox3_content: "개인정보법에 따라 ~",
  };
  res.status(200).json(sign_up_page);
};
// 회원가입 약관확인
const confirm_terms_of_use = function (req, res) {
  const body = req.body;
  // 프로퍼티 임시로 정의(나중에 데이터 가져올 떄 코드 다시 짜주기)
  body.is_agree_terms_of_use = undefined;
  body.is_agree_about_personal_information = undefined;

  // 약관동의 요소에 모두 체크했는지 확인하기
  const is_all_checked = model_user.IsAllCheckedBeforeSignUp(
    body.is_agree_terms_of_use,
    body.is_agree_about_personal_information
  );

  // return 값에 따른 분기처리
  // 전부 체크 했을 때
  if (is_all_checked) {
    const sign_up_page = {
      ID: "아이디 입력",
      Password: "비밀번호 입력",
      confirm_pw: "비밀번호 확인",
      name: "이름",
      Gender: "성별선택",
      Phone_number: "전화번호 입력",
    };
    res.status(200).json(sign_up_page);
  }
  // 전부 체크하지 않은 경우
  else if (!is_all_checked) {
    const sign_up_page = {
      checkbox1:
        "해당 사이트 이용약관, 개인정보 수집 및 이용에 모두 동의합니다.",
      checkbox2: "mystudyLibrary 이용약관 동의(필수)",
      checkbox2_content: "여러분을 환영합니다",
      checkbox3: "개인정보 수집 및 이용 동의(필수)",
      checkbox3_content: "개인정보법에 따라 ~",
    };
    const fail = {
      state: "이용약관과 개인정보 수집 및 이용에 대한 안내 모두 동의해주세요",
    };
    res.status(200).json(sign_up_page + fail);
  }
};
// 회원가입 요청
const sign_up = function (req, res) {
  const sign_up_data = req.body;

  // 회원가입 성공 여부/ 실패했다면 원인 num 값으로 return
  const can_sign_up = model_user.SignUp(
    sign_up_data.ID.toString(),
    sign_up_data.pw.toString(),
    sign_up_data.confirm_pw.toString(),
    sign_up_data.name.toString(),
    sign_up_data.gender.toString(),
    sign_up_data.phone_num.toString()
  );

  // 리턴값에 따른 분기처리
  // 회원가입 실패 시 (유효하지 않을 때) -> 텍스트 필드의 값 변경 해주기
  if (!can_sign_up) {
    const sign_up_page = {
      ID: sign_up_data.ID.toString(),
      Password: sign_up_data.Password.toString(),
      confirm_pw: sign_up_data.confirm_pw.toString(),
      name: sign_up_data.name.toString(),
      Gender: sign_up_data.gender.toString(),
      Phone_number: sign_up_data.Phone_number.toString(),
    };
    res.status(200).json(sign_up_page);
    // 회원가입 성공 시 홈화면으로 이동
  } else if (can_sign_up) {
    res.status(201).redirect("/");
  }
};

module.exports = {
  get_new_user: get_new_user,
  confirm_terms_of_use: confirm_terms_of_use,
  sign_up: sign_up,
};

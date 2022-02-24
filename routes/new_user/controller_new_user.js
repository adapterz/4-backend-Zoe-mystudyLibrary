// 회원가입 화면의 라우터의 컨트롤러
// 비즈니스 로직 객체
const service_user = require("/service/user");

// 해당 라우터에서 get 요청을 받았을 때(약관확인 창)
const get_new_user = function (req, res) {
  res.send("회원가입");

  console.log("/new_user");
};
// 회원가입 약관확인
const confirm_terms_of_use = function (req, res) {
  const body = req.body;
  // 프로퍼티 임시로 정의(나중에 데이터 가져올 떄 코드 다시 짜주기)
  body.is_agree_terms_of_use = undefined;
  body.is_agree_about_personal_information = undefined;

  // 약관동의 요소에 모두 체크했는지 확인하는 메서드
  const is_all_checked = service_user.IsAllCheckedBeforeSignUp(
    body.is_agree_terms_of_use,
    body.is_agree_about_personal_information
  );

  // return 값에 따른 분기처리
  if (is_all_checked) {
    res.send("약관동의");
  } else if (!is_all_checked) {
    res.send("이용약관과 개인정보 수집 및 이용에 대한 안내 모두 동의해주세요");
  }
};
// 회원가입 요청
const sign_up = function (req, res) {
  const body = req.body;
  // 프로퍼티 임시로 정의(나중에 데이터 가져올 떄 코드 다시 짜주기)
  body.phone_num = null;
  body.gender = null;
  body.confirm_pw = null;

  // 회원가입 성공 여부/ 실패했다면 원인 num값으로 return
  const case_sign_up = service_user.SignUp(
    body.id.toString(),
    body.pw.toString(),
    body.confirm_pw.toString(),
    body.name.toString(),
    body.gender.toString(),
    body.phone_num.toString()
  );

  // 리턴값에 따른 분기처리
  if (case_sign_up === 0) {
    res.send("기존에 존재하는 아이디거나 탈퇴한 아이디입니다.");
  } else if (case_sign_up === 1) {
    res.send("'비밀번호'와 '비밀번호 확인'이 일치하지 않습니다.");
  } else if (case_sign_up === 2) {
    res.send(
      "'비밀번호'는 8~16자리 사이의 영문,숫자,특수문자(!,@,#,$,%,^,&,*)의 조합이어야합니다."
    );
    // 회원가입 성공 시 홈화면으로
  } else if (case_sign_up === 3) {
    res.redirect("/");
  }
};

module.exports = {
  get_new_user: get_new_user,
  confirm_terms_of_use: confirm_terms_of_use,
  sign_up: sign_up,
};

// 회원가입 화면의 라우터의 컨트롤러
const new_user = require("../model/new_user");
// 회원가입 약관확인
const signUpGuide = async function (req, res) {
  // 약관동의 체크박스(예시 body)
  /*
  req.body (약관동의 체크박스에 체크했는지 여부 - boolean값)
    checkBox1
    checkBox2
    checkBox3

   */

  const is_agreed = req.body;
  // 약관확인에서 세 개의 체크박스에 모두 체크를 했을 때
  if (is_agreed.checkBox1 && is_agreed.checkBox2 && is_agreed.checkBox3) return res.status(200).end();
  // 체크박스에 체크하지 않았을 때
  res.status(400).json({ state: "안내사항을 읽고 동의해주세요." });
};

// 회원가입 요청
const signUp = async function (req, res) {
  /*
  req.body
    id: 아이디
    pw: 비밀번호
    confimPw: 비밀번호확인
    name: 이름
    phoneNumber: 전화번호
    nickName: 닉네임
   */
  // 회원가입 요청 모델 실행 결과
  const model_results = await new_user.signUpModel(req.body, req.ip);
  // 모델 실행결과에 따른 분기처리
  // mysql query 메서드 실패
  if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
  // 이미 존재하는 id라 회원가입 불가능
  else if (model_results.state === "존재하는 아이디") return res.status(400).json(model_results);
  // 이미 존재하는 닉네임이라 회원가입 불가능
  else if (model_results.state === "존재하는 닉네임") return res.status(400).json(model_results);
  // 비밀번호와 비밀번호확인이 일치하지 않을 때
  else if (model_results.state === "비밀번호/비밀번호확인 불일치") return res.status(400).json(model_results);
  // 성공적으로 회원가입
  else if (model_results.state === "회원가입") return res.status(201).json(model_results);
};

module.exports = {
  signUpGuide: signUpGuide,
  signUp: signUp,
};

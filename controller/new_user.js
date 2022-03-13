// 회원가입 화면의 라우터의 컨트롤러
// 모델 모듈
const new_user = require("../model/new_user");
// TODO 프론트 때 할 듯?
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
  const model_results = new_user.signUpModel(req.body, req.ip);
  /*
  비동기 배운후 적용
  if(model_results.state ==="mysql 사용실패") return res.status(500).json(model_results);
  else if(model_results.state==="존재하는 아이디") return res.status(400).json(model_results);
  else if(model_results.state==="존재하는 닉네임") return res.status(400).json(model_results);
  else if(model_results.state==="비밀번호/비밀번호확인 불일치") return res.status(400).json(model_results);
  else if(model_results.state==="회원가입") return res.status(201).json(model_results);

   */
};

module.exports = {
  signUpGuide: signUpGuide,
  signUp: signUp,
};

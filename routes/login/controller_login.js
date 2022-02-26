// 로그인화면의 라우터의 컨트롤러
// 모델 객체
const model_user = require("/model/user");

// 해당 라우터에서 get 요청을 받았을 때(기본화면)
// 로그인 페이지
const get_login = function (req, res) {
  const login_page = {
    ID: "아이디 입력",
    Password: "비밀번호 입력",
  };

  res.status(200).json(login_page);
};

// 로그인
const login = function (req, res) {
  // 로그인 입력 정보 가져오기
  const login_input = req.body;

  // 로그인 성공 여부
  const can_login = model_user.Login(
    login_input.ID.toString(),
    login_input.Password.toString()
  );
  // 로그인 실패
  if (!can_login) {
    // 로그인 페이지
    const login_page = {
      ID: login_input.ID,
      Password: login_input.Password,
    };
    // 실패
    const fail = { state: "로그인 실패" };

    res.status(200).send(login_page + fail);
  }
  // 로그인 후 홈화면으로 가기
  else if (can_login) {
    res.status(200).redirect("/");
  }
};

// 모듈화
module.exports = {
  get_login: get_login,
  login: login,
};

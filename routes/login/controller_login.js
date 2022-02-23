// 로그인화면의 라우터의 컨트롤러

// 해당 라우터에서 get 요청을 받았을 때
const get_login = function (req, res) {
  res.send("로그인 창");

  console.log("/login");
};
module.exports = {
  get_login: get_login,
};

// 회원가입 화면의 라우터의 컨트롤러

// 해당 라우터에서 get 요청을 받았을 때
const get_new_user = function (req, res) {
  res.send("회원가입");

  console.log("/new_user");
};
module.exports = {
  get_new_user: get_new_user,
};

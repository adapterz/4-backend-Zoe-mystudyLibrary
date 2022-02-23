// 내 정보 라우터의 컨트롤러

// 해당 라우터에서 get 요청을 받았을 때(기본 화면)
const get_user = function (req, res) {
  res.send("내정보창이에요");
};

// 모듈화
module.exports = {
  get_user: get_user,
};

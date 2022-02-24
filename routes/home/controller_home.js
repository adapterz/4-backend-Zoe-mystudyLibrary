// 홈화면의 라우터의 컨트롤러

// 해당 라우터에서 get 요청을 받았을 때 (기본화면)
const get_home = function (req, res) {
  res.send("홈화면");
};

// 모듈화
module.exports = {
  get_home: get_home,
};

// 홈화면의 라우터의 컨트롤러

// 홈화면
const get_home = function (req, res) {
  res.status(200).send("홈화면");
};

// 모듈화
module.exports = {
  get_home: get_home,
};

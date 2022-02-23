// 내주변도서관 라우터의 컨트롤러

// 해당 라우터에서 get 요청을 받았을 때
const get_adj_lib = function (req, res) {
  res.send("내주변도서관탭이에요");

  console.log("/adj_lib");
};

// 모듈화
module.exports = {
  get_adj_lib: get_adj_lib,
};

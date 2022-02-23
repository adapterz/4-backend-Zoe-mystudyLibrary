// 자유게시판 라우터의 컨트롤러

// 해당 라우터에서 get 요청을 받았을 때
const get_free_bulletin_board = function (req, res) {
  res.send("자유게시판");

  console.log("/free_bulletin_board");
};

module.exports = {
  get_free_bulletin_board: get_free_bulletin_board,
};

// 로그인화면의 라우터의 컨트롤러
// 모델 객체
const model_user = require("/model/mypost");

// 해당 라우터에서 get 요청을 받았을 때(기본화면)
const my = function (req, res) {
  res.status(200).send("내가 작성한 글/후기");
};

// TODO

// 내가 작성한 글, 내가 작성한 댓글, 내가 작성한 후기
// 내 관심도서관(adj_lib 코드 작성 후 구현)

// 모듈화
module.exports = { my: my };

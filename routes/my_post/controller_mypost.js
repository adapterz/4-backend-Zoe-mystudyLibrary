// 로그인화면의 라우터의 컨트롤러
// 모델 객체
const model_user = require("/model/mypost");

// 작성 글
const my_post = function (req, res) {
  // 내가 작성한 글 보여주기 + 글이 없으면 글 없다고 텍스트 처리된 화면나오게 분기처리
  res.status(200).send("내가 작성한 글");
};

// 선택 글 삭제
const delete_my_post = function (req, res) {
  // 체크박스에 체크된 게시물 정보 배열로 가져와서 삭제해주기
  res.status(204).redirect("/post");
};
// 작성 댓글
const my_comment = function (req, res) {
  // 내가 작성한 댓글 보여주기 + 댓글이 없으면 댓글 없다고 텍스트 처리된 화면나오게 분기처리
  res.status(200).send("내가 작성한 댓글");
};
// 선택 댓글 삭제
const delete_my_comment = function (req, res) {
  // 체크박스에 체크된 댓글 정보 배열로 가져와서 삭제해주기
  res.status(204).redirect("/comments");
};
// 작성 후기
const my_epilogue = function (req, res) {
  // 내가 작성한 후기 보여주기 + 후기가 없으면 후기 없다고 텍스트 처리된 화면나오게 분기처리
  res.status(200).send("내가 작성한 후기");
};
// 후기 삭제
const delete_my_epilogue = function (req, res) {
  // 삭제버튼 누르면 해당 후기 삭제
  res.status(204).redirect("/epilogue");
};
// TODO
// 내 관심도서관(adj_lib 코드 작성 후 구현)

// 모듈화
module.exports = {
  my_post: my_post,
  delete_my_post: delete_my_post,
  my_comment: my_comment,
  delete_my_comment: delete_my_comment,
  my_epilogue: my_epilogue,
  delete_my_epilogue: delete_my_epilogue,
};

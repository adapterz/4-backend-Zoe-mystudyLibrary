// 내가 작성한 글/댓글/후기 컨트롤러
// 모델
const post_model = require("../model/post");
const comment_model = require("../model/comment");
const review_model = require("../model/review");
// 예시
const user = {
  userIndex: 123123,
  nickName: "Zoe",
  id: "yeji1919",
};
// 내가 작성한 정보
// 내가 작성한 포스팅 데이터
const myPost = function (req, res) {
  const login_cookie = req.signedCookies.user;
  // 로그인 여부 검사
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 해당 유저가 작성한 글 목록 가져오기
  // TODO 비동기 공부후 다시작성
  const model_results = post_model.userPostModel(login_cookie, req.ip);
  /*
   if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results.state);
  else if (model_results.state === "등록된글이없음") return res.status(200).json(model_results.state);
  else if (model_results.state === "성공적조회") return res.status(200).json(model_results.data);

   */
};
// 내가 작성한 댓글 데이터
const myComment = function (req, res) {
  const login_cookie = req.signedCookies.user;
  // 로그인 여부 검사
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 해당 유저가 작성한 후기 정보 가져오기
  const model_results = comment_model.userCommentModel(login_cookie, req.ip);
  /*
  
  // TODO 비동기 공부후 다시작성
   if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results.state);
  else if (model_results.state === "등록된댓글없음") return res.status(200).json(model_results.state);
  else if (model_results.state === "성공적조회") return res.status(200).json(model_results.data);

   */
};
// 내가 작성한 도서관 이용 후기 데이터
const myReview = function (req, res) {
  const login_cookie = req.signedCookies.user;
  // 로그인 여부 검사
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 해당 유저가 작성한 후기 정보 가져오기
  const model_results = review_model.userReviewModel(login_cookie, req.ip);
  /*
   // TODO 비동기 공부후 다시작성
   if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results.state);
  else if (model_results.state === "등록된후기없음") return res.status(200).json(model_results.state);
  else if (model_results.state === "성공적조회") return res.status(200).json(model_results.data);
   */
};

// TODO 로그인 배운 후 다시 작성
// 선택 게시글 삭제
const deletePost = function (req, res) {
  const login_cookie = req.signedCookies.user;
  // 로그인 여부 검사
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 해당 인덱스 게시글 삭제
  const model_results = post_model.deletePostModel(req.query.boardIndex, login_cookie, req.ip);
  /* TODO 비동기 공부후 다시작성
  if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
  else if (model_results.state === "게시글삭제") return res.status(204).end();

   */
};
// 선택 댓글 삭제
const deleteComment = function (req, res) {
  const login_cookie = req.signedCookies.user;
  // 로그인 여부 검사
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 댓글삭제 모듈
  const model_results = comment_model.deleteCommentModel(req.query.commentIndex, login_cookie, req.ip);
  /* TODO 비동기 공부후 다시작성
  if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
  else if (model_results.state === "댓글삭제") return res.status(204).end();
 
   */
};
// 도서관 후기 삭제
const deleteReview = function (req, res) {
  const login_cookie = req.signedCookies.user;
  // 로그인 여부 검사
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 후기삭제 모듈
  const model_results = review_model.deleteReviewModel(req.query.reviewIndex, login_cookie, req.ip);
  /*TODO 비동기 공부후 다시작성
  if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
  else if (model_results.state === "후기삭제") return res.status(204).end();
*/
};

// 모듈화
module.exports = {
  myPost: myPost,
  myComment: myComment,
  myReview: myReview,
  deletePost: deletePost,
  deleteComment: deleteComment,
  deleteReview: deleteReview,
};

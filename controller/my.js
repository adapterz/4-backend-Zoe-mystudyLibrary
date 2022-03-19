// 내가 작성한 글/댓글/후기 컨트롤러
const my_model = require("../model/my");
const post_model = require("../model/board");
const comment_model = require("../model/comment");
const review_model = require("../model/review");
const check_authority_model = require("../model/check_authority");
const library_model = require("../model/library");

// 내가 작성한 정보

// 내 관심도서관
const myLib = async function (req, res) {
  // 로그인 여부 검사
  const login_cookie = req.signedCookies.user;
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 해당 유저가 관심도서관으로 등록한 도서관 정보 가져오는 모델 실행결과
  const model_results = await library_model.userLibModel(login_cookie, req.ip);
  // 실행결과에 따라 분기처리
  // mysql query 메서드 실패
  if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
  // 등록된 도서관 정보가 없을 때
  else if (model_results.state === "등록된정보없음") return res.status(200).json(model_results);
  // 해당 유저가 지금까지 등록한 관심도서관 정보 응답
  else if (model_results.state === "유저의관심도서관") return res.status(200).json(model_results.data);
};
// 내가 작성한 게시글 정보
const myPost = async function (req, res) {
  // 로그인 여부 검사
  const login_cookie = req.signedCookies.user;
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 해당 유저가 작성한 글 목록 가져올 모델 실행결과
  const model_results = await my_model.userPostModel(login_cookie, req.ip);
  // 모델 실행결과에 따른 분기처리
  // mysql query 메서드 실패
  if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results.state);
  // 내가 작성한 글이 없을 때 (요청은 올바르지만 안타깝게도 응답해줄 DB 정보가 없을 때)
  else if (model_results.state === "등록된글이없음") return res.status(200).json(model_results.state);
  // 성공적으로 내가 작성한 게시글 정보 응답
  else if (model_results.state === "내작성글조회") return res.status(200).json(model_results.data);
};
// 내가 작성한 댓글 정보
const myComment = async function (req, res) {
  // 로그인 여부 검사
  const login_cookie = req.signedCookies.user;
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 해당 유저가 작성한 후기 정보 가져올 모델 실행 결과
  const model_results = await my_model.userCommentModel(login_cookie, req.ip);
  // 모델 실행결과에 따른 분기처리
  // mysql query 메서드 실패
  if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
  // 내가 작성한 댓글이 없을 때 (요청은 올바르지만 안타깝게도 응답해줄 DB 정보가 없을 때)
  else if (model_results.state === "등록된댓글없음") return res.status(200).json(model_results);
  // 성공적으로 내가 작성한 댓글 정보 응답
  else if (model_results.state === "성공적조회") return res.status(200).json(model_results.data);
};
// 내가 작성한 도서관 이용 후기 데이터
const myReview = async function (req, res) {
  // 로그인 여부 검사
  const login_cookie = req.signedCookies.user;
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 해당 유저가 작성한 후기 정보 가져오는 모델 실행 결과
  const model_results = await my_model.userReviewModel(login_cookie, req.ip);
  // 모델 실행결과에 따른 분기처리
  // mysql query 메서드 실패
  if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
  // 내가 작성한 후기가 없을 때 (요청은 올바르지만 안타깝게도 응답해줄 DB 정보가 없을 때)
  else if (model_results.state === "등록된후기없음") return res.status(200).json(model_results);
  // 성공적으로 내가 작성한 후기 정보 응답
  else if (model_results.state === "성공적조회") return res.status(200).json(model_results.data);
};

// 내 관심도서관 삭제
const deleteMyLib = async function (req, res) {
  // 로그인 여부 검사
  const login_cookie = req.signedCookies.user;
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 해당 유저가 관심도서관으로 등록한 도서관 정보 삭제하는모델 실행결과
  const model_results = await library_model.deleteMyLibModel(req.query.libraryIndex, login_cookie, req.ip);
  // 실행결과에 따라 분기처리
  // mysql query 메서드 실패
  if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
  // 해당 유저인덱스에 해당 도서관이 관심도서관으로 등록돼있지 않을 때
  if (model_results.state === "존재하지않는정보") return res.status(404).json(model_results);
  // 해당 관심도서관 정보가 삭제됐을 때
  if (model_results.state === "관심도서관삭제") return res.status(204).json(model_results);
};
// 선택 게시글 삭제
const deletePost = async function (req, res) {
  // 로그인 여부 검사
  const login_cookie = req.signedCookies.user;
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 해당 boardIndex에 대한 유저의 권한 체크
  const check_authority = await check_authority_model.isPostAuthorModel(req.query.boardIndex, login_cookie, req.ip);
  // mysql query 메서드 실패
  if (check_authority.state === "mysql 사용실패") return res.status(500).json(check_authority);
  // 해당 boardIndex에 일치하는 게시글이 없거나 삭제됐을 때
  else if (check_authority.state === "존재하지않는게시글") return res.status(404).json(check_authority);
  // 요청한 유저가 해당 게시글의 유저가 아닐 때
  else if (check_authority.state === "접근권한없음") return res.status(403).json(check_authority);
  // 성공적으로 게시글 삭제 요청
  else if (check_authority.state === "접근성공") {
    // 해당 인덱스 게시글 삭제 모델 실행결과
    const model_results = await post_model.deletePostModel(req.query.boardIndex, login_cookie, req.ip);
    // 모델 실행결과에 따른 분기처리
    // mysql query 메서드 실패
    if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
    // 성공적으로 게시글 삭제
    else if (model_results.state === "게시글삭제") return res.status(204).end();
  }
};
// 선택 댓글 삭제
const deleteComment = async function (req, res) {
  // 로그인 여부 검사
  const login_cookie = req.signedCookies.user;
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });

  // 해당 commentIndex에 대한 유저의 권한 체크
  const check_authority = await check_authority_model.isCommentAuthorModel(
    req.query.boardIndex,
    req.query.commentIndex,
    login_cookie,
    req.ip,
  );
  // mysql query 메서드 실패
  if (check_authority.state === "mysql 사용실패") return res.status(500).json(check_authority);
  // 해당 게시글이 존재하지 않거나 이미 삭제됐을 때
  else if (check_authority.state === "존재하지않는게시글") return res.status(400).json(check_authority);
  // 해당 댓글이 존재하지 않거나 이미 삭제됐을 때
  else if (check_authority.state === "존재하지않는댓글") return res.status(404).json(check_authority);
  // 요청한 유저가 해당 댓글 작성자가 아닐 때
  else if (check_authority.state === "접근권한없음") return res.status(403).json(check_authority);
  // 성공적으로 댓글 삭제 요청
  else if (check_authority.state === "접근성공") {
    // 댓글삭제 모델 실행 결과
    const model_results = await comment_model.deleteCommentModel(req.query.commentIndex, login_cookie, req.ip);
    // 모델 실행결과에 따른 분기처리
    // mysql query 메서드 실패
    if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
    // 성공적으로 해당 댓글 삭제
    else if (model_results.state === "댓글삭제") return res.status(204).end();
  }
};
// 도서관 후기 삭제
const deleteReview = async function (req, res) {
  // 로그인 여부 검사
  const login_cookie = req.signedCookies.user;
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });

  // 해당 reviewIndex에 대한 유저의 권한 체크
  const check_authority = await check_authority_model.isReviewAuthorModel(req.query.reviewIndex, login_cookie, req.ip);
  // mysql query 메서드 실패
  if (check_authority.state === "mysql 사용실패") return res.status(500).json(check_authority);
  // 해당 인덱스의 후기가 존재하지 않거나 이미 삭제됐을 때
  else if (check_authority.state === "존재하지않는후기") return res.status(404).json(check_authority);
  // 요청한 유저가 해당 리뷰 작성자가 아닐 때
  else if (check_authority.state === "접근권한없음") return res.status(403).json(check_authority);
  // 성공적으로 해당 후기 삭제 요청
  else if (check_authority.state === "접근성공") {
    // 후기삭제 모델 실행 결과
    const model_results = await review_model.deleteReviewModel(req.query.reviewIndex, login_cookie, req.ip);
    // 모델 실행결과에 따른 분기처리
    // mysql query 메서드 실패
    if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
    // 성공적으로 후기 삭제 요청
    else if (model_results.state === "후기삭제") return res.status(204).end();
  }
};

// 모듈화
module.exports = {
  myLib: myLib,
  myPost: myPost,
  myComment: myComment,
  myReview: myReview,
  deleteMyLib: deleteMyLib,
  deletePost: deletePost,
  deleteComment: deleteComment,
  deleteReview: deleteReview,
};

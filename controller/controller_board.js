// 게시판 라우터의 컨트롤러
// 모델
const post_model = require("../model/post");
const comment_model = require("../model/comment");
// 로그인돼있는 예시 회원정보
const user = {
  id: "Zoe",
  nickName: "Zoe",
  userIndex: 123123,
};
// 전체 게시물 보기
const entireBoard = function (req, res) {
  // 카테고리 정보 가져오는 변수
  let req_category;
  if (req.params.category === "free-bulletin") req_category = "자유게시판";
  if (req.params.category === "proof-shot") req_category = "공부인증샷";
  // 게시글 전체 정보 가져오는 모듈
  const model_results = post_model.entireBoardModel(req_category, req.ip);
  /* TODO 비동기 공부후 다시작성
  if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
  else if (model_results.state === "전체게시글") return res.status(200).json(model_results.data);
  
   */
};

// 게시물 상세보기
const detailBoard = function (req, res) {
  // 특정 게시글 정보 가져오는 모듈
  const model_results = post_model.detailBoardModel(req.params.boardIndex, req.ip);
  // 모듈 실행 결과에 의한 분기처리
  /* TODO 비동기 공부후 다시작성
  if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
  else if (model_results.state === "존재하지않는게시글") return res.status(200).json(model_results);
  else if (model_results.state === "게시글상세보기") return res.status(200).json(model_results.data);
  
   */
};

// 게시글 쓰기
const writePost = function (req, res) {
  const login_cookie = req.signedCookies.user;
  // 로그인 여부 검사
  if (!login_cookie) return res.status(401).json({ state: "글을 작성하기 위해서는 로그인을 해야합니다." });
  // 카테고리 정보 가져오는 변수
  let req_category;
  if (req.params.category === "free-bulletin") req_category = "자유게시판";
  if (req.params.category === "proof-shot") req_category = "공부인증샷";
  // 게시글 작성 모델 실행 결과 변수
  const model_results = post_model.writePostModel(req_category, req.body, login_cookie, req.ip);
  /* TODO 비동기 공부후 다시작성
  if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
  else if (model_results.state === "게시글작성완료") return res.status(201).end();

   */
};

// 글 새로 작성시 그냥 return/ 수정시 기존 게시글 정보 불러오기
const getWrite = function (req, res) {
  const login_cookie = req.signedCookies.user;
  // 로그인 여부 검사
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 글 새로 작성
  if (req.query.boardIndex === "") return res.status(200).end();
  // 기존의 글 수정하는 경우
  // 해당 boardIndex에 대한 유저의 권한 체크
  const check_authority = check_authority_model.isPostAuthorModel(req.query.boardIndex, login_cookie, req.ip);
  if (check_authority.state === "mysql 사용실패") return res.status(500).json(check_authority);
  else if (check_authority.state === "존재하지않는게시글") return res.status(404).json(check_authority);
  else if (check_authority.state === "접근권한없음") return res.status(403).json(check_authority);
  else if (check_authority.state === "접근성공") {
    // 해당 인덱스의 게시글 가져오기
    const model_results = post_model.getWriteModel(req.query.boardIndex, login_cookie, req.ip);
    /* TODO 비동기 공부후 다시작성
    if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
    else if (model_results.state === "존재하지않는게시글") return res.status(404).json(model_results);
    else if (model_results.state === "게시글정보로딩") return res.status(200).json(model_results.data);

     */
  }
};
// 게시글 수정요청
const revisePost = function (req, res) {
  const login_cookie = req.signedCookies.user;
  // 로그인 여부 검사
  if (!login_cookie) return res.status(401).json({ state: "글을 수정하기 위해서는 로그인을 해야합니다." });

  // 해당 boardIndex에 대한 유저의 권한 체크
  const check_authority = check_authority_model.isPostAuthorModel(req.query.boardIndex, login_cookie, req.ip);
  if (check_authority.state === "mysql 사용실패") return res.status(500).json(check_authority);
  else if (check_authority.state === "존재하지않는게시글") return res.status(404).json(check_authority);
  else if (check_authority.state === "접근권한없음") return res.status(403).json(check_authority);
  else if (check_authority.state === "접근성공") {
    // 게시글 수정 모델 실행 결과
    const model_results = post_model.revisePost(req.body, req.query.boardIndex, login_cookie, req.ip);
    /* TODO 비동기 배운 후 다시 작성
    if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
    else if (model_results.state === "게시글수정") return res.status(200).end();

     */
  }
};

// 게시글 삭제하기
const deletePost = function (req, res) {
  const login_cookie = req.signedCookies.user;
  // 로그인 여부 검사
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 해당 boardIndex에 대한 유저의 권한 체크
  const check_authority = check_authority_model.isPostAuthorModel(req.query.boardIndex, login_cookie, req.ip);
  if (check_authority.state === "mysql 사용실패") return res.status(500).json(check_authority);
  else if (check_authority.state === "존재하지않는게시글") return res.status(404).json(check_authority);
  else if (check_authority.state === "접근권한없음") return res.status(403).json(check_authority);
  else if (check_authority.state === "접근성공") {
    // 해당 인덱스 게시글 삭제
    const model_results = post_model.deletePostModel(req.query.boardIndex, login_cookie, req.ip);
    /* TODO 비동기 공부후 다시 작성
    if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
    else if (model_results.state === "게시글삭제") return res.status(204).end();
     */
  }
};

// 댓글 작성
const writeComment = function (req, res) {
  const login_cookie = req.signedCookies.user;
  // 로그인 여부 검사
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 해당 commentIndex에 대한 유저의 권한 체크
  const check_authority = check_authority_model.isCommentAuthorModel(req.query.commentIndex, login_cookie, req.ip);
  if (check_authority.state === "mysql 사용실패") return res.status(500).json(check_authority);
  else if (check_authority.state === "존재하지않는게시글") return res.status(404).json(check_authority);
  else if (check_authority.state === "접근권한없음") return res.status(403).json(check_authority);
  else if (check_authority.state === "접근성공") {
    // 댓글 작성 모델 실행 결과
    const model_results = comment_model.writeCommentModel(req.params.boardIndex, login_cookie, req.ip);
    /* TODO 비동기 공부 후 다시 작성
    if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
    if (model_results.state === "댓글작성") return res.status(201).end();

     */
  }
};

// 댓글 삭제
const deleteComment = function (req, res) {
  const login_cookie = req.signedCookies.user;
  // 로그인 여부 검사
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 해당 commentIndex에 대한 유저의 권한 체크
  const check_authority = check_authority_model.isCommentAuthorModel(req.query.commentIndex, login_cookie, req.ip);
  if (check_authority.state === "mysql 사용실패") return res.status(500).json(check_authority);
  else if (check_authority.state === "존재하지않는게시글") return res.status(404).json(check_authority);
  else if (check_authority.state === "접근권한없음") return res.status(403).json(check_authority);
  else if (check_authority.state === "접근성공") {
    // 댓글삭제 모델 실행 결과
    const model_results = comment_model.deleteCommentModel(req.query.commentIndex, login_cookie, req.ip);
    /* TODO 비동기 공부후 다시작성
    if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
    else if (model_results.state === "댓글삭제") return res.status(204).end();

     */
  }
};

// 좋아요 기능 -> 고민: 유저측에서 관리를 할지, 해당 게시물측에서 관리할지?
// 게시물이 삭제될 경우에 유저 측의 정보를 따로 삭제해주는 기능을 구현해줘야하기 때문에 게시글 측에서 관리하기로 결정.
// 예시 게시글 정보
/*
{
category : "자유게시판",
boardIndex : 134,
likeUser : [{ nickName : "Zoe"}, { nickName : "yeji" }] //< 해당 게시글에 좋아요를 누른 유저 목록

}
 */
const likePost = function (req, res) {
  const login_cookie = req.signedCookies.user;
  // 로그인 여부 검사
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 좋아요 모델 실행 결과
  const model_results = post_model.likePostModel(req.params.boardIndex, login_cookie, req.ip);
  /* TODO 비동기 공부후 다시작성
  if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
  else if (model_results.state === "좋아요 중복요청") return res.status(400).json(model_results);
  else if (model_results.state === "좋아요+1") return res.status(200).json(model_results);

   */
};
// TODO
// 검색기능

module.exports = {
  entireBoard: entireBoard,
  detailBoard: detailBoard,
  writePost: writePost,
  getWrite: getWrite,
  revisePost: revisePost,
  deletePost: deletePost,
  writeComment: writeComment,
  deleteComment: deleteComment,
  likePost: likePost,
};

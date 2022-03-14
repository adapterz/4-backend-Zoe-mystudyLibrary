// 게시판 라우터의 컨트롤러
const post_model = require("../model/post");
const comment_model = require("../model/comment");
const check_authority_model = require("../model/check_authority");
// 전체 게시물 보기
const entireBoard = function (req, res) {
  // params: category
  // params 에 따라서 DB BOARDS 테이블 category 컬럼의 값 설정
  // 요청 category 값이 자유게시판이면 자유게시판의 글 정보만, 공부인증샷면 공부인증샷 게시판의 글 정보만 Select 해오기
  let req_category;
  if (req.params.category === "free-bulletin") req_category = "자유게시판";
  if (req.params.category === "proof-shot") req_category = "공부인증샷";
  // 카테고리에 따른 게시글 전체 정보 가져오는 모듈
  const model_results = post_model.entireBoardModel(req_category, req.ip);
  /* TODO 비동기 공부후 다시작성
  // 모델 실행결과에 따른 분기처리
    // mysql query 메서드 실패
  if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
  // 성공적으로 게시판 정보 가져오기 수행
  else if (model_results.state === "전체게시글") return res.status(200).json(model_results.data);
  
   */
};

// 게시물 상세보기
const detailBoard = function (req, res) {
  // params: boardIndex
  // 특정 게시글인덱스에 따른 데이터 가져오는 모듈
  // 로그인 여부 검사
  const login_cookie = req.signedCookies.user;
  // 로그인을 하지 않았을 때
  if (!login_cookie) {
    const model_results = post_model.detailBoardModel(req.params.boardIndex, req.ip, null);
  }
  // 로그인을 했을 때
  if (login_cookie) {
    const model_results = post_model.detailBoardModel(req.params.boardIndex, req.ip, login_cookie);
  }
  // 모듈 실행 결과에 의한 분기처리
  /* TODO 비동기 공부후 다시작성
    // mysql query 메서드 실패
  if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
  // 해당 boardIndex 정보가 존재하지않거나 삭제됐을 때
  else if (model_results.state === "존재하지않는게시글") return res.status(404).json(model_results);
  // 해당 boardIndex 정보 가져오기
  else if (model_results.state === "게시글상세보기") return res.status(200).json(model_results.data);
   */
};

// 게시글 쓰기
const writePost = function (req, res) {
  /*
  params: category
  req.body
    postTitle: 글제목
    postContent: 글내용
    tags: 태그배열 [{content : 태그내용},{content: 태그내용}]
   */
  // 쿠키의 유저인덱스 정보
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
    // mysql query 메서드 실패
  if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
  // 게시글 작성 요청 성공
  else if (model_results.state === "게시글작성완료") return res.status(201).end();

   */
};

// 글 새로 작성시 그냥 return/ 수정시 기존 게시글 정보 불러오기
const getWrite = function (req, res) {
  // params: category
  const login_cookie = req.signedCookies.user;
  // 유저의 로그인 여부 검사
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 1. 글 새로 작성하는 경우
  if (req.query.boardIndex === "") return res.status(200).end();
  // 2. 기존의 글 수정하는 경우
  // 해당 boardIndex에 대한 유저의 권한 체크 - 해당 게시글을 작성한 유저와 로그인돼있는 쿠키와 비교
  const check_authority = check_authority_model.isPostAuthorModel(req.query.boardIndex, login_cookie, req.ip);
  // mysql query 메서드 실패
  if (check_authority.state === "mysql 사용실패") return res.status(500).json(check_authority);
  // 해당 boardIndex와 일치하는 로우가 없을 때
  else if (check_authority.state === "존재하지않는게시글") return res.status(404).json(check_authority);
  // 로그인돼있는 유저와 해당 게시물 작성 유저가 일치하지 않을 때
  else if (check_authority.state === "접근권한없음") return res.status(403).json(check_authority);
  // 해당 게시물 작성한 유저와 로그인한 유저가 일치할 때
  else if (check_authority.state === "접근성공") {
    // 해당 인덱스의 게시글 정보 가져오기
    const model_results = post_model.getWriteModel(req.query.boardIndex, login_cookie, req.ip);
    /* TODO 비동기 공부후 다시작성
    // mysql query 메서드 실패
    if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
    // 해당 boardIndex와 일치하는 로우가 없을 때
    else if (model_results.state === "존재하지않는게시글") return res.status(404).json(model_results);
    // 성공적으로 게시글 정보 가져왔을 때
    else if (model_results.state === "게시글정보로딩") return res.status(200).json(model_results.data);
     */
  }
};
// 게시글 수정요청
const revisePost = function (req, res) {
  /*
params: category
req.body
  postTitle: 글제목
  postContent: 글내용
  tags: 태그배열
 */
  // 로그인 여부 검사
  const login_cookie = req.signedCookies.user;
  if (!login_cookie) return res.status(401).json({ state: "글을 수정하기 위해서는 로그인을 해야합니다." });

  // 해당 boardIndex에 대한 유저의 권한 체크
  const check_authority = check_authority_model.isPostAuthorModel(req.query.boardIndex, login_cookie, req.ip);
  // mysql query 메서드 실패
  if (check_authority.state === "mysql 사용실패") return res.status(500).json(check_authority);
  // 해당 boardIndex와 일치하는 로우가 없을 때
  else if (check_authority.state === "존재하지않는게시글") return res.status(404).json(check_authority);
  // 로그인돼있는 유저와 해당 게시물 작성 유저가 일치하지 않을 때
  else if (check_authority.state === "접근권한없음") return res.status(403).json(check_authority);
  // 해당 게시물 작성한 유저와 로그인한 유저가 일치할 때
  else if (check_authority.state === "접근성공") {
    // 게시글 수정 모델 실행 결과
    const model_results = post_model.revisePost(req.body, req.query.boardIndex, login_cookie, req.ip);
    /* TODO 비동기 배운 후 다시 작성
    // mysql query 메서드 실패
    if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
    // 성공적으로 게시글 수정 요청 수행
    else if (model_results.state === "게시글수정") return res.status(200).end();
     */
  }
};

// 게시글 삭제하기
const deletePost = function (req, res) {
  // params: boardIndex

  // 로그인 여부 검사
  const login_cookie = req.signedCookies.user;
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 해당 boardIndex에 대한 유저의 권한 체크
  const check_authority = check_authority_model.isPostAuthorModel(req.query.boardIndex, login_cookie, req.ip);
  // mysql query 메서드 실패
  if (check_authority.state === "mysql 사용실패") return res.status(500).json(check_authority);
  // 해당 boardIndex와 일치하는 로우가 없을 때
  else if (check_authority.state === "존재하지않는게시글") return res.status(404).json(check_authority);
  // 로그인돼있는 유저와 해당 게시물 작성 유저가 일치하지 않을 때
  else if (check_authority.state === "접근권한없음") return res.status(403).json(check_authority);
  // 해당 게시물 작성한 유저와 로그인한 유저가 일치할 때
  else if (check_authority.state === "접근성공") {
    // 해당 인덱스 게시글 삭제
    const model_results = post_model.deletePostModel(req.query.boardIndex, login_cookie, req.ip);
    /* TODO 비동기 공부후 다시 작성
     // mysql query 메서드 실패
    if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
    // 성공적으로 게시글 삭제 요청 수행
    else if (model_results.state === "게시글삭제") return res.status(204).end();
     */
  }
};

// 댓글 최초 작성
const writeComment = function (req, res) {
  /*
  params: boardIndex
  req.body
    content: 댓글내용
   */
  // 댓글 작성 모델 실행 결과
  const model_results = comment_model.writeCommentModel(req.params.boardIndex, login_cookie, req.ip);
  /* TODO 비동기 공부 후 다시 작성
     // mysql query 메서드 실패
    if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
    // 성공적으로 댓글 작성 요청 수행
    if (model_results.state === "댓글작성") return res.status(201).end();
*/
};
// 수정시 기존 댓글 정보 불러오기
const getComment = function (req, res) {
  // 로그인 여부 검사
  const login_cookie = req.signedCookies.user;
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 해당 댓글에 대한 유저의 권한 체크
  const check_authority = check_authority_model.isCommentAuthorModel(req.query.commentIndex, login_cookie, req.ip);
  // mysql query 메서드 실패
  if (check_authority.state === "mysql 사용실패") return res.status(500).json(check_authority);
  // 해당 boardIndex와 일치하는 로우가 없을 때
  else if (check_authority.state === "존재하지않는댓글") return res.status(404).json(check_authority);
  // 로그인돼있는 유저와 해당 게시물 작성 유저가 일치하지 않을 때
  else if (check_authority.state === "접근권한없음") return res.status(403).json(check_authority);
  // 해당 게시물 작성한 유저와 로그인한 유저가 일치할 때
  else if (check_authority.state === "접근성공") {
    // 해당 인덱스의 댓글 정보 가져오기
    const model_results = comment_model.getCommentModel(req.query.commentIndex, login_cookie, req.ip);
    /* TODO 비동기 공부후 다시작성
    // mysql query 메서드 실패
    if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
    // 해당 commentIndex와 일치하는 로우가 없을 때
    else if (model_results.state === "존재하지않는댓글") return res.status(404).json(model_results);
    // 성공적으로 댓글 정보 가져왔을 때
    else if (model_results.state === "댓글정보로딩") return res.status(200).json(model_results.data);
     */
  }
};
// 댓글 수정 요청
const reviseComment = function (req, res) {
  // req.body - content (댓글내용)
  // 로그인 여부 검사
  const login_cookie = req.signedCookies.user;
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 해당 댓글에 대한 유저의 권한 체크
  const check_authority = check_authority_model.isCommentAuthorModel(req.query.commentIndex, login_cookie, req.body, req.ip);
  // mysql query 메서드 실패
  if (check_authority.state === "mysql 사용실패") return res.status(500).json(check_authority);
  // 해당 commentIndex와 일치하는 로우가 없을 때
  else if (check_authority.state === "존재하지않는댓글") return res.status(404).json(check_authority);
  // 로그인돼있는 유저와 해당 게시물 작성 유저가 일치하지 않을 때
  else if (check_authority.state === "접근권한없음") return res.status(403).json(check_authority);
  // 해당 게시물 작성한 유저와 로그인한 유저가 일치할 때
  else if (check_authority.state === "접근성공") {
    // 댓글수정 모델 실행 결과
    const model_results = comment_model.reviseCommentModel(req.query.commentIndex, login_cookie, req.ip);
    /* TODO 비동기 공부후 다시작성
    // mysql query 메서드 실패
    if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
    else if(model_results.state === "등록된댓글없음") return res.status(404).json(model_results);
    // 성공적으로 댓글삭제 요청 수행
    else if (model_results.state === "댓글수정") return res.status(200).end();

     */
  }
};
// 댓글 삭제
const deleteComment = function (req, res) {
  // params: boardIndex
  // 로그인 여부 검사
  const login_cookie = req.signedCookies.user;
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 해당 commentIndex에 대한 유저의 권한 체크
  const check_authority = check_authority_model.isCommentAuthorModel(req.query.commentIndex, login_cookie, req.ip);
  // mysql query 메서드 실패
  if (check_authority.state === "mysql 사용실패") return res.status(500).json(check_authority);
  // 해당 commentIndex와 일치하는 로우가 없을 때
  else if (check_authority.state === "존재하지않는댓글") return res.status(404).json(check_authority);
  // 로그인돼있는 유저와 해당 게시물 작성 유저가 일치하지 않을 때
  else if (check_authority.state === "접근권한없음") return res.status(403).json(check_authority);
  // 해당 게시물 작성한 유저와 로그인한 유저가 일치할 때
  else if (check_authority.state === "접근성공") {
    // 댓글삭제 모델 실행 결과
    const model_results = comment_model.deleteCommentModel(req.query.commentIndex, login_cookie, req.ip);
    /* TODO 비동기 공부후 다시작성
    // mysql query 메서드 실패
    if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
    // 성공적으로 댓글삭제 요청 수행
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
  // params: boardIndex
  // 로그인 여부 검사
  const login_cookie = req.signedCookies.user;
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 좋아요 모델 실행 결과
  const model_results = post_model.likePostModel(req.params.boardIndex, login_cookie, req.ip);
  /* TODO 비동기 공부후 다시작성
  // mysql query 메서드 실패
  if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
  // 좋아요를 이미 누른적이 있을 때
  else if (model_results.state === "좋아요 중복요청") return res.status(400).json(model_results);
  // 성공적으로 좋아요 요청 수행
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
  getComment: getComment,
  reviseComment: reviseComment,
  deleteComment: deleteComment,
  likePost: likePost,
};

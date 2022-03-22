// 댓글 컨트롤러
const comment_model = require("../model/comment");
const check_data_or_authority_model = require("../custom_module/check_data_or_authority");
const { FORBIDDEN, UNAUTHORIZED, INTERNAL_SERVER_ERROR, BAD_REQUEST, NOT_FOUND, NO_CONTENT } = require("../custom_module/status_code");
// 댓글 최초 작성
const writeComment = async function (req, res) {
  /*
  req.query : boardIndex
  req.body
    content: 댓글내용
   */
  // 로그인 돼있고 세션키와 발급받은 쿠키의 키가 일치할때 유저인덱스 알려줌
  const login_cookie = req.signedCookies.user;
  let login_index;
  if (req.session.user) {
    if (req.session.user.key === login_cookie) login_index = req.session.user.id;
    else return res.status(403).json({ state: "올바르지않은 접근" });
  } else return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 댓글 작성 모델 실행 결과
  const model_results = await comment_model.writeCommentModel(req.query.boardIndex, login_index, req.body, req.ip);
  // 모델 실행결과에 따른 분기처리
  // mysql query 메서드 실패
  if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
  // 게시글이 존재하지 않을 때
  else if (model_results.state === "존재하지않는게시글") return res.status(404).json(model_results);
  // 성공적으로 댓글 작성 요청 수행
  else if (model_results.state === "댓글작성") return res.status(201).end();
};
// 수정시 기존 댓글 정보 불러오기
const getComment = async function (req, res) {
  /*
  req.query : boardIndex,commentIndex
   */
  // 로그인 돼있고 세션키와 발급받은 쿠키의 키가 일치할때 유저인덱스 알려줌
  const login_cookie = req.signedCookies.user;
  let login_index;
  if (req.session.user) {
    if (req.session.user.key === login_cookie) login_index = req.session.user.id;
    else return res.status(403).json({ state: "올바르지않은 접근" });
  } else return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 해당 댓글유무 체크, 댓글에 대한 유저의 권한 체크
  const check_comment = await check_data_or_authority_model.checkCommentModel(
    req.query.boardIndex,
    req.query.commentIndex,
    login_index,
    req.ip,
  );
  // mysql query 메서드 실패
  if (check_comment.state === "mysql 사용실패") return res.status(500).json(check_comment);
  // 게시글이 존재하지 않을 때
  else if (check_comment.state === "존재하지않는게시글") return res.status(404).json(check_comment);
  // 댓글이 존재하지 않을 때
  else if (check_comment.state === "존재하지않는댓글") return res.status(404).json(check_comment);
  // 로그인돼있는 유저와 해당 게시물 작성 유저가 일치하지 않을 때
  else if (check_comment.state === "접근권한없음") return res.status(403).json(check_comment);
  // 해당 게시물 작성한 유저와 로그인한 유저가 일치할 때
  else if (check_comment.state === "접근성공") {
    // 해당 인덱스의 댓글 정보 가져오기
    const model_results = await comment_model.getCommentModel(req.query.commentIndex, login_index, req.ip);
    // mysql query 메서드 실패
    if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
    // 해당 댓글이 존재하지 않을 때
    else if (model_results.state === "존재하지않는댓글") return res.status(404).json(model_results);
    // 성공적으로 댓글 정보 가져왔을 때
    else if (model_results.state === "댓글정보로딩") return res.status(200).json(model_results.data);
  }
};
// 댓글 수정 요청
const reviseComment = async function (req, res) {
  /*
  req.query: boardIndex, commentIndex
   req.body - content (댓글내용)
   */
  // 로그인 돼있고 세션키와 발급받은 쿠키의 키가 일치할때 유저인덱스 알려줌
  const login_cookie = req.signedCookies.user;
  let login_index;
  if (req.session.user) {
    if (req.session.user.key === login_cookie) login_index = req.session.user.id;
    else return res.status(403).json({ state: "올바르지않은 접근" });
  } else return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 해당 댓글에 존재유무와 유저의 권한 체크
  const check_comment = await check_data_or_authority_model.checkCommentModel(
    req.query.boardIndex,
    req.query.commentIndex,
    login_index,
    req.ip,
  );
  // mysql query 메서드 실패
  if (check_comment.state === "mysql 사용실패") return res.status(500).json(check_comment);
  // 해당 게시글이 없을 때
  else if (check_comment.state === "존재하지않는게시글") return res.status(404).json(check_comment);
  // 해당 댓글이 없을 때
  else if (check_comment.state === "존재하지않는댓글") return res.status(404).json(check_comment);
  // 로그인돼있는 유저와 해당 댓글 작성 유저가 일치하지 않을 때
  else if (check_comment.state === "접근권한없음") return res.status(403).json(check_comment);
  // 해당 댓글 작성한 유저와 로그인한 유저가 일치할 때
  else if (check_comment.state === "접근성공") {
    // 댓글수정 모델 실행 결과
    const model_results = await comment_model.reviseCommentModel(req.query.commentIndex, login_index, req.body, req.ip);
    // 모델 실행결과에 따른 분기처리
    // mysql query 메서드 실패
    if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
    // 성공적으로 댓글수정 요청 수행
    else if (model_results.state === "댓글수정") return res.status(200).end();
  }
};
// 댓글 삭제
const deleteComment = async function (req, res) {
  /*
  req.query: boardIndex, commentIndex
   */
  // 로그인 돼있고 세션키와 발급받은 쿠키의 키가 일치할때 유저인덱스 알려줌
  const login_cookie = req.signedCookies.user;
  let login_index;
  if (req.session.user) {
    if (req.session.user.key === login_cookie) login_index = req.session.user.id;
    else return res.status(FORBIDDEN).json({ state: "올바르지않은 접근" });
  } else return res.status(UNAUTHORIZED).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 해당 게시글,댓글 유무와 댓글에 대한 유저의 권한 체크
  const check_comment = await check_data_or_authority_model.checkCommentModel(
    req.query.boardIndex,
    req.query.commentIndex,
    login_index,
    req.ip,
  );
  // mysql query 메서드 실패
  if (check_comment.state === "mysql 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(check_comment);
  // 해당 게시글이 존재하지 않거나 이미 삭제됐을 때
  else if (check_comment.state === "존재하지않는게시글") return res.status(BAD_REQUEST).json(check_comment);
  // 해당 댓글이 존재하지 않을 때
  else if (check_comment.state === "존재하지않는댓글") return res.status(NOT_FOUND).json(check_comment);
  // 로그인돼있는 유저와 해당 댓글 작성 유저가 일치하지 않을 때
  else if (check_comment.state === "접근권한없음") return res.status(FORBIDDEN).json(check_comment);
  // 해당 댓글 작성한 유저와 로그인한 유저가 일치할 때
  else if (check_comment.state === "접근성공") {
    // 댓글삭제 모델 실행 결과
    const model_results = await comment_model.deleteCommentModel(req.query.commentIndex, login_index, req.ip);
    // mysql query 메서드 실패
    if (model_results.state === "mysql 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(model_results);
    // 성공적으로 댓글삭제 요청 수행
    else if (model_results.state === "댓글삭제") return res.status(NO_CONTENT).end();
  }
};

module.exports = {
  writeComment: writeComment,
  getComment: getComment,
  reviseComment: reviseComment,
  deleteComment: deleteComment,
};

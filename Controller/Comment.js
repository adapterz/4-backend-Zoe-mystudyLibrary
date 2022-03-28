// 댓글 컨트롤러
// 내장 모듈
import commentModel from "../Model/Comment";
import checkDataOrAuthorityModel from "../CustomModule/CheckDataOrAuthority";
import {
  FORBIDDEN,
  UNAUTHORIZED,
  INTERNAL_SERVER_ERROR,
  BAD_REQUEST,
  NOT_FOUND,
  NO_CONTENT,
  CREATED,
  OK,
} from "../CustomModule/StatusCode";
// 댓글 최초 작성
export async function writeComment(req, res) {
  /*
   * req.query
   *  boardIndex
   * req.body
   *  content: 댓글내용
   */
  // 필요 변수 선언
  const loginCookie = req.signedCookies.user;
  let loginIndex;
  // 로그인 돼있고 세션키와 발급받은 쿠키의 키가 일치할때 유저인덱스 알려줌
  if (req.session.user) {
    if (req.session.user.key === loginCookie) loginIndex = req.session.user.id;
    else return res.status(FORBIDDEN).json({ state: "올바르지않은 접근" });
  } else return res.status(UNAUTHORIZED).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 댓글 작성 모델 실행 결과
  const modelResult = await commentModel.writeCommentModel(req.query.boardIndex, loginIndex, req.body, req.ip);
  // 모델 실행결과에 따른 분기처리
  // mysql query 메서드 실패
  if (modelResult.state === "mysql 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
  // 게시글이 존재하지 않을 때
  else if (modelResult.state === "존재하지않는게시글") return res.status(NOT_FOUND).json(modelResult);
  // 성공적으로 댓글 작성 요청 수행
  else if (modelResult.state === "댓글작성") return res.status(CREATED).end();
}
// 수정시 기존 댓글 정보 불러오기
export async function getComment(req, res) {
  /*
   * req.query
   *  boardIndex,commentIndex
   */
  // 필요 변수 선언
  const loginCookie = req.signedCookies.user;
  let loginIndex;
  // 로그인 돼있고 세션키와 발급받은 쿠키의 키가 일치할때 유저인덱스 알려줌
  if (req.session.user) {
    if (req.session.user.key === loginCookie) loginIndex = req.session.user.id;
    else return res.status(FORBIDDEN).json({ state: "올바르지않은 접근" });
  } else return res.status(UNAUTHORIZED).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 해당 댓글유무 체크, 댓글에 대한 유저의 권한 체크
  const checkComment = await checkDataOrAuthorityModel.checkCommentModel(req.query.boardIndex, req.query.commentIndex, loginIndex, req.ip);
  // mysql query 메서드 실패
  if (checkComment.state === "mysql 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(checkComment);
  // 게시글이 존재하지 않을 때
  else if (checkComment.state === "존재하지않는게시글") return res.status(NOT_FOUND).json(checkComment);
  // 댓글이 존재하지 않을 때
  else if (checkComment.state === "존재하지않는댓글") return res.status(NOT_FOUND).json(checkComment);
  // 로그인돼있는 유저와 해당 게시물 작성 유저가 일치하지 않을 때
  else if (checkComment.state === "접근권한없음") return res.status(FORBIDDEN).json(checkComment);
  // 해당 게시물 작성한 유저와 로그인한 유저가 일치할 때
  else if (checkComment.state === "접근성공") {
    // 해당 인덱스의 댓글 정보 가져오기
    const modelResult = await commentModel.getCommentModel(req.query.commentIndex, loginIndex, req.ip);
    // mysql query 메서드 실패
    if (modelResult.state === "mysql 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
    // 해당 댓글이 존재하지 않을 때
    else if (modelResult.state === "존재하지않는댓글") return res.status(NOT_FOUND).json(modelResult);
    // 성공적으로 댓글 정보 가져왔을 때
    else if (modelResult.state === "댓글정보로딩") return res.status(OK).json(modelResult.data);
  }
}
// 댓글 수정 요청
export async function editComment(req, res) {
  /*
   * req.query
   *  boardIndex, commentIndex
   * req.body
   *  content (댓글내용)
   */
  // 필요 변수 선언
  const loginCookie = req.signedCookies.user;
  let loginIndex;
  // 로그인 돼있고 세션키와 발급받은 쿠키의 키가 일치할때 유저인덱스 알려줌
  if (req.session.user) {
    if (req.session.user.key === loginCookie) loginIndex = req.session.user.id;
    else return res.status(FORBIDDEN).json({ state: "올바르지않은 접근" });
  } else return res.status(UNAUTHORIZED).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 해당 댓글에 존재유무와 유저의 권한 체크
  const checkComment = await checkDataOrAuthorityModel.checkCommentModel(req.query.boardIndex, req.query.commentIndex, loginIndex, req.ip);
  // mysql query 메서드 실패
  if (checkComment.state === "mysql 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(checkComment);
  // 해당 게시글이 없을 때
  else if (checkComment.state === "존재하지않는게시글") return res.status(NOT_FOUND).json(checkComment);
  // 해당 댓글이 없을 때
  else if (checkComment.state === "존재하지않는댓글") return res.status(NOT_FOUND).json(checkComment);
  // 로그인돼있는 유저와 해당 댓글 작성 유저가 일치하지 않을 때
  else if (checkComment.state === "접근권한없음") return res.status(FORBIDDEN).json(checkComment);
  // 해당 댓글 작성한 유저와 로그인한 유저가 일치할 때
  else if (checkComment.state === "접근성공") {
    // 댓글수정 모델 실행 결과
    const modelResult = await commentModel.editCommentModel(req.query.commentIndex, loginIndex, req.body, req.ip);
    // 모델 실행결과에 따른 분기처리
    // mysql query 메서드 실패
    if (modelResult.state === "mysql 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
    // 성공적으로 댓글수정 요청 수행
    else if (modelResult.state === "댓글수정") return res.status(OK).end();
  }
}
// 댓글 삭제
export async function deleteComment(req, res) {
  /*
   * req.query
   *  boardIndex, commentIndex
   */
  // 필요 변수 선언
  const loginCookie = req.signedCookies.user;
  let loginIndex;
  // 로그인 돼있고 세션키와 발급받은 쿠키의 키가 일치할때 유저인덱스 알려줌
  if (req.session.user) {
    if (req.session.user.key === loginCookie) loginIndex = req.session.user.id;
    else return res.status(FORBIDDEN).json({ state: "올바르지않은 접근" });
  } else return res.status(UNAUTHORIZED).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 해당 게시글,댓글 유무와 댓글에 대한 유저의 권한 체크
  const checkComment = await checkDataOrAuthorityModel.checkCommentModel(req.query.boardIndex, req.query.commentIndex, loginIndex, req.ip);
  // mysql query 메서드 실패
  if (checkComment.state === "mysql 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(checkComment);
  // 해당 게시글이 존재하지 않거나 이미 삭제됐을 때
  else if (checkComment.state === "존재하지않는게시글") return res.status(BAD_REQUEST).json(checkComment);
  // 해당 댓글이 존재하지 않을 때
  else if (checkComment.state === "존재하지않는댓글") return res.status(NOT_FOUND).json(checkComment);
  // 로그인돼있는 유저와 해당 댓글 작성 유저가 일치하지 않을 때
  else if (checkComment.state === "접근권한없음") return res.status(FORBIDDEN).json(checkComment);
  // 해당 댓글 작성한 유저와 로그인한 유저가 일치할 때
  else if (checkComment.state === "접근성공") {
    // 댓글삭제 모델 실행 결과
    const modelResult = await commentModel.deleteCommentModel(req.query.commentIndex, loginIndex, req.ip);
    // mysql query 메서드 실패
    if (modelResult.state === "mysql 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
    // 성공적으로 댓글삭제 요청 수행
    else if (modelResult.state === "댓글삭제") return res.status(NO_CONTENT).end();
  }
}

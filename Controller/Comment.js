// 댓글 컨트롤러
// 내장 모듈
import { checkBoardMethod, checkCommentMethod } from "../CustomModule/CheckDataOrAuthority";
import {
  deleteCommentModel,
  detailCommentModel,
  editCommentModel,
  getCommentModel,
  writeCommentModel,
} from "../Model/Comment";
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
import jwt from "jsonwebtoken";

/*
 * 1. 댓글 작성
 * 2. 게시글의 댓글정보
 * 3. 수정시 기존댓글 불러오는 모듈
 * 4. 댓글 수정
 * 5. 댓글 삭제
 */

// 댓글 최초 작성
export async function writeCommentController(req, res) {
  /*
   * req.query
   *  boardIndex
   * req.body
   *  content: 댓글내용
   */
  try {
    //  필요 변수 선언
    const loginToken = req.signedCookies.token;
    let loginIndex;
    let parentIndex;
    let checkComment;
    // 로그인 토큰이 없을 때
    if (loginToken === undefined)
      return res.status(UNAUTHORIZED).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
    // 로그인했을 때 토큰의 유저인덱스 불러오기
    loginIndex = await jwt.verify(loginToken, process.env.TOKEN_SECRET).idx;
    const payloadIndex = await jwt.decode(loginToken).idx;
    // payload의 유저인덱스와 signature의 유저인덱스 비교 (조작여부 확인)
    if (loginIndex !== payloadIndex) return res.status(FORBIDDEN).json({ state: "접근 권한이 없습니다." });
    if (req.query.parentIndex !== undefined) parentIndex = req.query.parentIndex;
    else parentIndex = "NULL";
    // 대댓글 작성 시 해당 대댓글의 루트댓글 유무 체크 및 유저의 권한 체크
    if (req.query.parentIndex !== undefined)
      checkComment = await checkCommentMethod(req.query.boardIndex, parentIndex, loginIndex, req.ip);
    // 댓글 작성시 게시글의 유무 체크 및 유저의 권한 체크
    else checkComment = await checkBoardMethod(req.query.boardIndex, loginIndex, req.ip);
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
      // 댓글 작성 모델 실행 결과
      const modelResult = await writeCommentModel(req.query.boardIndex, parentIndex, loginIndex, req.body, req.ip);
      // 모델 실행결과에 따른 분기처리
      // mysql query 메서드 실패
      if (modelResult.state === "mysql 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
      // 성공적으로 댓글 작성 요청 수행
      else if (modelResult.state === "댓글작성") return res.status(CREATED).end();
      // 대댓글에 대댓글 달기 시도했을 때
      else if (modelResult.state === "대댓글에대댓글달기시도") return res.status(BAD_REQUEST).json(modelResult);
      // 성공적으로 대댓글 작성 요청 수행
      else if (modelResult.state === "대댓글작성") return res.status(CREATED).end();
    }
    // 유효하지 않은 토큰일 때
  } catch (err) {
    return res.status(FORBIDDEN).json({ state: "올바르지 않은 접근입니다." });
  }
}
// 게시글의 댓글 정보
export async function detailCommentController(req, res) {
  /*
   * req.query
   *  boardIndex
   *  page
   */
  // 댓글 페이지
  let page;
  // 댓글 page 값
  if (req.query.page !== undefined) page = req.query.page;
  else page = 1;
  // 모델 결과 변수
  const modelResult = await detailCommentModel(req.query.boardIndex, page, req.ip);

  // 모델 실행 결과에 따른 분기처리
  // mysql query 메서드 실패
  if (modelResult.state === "mysql 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
  // 해당 게시글 정보가 없을 때
  else if (modelResult.state === "존재하지않는게시글") return res.status(NOT_FOUND).json(modelResult);
  // 댓글이 없을 때
  else if (modelResult.state === "댓글없음") return res.status(OK).json(modelResult);
  // 해당 게시글 정보 가져오기
  else if (modelResult.state === "게시글의댓글정보") return res.status(OK).json(modelResult.data);
}
// 수정시 기존 댓글 정보 불러오기
export async function getCommentController(req, res) {
  /*
   * req.query
   *  boardIndex,commentIndex
   */
  try {
    //  필요 변수 선언
    const loginToken = req.signedCookies.token;
    let loginIndex;
    // 로그인 토큰이 없을 때
    if (loginToken === undefined)
      return res.status(UNAUTHORIZED).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
    // 로그인했을 때 토큰의 유저인덱스 불러오기
    loginIndex = await jwt.verify(loginToken, process.env.TOKEN_SECRET).idx;
    const payloadIndex = await jwt.decode(loginToken).idx;
    // payload의 유저인덱스와 signature의 유저인덱스 비교 (조작여부 확인)
    if (loginIndex !== payloadIndex) return res.status(FORBIDDEN).json({ state: "접근 권한이 없습니다." });
    // 해당 댓글유무 체크, 댓글에 대한 유저의 권한 체크
    const checkComment = await checkCommentMethod(req.query.boardIndex, req.query.commentIndex, loginIndex, req.ip);
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
      const modelResult = await getCommentModel(req.query.commentIndex, loginIndex, req.ip);
      // mysql query 메서드 실패
      if (modelResult.state === "mysql 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
      // 해당 댓글이 존재하지 않을 때
      else if (modelResult.state === "존재하지않는댓글") return res.status(NOT_FOUND).json(modelResult);
      // 성공적으로 댓글 정보 가져왔을 때
      else if (modelResult.state === "댓글정보로딩") return res.status(OK).json(modelResult.dataOfComment);
    }
    // 유효하지 않은 토큰일 때
  } catch (err) {
    return res.status(FORBIDDEN).json({ state: "올바르지 않은 접근입니다." });
  }
}
// 댓글 수정 요청
export async function editCommentController(req, res) {
  /*
   * req.query
   *  boardIndex, commentIndex
   * req.body
   *  content (댓글내용)
   */
  try {
    //  필요 변수 선언
    const loginToken = req.signedCookies.token;
    let loginIndex;
    // 로그인 토큰이 없을 때
    if (loginToken === undefined)
      return res.status(UNAUTHORIZED).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
    // 로그인했을 때 토큰의 유저인덱스 불러오기
    loginIndex = await jwt.verify(loginToken, process.env.TOKEN_SECRET).idx;
    const payloadIndex = await jwt.decode(loginToken).idx;
    // payload의 유저인덱스와 signature의 유저인덱스 비교 (조작여부 확인)
    if (loginIndex !== payloadIndex) return res.status(FORBIDDEN).json({ state: "접근 권한이 없습니다." });
    // 해당 댓글에 존재유무와 유저의 권한 체크
    const checkComment = await checkCommentMethod(req.query.boardIndex, req.query.commentIndex, loginIndex, req.ip);
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
      const modelResult = await editCommentModel(req.query.commentIndex, loginIndex, req.body, req.ip);
      // 모델 실행결과에 따른 분기처리
      // mysql query 메서드 실패
      if (modelResult.state === "mysql 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
      // 성공적으로 댓글수정 요청 수행
      else if (modelResult.state === "댓글수정") return res.status(OK).end();
    }
    // 유효하지 않은 토큰일 때
  } catch (err) {
    return res.status(FORBIDDEN).json({ state: "올바르지 않은 접근입니다." });
  }
}
// 댓글 삭제
export async function deleteCommentController(req, res) {
  /*
   * req.query
   *  boardIndex, commentIndex
   */
  try {
    //  필요 변수 선언
    const loginToken = req.signedCookies.token;
    let loginIndex;
    // 로그인 토큰이 없을 때
    if (loginToken === undefined)
      return res.status(UNAUTHORIZED).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
    // 로그인했을 때 토큰의 유저인덱스 불러오기
    loginIndex = await jwt.verify(loginToken, process.env.TOKEN_SECRET).idx;
    const payloadIndex = await jwt.decode(loginToken).idx;
    // payload의 유저인덱스와 signature의 유저인덱스 비교 (조작여부 확인)
    if (loginIndex !== payloadIndex) return res.status(FORBIDDEN).json({ state: "접근 권한이 없습니다." });
    // 해당 게시글,댓글 유무와 댓글에 대한 유저의 권한 체크
    const checkComment = await checkCommentMethod(req.query.boardIndex, req.query.commentIndex, loginIndex, req.ip);
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
      const modelResult = await deleteCommentModel(req.query.commentIndex, loginIndex, req.ip);
      // mysql query 메서드 실패
      if (modelResult.state === "mysql 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
      // 성공적으로 댓글삭제 요청 수행
      else if (modelResult.state === "댓글삭제") return res.status(NO_CONTENT).end();
    }
    // 유효하지 않은 토큰일 때
  } catch (err) {
    return res.status(FORBIDDEN).json({ state: "올바르지 않은 접근입니다." });
  }
}

// 댓글 컨트롤러
// 외장 모듈
import jwt from "jsonwebtoken";

// 내장 모듈
import { checkCommentMethod } from "../customModule/checkDataOrAuthority.js";
import {
  deleteCommentModel,
  detailCommentModel,
  editCommentModel,
  getCommentModel,
  writeCommentModel,
  userCommentModel,
} from "../models/comment.js";
import {
  FORBIDDEN,
  UNAUTHORIZED,
  INTERNAL_SERVER_ERROR,
  BAD_REQUEST,
  NOT_FOUND,
  NO_CONTENT,
  CREATED,
  OK,
} from "../customModule/statusCode.js";
/*
 * 1. 댓글 작성
 * 2. 게시글의 댓글정보
 * 3. 수정시 기존댓글 불러오는 모듈
 * 4. 댓글 수정
 * 5. 댓글 삭제
 * 6. 유저가 작성한 댓글 조회
 *
 * 참고: models 메서드에 인자로 보낸 요청한 유저의 ip 정보는 models 수행 로그 남기는데 이용
 */

// 1. 댓글 최초 작성
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
    let parentIndex;
    let checkComment;
    // 로그인 토큰이 없을 때
    if (loginToken === undefined) return res.status(UNAUTHORIZED).json({ state: "login_required" });
    // 로그인했을 때 토큰의 유저인덱스 불러오기
    const loginIndex = await jwt.verify(loginToken, process.env.TOKEN_SECRET).idx;
    const payloadIndex = await jwt.decode(loginToken).idx;
    // payload의 유저인덱스와 signature의 유저인덱스 비교 (조작여부 확인)
    if (loginIndex !== payloadIndex) return res.status(FORBIDDEN).json({ state: "not_authorization" });
    if (req.query.parentIndex !== undefined) parentIndex = req.query.parentIndex;
    else parentIndex = "NULL";
    // 게시글 및 루트 댓글의 존재 유무 체크 및 유저의 권한 체크
    checkComment = await checkCommentMethod(req.query.boardIndex, parentIndex, loginIndex, true, req.ip);
    // sequelize query 메서드 실패
    if (checkComment.state === "fail_sequelize") return res.status(INTERNAL_SERVER_ERROR).json(checkComment);
    // 게시글이 존재하지 않을 때
    else if (checkComment.state === "not_exist") return res.status(NOT_FOUND).json(checkComment);
    // 댓글이 존재하지 않을 때
    else if (checkComment.state === "no_comment") return res.status(NOT_FOUND).json(checkComment);
    // 해당 게시물 작성한 유저와 로그인한 유저가 일치할 때
    else if (checkComment.state === "success_access") {
      // 댓글 작성 모델 실행 결과
      const modelResult = await writeCommentModel(req.query.boardIndex, parentIndex, loginIndex, req.body, req.ip);
      // 모델 실행결과에 따른 분기처리
      // sequelize query 메서드 실패
      if (modelResult.state === "fail_sequelize") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
      // 성공적으로 댓글 작성 요청 수행
      else if (modelResult.state === "write_parent_comment") return res.status(CREATED).end();
      // 대댓글에 대댓글 달기 시도했을 때
      else if (modelResult.state === "try_write_child_comment") return res.status(BAD_REQUEST).json(modelResult);
      // 성공적으로 대댓글 작성 요청 수행
      else if (modelResult.state === "write_child_comment") return res.status(CREATED).end();
    }
  } catch (err) {
    // 만료된 토큰
    if (err.message === "jwt expired") {
      return res.status(UNAUTHORIZED).json({ state: "expired_token" });
    }
    // 유효하지 않은 토큰일 때
    if (err.message === "invalid signature") {
      return res.status(FORBIDDEN).json({ state: "incorrect_access" });
    }
    return res.status(INTERNAL_SERVER_ERROR).json({ state: "unexpected_error" });
  }
}

// 2. 게시글의 댓글 정보
export async function detailCommentController(req, res) {
  /*
   * req.query
   *  boardIndex
   *  page
   */
  try {
    // 댓글 페이지
    let page;
    // 댓글 page 값
    if (req.query.page !== undefined) page = req.query.page;
    else page = 1;
    // 모델 결과 변수
    const modelResult = await detailCommentModel(req.query.boardIndex, page, req.ip);

    // 모델 실행 결과에 따른 분기처리
    // sequelize query 메서드 실패
    if (modelResult.state === "fail_sequelize") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
    // 해당 게시글 정보가 없을 때
    else if (modelResult.state === "not_exist") return res.status(NOT_FOUND).json(modelResult);
    // 댓글이 없을 때
    else if (modelResult.state === "no_comment") return res.status(OK).json(modelResult);
    // 해당 게시글 정보 가져오기
    else if (modelResult.state === "comment_information") return res.status(OK).json(modelResult.data);
  } catch {
    return res.status(INTERNAL_SERVER_ERROR).json({ state: "unexpected_error" });
  }
}

// 3. 수정시 기존 댓글 정보 불러오기
export async function getCommentController(req, res) {
  /*
   * req.query
   *  boardIndex,commentIndex
   */
  try {
    //  필요 변수 선언
    const loginToken = req.signedCookies.token;
    // 로그인 토큰이 없을 때
    if (loginToken === undefined) return res.status(UNAUTHORIZED).json({ state: "login_required" });
    // 로그인했을 때 토큰의 유저인덱스 불러오기
    const loginIndex = await jwt.verify(loginToken, process.env.TOKEN_SECRET).idx;
    const payloadIndex = await jwt.decode(loginToken).idx;
    // payload의 유저인덱스와 signature의 유저인덱스 비교 (조작여부 확인)
    if (loginIndex !== payloadIndex) return res.status(FORBIDDEN).json({ state: "not_authorization" });
    // 해당 댓글유무 체크, 댓글에 대한 유저의 권한 체크
    const checkComment = await checkCommentMethod(
      req.query.boardIndex,
      req.query.commentIndex,
      loginIndex,
      false,
      req.ip
    );
    // sequelize query 메서드 실패
    if (checkComment.state === "fail_sequelize") return res.status(INTERNAL_SERVER_ERROR).json(checkComment);
    // 게시글이 존재하지 않을 때
    else if (checkComment.state === "not_exist") return res.status(NOT_FOUND).json(checkComment);
    // 댓글이 존재하지 않을 때
    else if (checkComment.state === "no_comment") return res.status(NOT_FOUND).json(checkComment);
    // 로그인돼있는 유저와 해당 댓글 작성 유저가 일치하지 않을 때
    else if (checkComment.state === "not_authorization") return res.status(FORBIDDEN).json(checkComment);
    // 해당 게시물 작성한 유저와 로그인한 유저가 일치할 때
    else if (checkComment.state === "success_access") {
      // 해당 인덱스의 댓글 정보 가져오기
      const modelResult = await getCommentModel(req.query.commentIndex, loginIndex, req.ip);
      // sequelize query 메서드 실패
      if (modelResult.state === "fail_sequelize") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
      // 해당 댓글이 존재하지 않을 때
      else if (modelResult.state === "no_comment") return res.status(NOT_FOUND).json(modelResult);
      // 성공적으로 댓글 정보 가져왔을 때
      else if (modelResult.state === "comment_information") return res.status(OK).json(modelResult.dataOfComment);
    }
  } catch (err) {
    // 만료된 토큰
    if (err.message === "jwt expired") {
      return res.status(UNAUTHORIZED).json({ state: "expired_token" });
    }
    // 유효하지 않은 토큰일 때
    if (err.message === "invalid signature") {
      return res.status(FORBIDDEN).json({ state: "incorrect_access" });
    }
    return res.status(INTERNAL_SERVER_ERROR).json({ state: "unexpected_error" });
  }
}
// 4. 댓글 수정 요청
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
    // 로그인 토큰이 없을 때
    if (loginToken === undefined) return res.status(UNAUTHORIZED).json({ state: "login_required" });
    // 로그인했을 때 토큰의 유저인덱스 불러오기
    const loginIndex = await jwt.verify(loginToken, process.env.TOKEN_SECRET).idx;
    const payloadIndex = await jwt.decode(loginToken).idx;
    // payload의 유저인덱스와 signature의 유저인덱스 비교 (조작여부 확인)
    if (loginIndex !== payloadIndex) return res.status(FORBIDDEN).json({ state: "not_authorization" });
    // 해당 댓글에 존재유무와 유저의 권한 체크
    const checkComment = await checkCommentMethod(
      req.query.boardIndex,
      req.query.commentIndex,
      loginIndex,
      false,
      req.ip
    );
    // sequelize query 메서드 실패
    if (checkComment.state === "fail_sequelize") return res.status(INTERNAL_SERVER_ERROR).json(checkComment);
    // 해당 게시글이 없을 때
    else if (checkComment.state === "not_exist") return res.status(NOT_FOUND).json(checkComment);
    // 해당 댓글이 없을 때
    else if (checkComment.state === "no_comment") return res.status(NOT_FOUND).json(checkComment);
    // 로그인돼있는 유저와 해당 댓글 작성 유저가 일치하지 않을 때
    else if (checkComment.state === "not_authorization") return res.status(FORBIDDEN).json(checkComment);
    // 해당 댓글 작성한 유저와 로그인한 유저가 일치할 때
    else if (checkComment.state === "success_access") {
      // 댓글수정 모델 실행 결과
      const modelResult = await editCommentModel(req.query.commentIndex, loginIndex, req.body, req.ip);
      // 모델 실행결과에 따른 분기처리
      // sequelize query 메서드 실패
      if (modelResult.state === "fail_sequelize") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
      // 성공적으로 댓글수정 요청 수행
      else if (modelResult.state === "edit_comment") return res.status(OK).end();
    }
  } catch (err) {
    // 만료된 토큰
    if (err.message === "jwt expired") {
      return res.status(UNAUTHORIZED).json({ state: "expired_token" });
    }
    // 유효하지 않은 토큰일 때
    if (err.message === "invalid signature") {
      return res.status(FORBIDDEN).json({ state: "incorrect_access" });
    }
    return res.status(INTERNAL_SERVER_ERROR).json({ state: "unexpected_error" });
  }
}
// 5. 댓글 삭제
export async function deleteCommentController(req, res) {
  /*
   * req.query
   *  boardIndex, commentIndex
   */
  try {
    //  필요 변수 선언
    const loginToken = req.signedCookies.token;
    // 로그인 토큰이 없을 때
    if (loginToken === undefined) return res.status(UNAUTHORIZED).json({ state: "login_required" });
    // 로그인했을 때 토큰의 유저인덱스 불러오기
    const loginIndex = await jwt.verify(loginToken, process.env.TOKEN_SECRET).idx;
    const payloadIndex = await jwt.decode(loginToken).idx;
    // payload의 유저인덱스와 signature의 유저인덱스 비교 (조작여부 확인)
    if (loginIndex !== payloadIndex) return res.status(FORBIDDEN).json({ state: "not_authorization" });
    // 해당 게시글,댓글 유무와 댓글에 대한 유저의 권한 체크
    const checkComment = await checkCommentMethod(
      req.query.boardIndex,
      req.query.commentIndex,
      loginIndex,
      false,
      req.ip
    );
    // sequelize query 메서드 실패
    if (checkComment.state === "fail_sequelize") return res.status(INTERNAL_SERVER_ERROR).json(checkComment);
    // 해당 게시글이 존재하지 않거나 이미 삭제됐을 때
    else if (checkComment.state === "not_exist") return res.status(NOT_FOUND).json(checkComment);
    // 해당 댓글이 존재하지 않을 때
    else if (checkComment.state === "no_comment") return res.status(NOT_FOUND).json(checkComment);
    // 로그인돼있는 유저와 해당 댓글 작성 유저가 일치하지 않을 때
    else if (checkComment.state === "not_authorization") return res.status(FORBIDDEN).json(checkComment);
    // 해당 댓글 작성한 유저와 로그인한 유저가 일치할 때
    else if (checkComment.state === "success_access") {
      // 댓글삭제 모델 실행 결과
      const modelResult = await deleteCommentModel(req.query.commentIndex, loginIndex, req.ip);
      // sequelize query 메서드 실패
      if (modelResult.state === "fail_sequelize") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
      // 성공적으로 댓글삭제 요청 수행
      else if (modelResult.state === "delete_comment") return res.status(NO_CONTENT).end();
    }
  } catch (err) {
    // 만료된 토큰
    if (err.message === "jwt expired") {
      return res.status(UNAUTHORIZED).json({ state: "expired_token" });
    }
    // 유효하지 않은 토큰일 때
    if (err.message === "invalid signature") {
      return res.status(FORBIDDEN).json({ state: "incorrect_access" });
    }
    return res.status(INTERNAL_SERVER_ERROR).json({ state: "unexpected_error" });
  }
}

// 6. 유저가 작성한 댓글 조회
export async function userCommentController(req, res) {
  try {
    //  필요 변수 선언
    const loginToken = req.signedCookies.token;
    let page;
    // 로그인 토큰이 없을 때
    if (loginToken === undefined) return res.status(UNAUTHORIZED).json({ state: "login_required" });
    // 로그인했을 때 토큰의 유저인덱스 불러오기
    const loginIndex = await jwt.verify(loginToken, process.env.TOKEN_SECRET).idx;
    const payloadIndex = await jwt.decode(loginToken).idx;
    // payload의 유저인덱스와 signature의 유저인덱스 비교 (조작여부 확인)
    if (loginIndex !== payloadIndex) return res.status(FORBIDDEN).json({ state: "not_authorization" });
    // page 값
    if (req.query.page !== undefined) page = req.query.page;
    else page = 1;
    // 해당 유저가 작성한 댓글 정보 가져올 모델 실행 결과
    const modelResult = await userCommentModel(loginIndex, page, req.ip);
    // 모델 실행결과에 따른 분기처리
    // sequelize query 메서드 실패
    if (modelResult.state === "fail_sequelize") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
    // 유저가 작성한 댓글이 없을 때 (요청은 올바르지만 안타깝게도 응답해줄 DB 정보가 없을 때)
    else if (modelResult.state === "no_registered_information") return res.status(OK).json(modelResult);
    // 성공적으로 유저가 작성한 댓글 정보 응답
    else if (modelResult.state === "user_comment") return res.status(OK).json(modelResult.dataOfComment);
  } catch (err) {
    // 만료된 토큰
    if (err.message === "jwt expired") {
      return res.status(UNAUTHORIZED).json({ state: "expired_token" });
    }
    // 유효하지 않은 토큰일 때
    if (err.message === "invalid signature") {
      return res.status(FORBIDDEN).json({ state: "incorrect_access" });
    }
    return res.status(INTERNAL_SERVER_ERROR).json({ state: "unexpected_error" });
  }
}

// 도서관 후기 컨트롤러
// 내장모듈
import { checkReviewMethod } from "../CustomModule/CheckDataOrAuthority";
import {
  FORBIDDEN,
  UNAUTHORIZED,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  NO_CONTENT,
  OK,
  CREATED,
  CONFLICT,
} from "../CustomModule/StatusCode";
import {
  deleteReviewModel,
  detailReviewModel,
  editReviewModel,
  getReviewModel,
  registerReviewModel,
} from "../Model/Review";
import jwt from "jsonwebtoken";

/*
 * 1. 도서관 후기 등록
 * 2. 도서관의 후기 정보
 * 3. 수정시 기존 후기 정보 불러오기
 * 4. 후기 수정 요청
 * 5. 후기 삭제 요청
 *
 * 참고: Model 메서드에 인자로 보낸 요청한 유저의 ip 정보는 Model 수행 로그 남기는데 이용
 */

// 특정 도서관 이용 후 후기 등록
export async function registerReviewController(req, res) {
  /*  req.query
   *   libraryIndex
   *  req.body
   *   reviewContent: 후기 내용
   *   grade: 평점(1~5)
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
    // 후기 등록 모델 사용 결과
    const modelResult = await registerReviewModel(req.query.libraryIndex, loginIndex, req.body, req.ip);
    // 모델 사용 후 분기처리
    // sequelize query 메서드 실패
    if (modelResult.state === "sequelize 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
    // 기존에 작성한 후기가 있을 때
    if (modelResult.state === "기존에 작성한 후기가 존재합니다.") return res.status(CONFLICT).json(modelResult);
    // 성공적으로 도서관 후기 등록
    else if (modelResult.state === "도서관후기등록") return res.status(CREATED).end();
  } catch (err) {
    // 만료된 토큰
    if (err.message === "jwt expired") {
      return res.status(UNAUTHORIZED).json({ state: "만료된 토큰입니다." });
    }
    // 유효하지 않은 토큰일 때
    if (err.message === "invalid signature") {
      return res.status(FORBIDDEN).json({ state: "올바르지 않은 접근입니다." });
    }
    return res.status(FORBIDDEN).json({ state: "접근 권한이 없습니다." });
  }
}

// 도서관의 후기 정보
export async function detailReviewController(req, res) {
  /*
   * req.query
   *  libraryIndex
   *  page
   */
  // 댓글 페이지
  let page;
  // 댓글 page 값
  if (req.query.page !== undefined) page = req.query.page;
  else page = 1;
  // 모델 결과 변수
  const modelResult = await detailReviewModel(req.query.libraryIndex, page, req.ip);

  // 모델 실행 결과에 따른 분기처리
  // sequelize query 메서드 실패
  if (modelResult.state === "sequelize 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
  // 해당 게시글 정보가 없을 때
  else if (modelResult.state === "존재하지않는도서관") return res.status(NOT_FOUND).json(modelResult);
  // 댓글이 없을 때
  else if (modelResult.state === "후기없음") return res.status(OK).json(modelResult);
  // 해당 게시글 정보 가져오기
  else if (modelResult.state === "도서관의후기정보") return res.status(OK).json(modelResult.dataOfReview);
}
// 수정시 기존 댓글 정보 불러오기
export async function getReviewController(req, res) {
  /*
   * req.query
   *  libraryIndex
   *  reviewIndex
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
    // 해당 도서관, 후기 정보가 있는지 확인하고 해당 후기에 대한 유저의 권한 체크
    const checkReview = await checkReviewMethod(req.query.libraryIndex, req.query.reviewIndex, loginIndex, req.ip);
    // sequelize query 메서드 실패
    if (checkReview.state === "sequelize 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(checkReview);
    // 해당 도서관이 정보가 없을 때
    else if (checkReview.state === "존재하지않는도서관") return res.status(NOT_FOUND).json(checkReview);
    // 해당 후기 정보가 없을 때
    else if (checkReview.state === "존재하지않는후기") return res.status(NOT_FOUND).json(checkReview);
    // 로그인돼있는 유저와 해당 후기 작성 유저가 일치하지 않을 때
    else if (checkReview.state === "접근권한없음") return res.status(FORBIDDEN).json(checkReview);
    // 해당 후기 작성 유저와 로그인한 유저가 일치할 때
    else if (checkReview.state === "접근성공") {
      // 해당 인덱스의 후기 정보 가져오기
      const modelResults = await getReviewModel(req.query.reviewIndex, loginIndex, req.ip);
      // sequelize query 메서드 실패
      if (modelResults.state === "sequelize 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(modelResults);
      // 해당 후기 정보가 없을 때
      else if (modelResults.state === "존재하지않는후기") return res.status(NOT_FOUND).json(modelResults);
      // 성공적으로 후기 정보 가져왔을 때
      else if (modelResults.state === "후기정보로딩") return res.status(OK).json(modelResults.dataOfReview);
    }
  } catch (err) {
    // 만료된 토큰
    if (err.message === "jwt expired") {
      return res.status(UNAUTHORIZED).json({ state: "만료된 토큰입니다." });
    }
    // 유효하지 않은 토큰일 때
    if (err.message === "invalid signature") {
      return res.status(FORBIDDEN).json({ state: "올바르지 않은 접근입니다." });
    }
    return res.status(FORBIDDEN).json({ state: "접근 권한이 없습니다." });
  }
}
// 후기 수정 요청
export async function editReviewController(req, res) {
  /*
   * req.body
   *  reviewContent: 댓글내용
   *  grade: 평점
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
    // 해당 도서관,후기가 있는제 확인하고 후기에 대한 유저의 권한 체크
    const checkReview = await checkReviewMethod(req.query.libraryIndex, req.query.reviewIndex, loginIndex, req.ip);
    // sequelize query 메서드 실패
    if (checkReview.state === "sequelize 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(checkReview);
    // 해당 도서관 정보가 없을 때
    else if (checkReview.state === "존재하지않는도서관") return res.status(NOT_FOUND).json(checkReview);
    // 해당 후기 정보가 없을 때
    else if (checkReview.state === "존재하지않는후기") return res.status(NOT_FOUND).json(checkReview);
    // 로그인돼있는 유저와 해당 게시물 작성 유저가 일치하지 않을 때
    else if (checkReview.state === "접근권한없음") return res.status(FORBIDDEN).json(checkReview);
    // 해당 게시물 작성한 유저와 로그인한 유저가 일치할 때
    else if (checkReview.state === "접근성공") {
      // 댓글수정 모델 실행 결과
      const modelResult = await editReviewModel(req.query.reviewIndex, loginIndex, req.body, req.ip);
      // 모델 실행결과에 따른 분기처리
      // sequelize query 메서드 실패
      if (modelResult.state === "sequelize 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
      // 성공적으로 후기수정 요청 수행
      else if (modelResult.state === "후기수정") return res.status(OK).end();
    }
  } catch (err) {
    // 만료된 토큰
    if (err.message === "jwt expired") {
      return res.status(UNAUTHORIZED).json({ state: "만료된 토큰입니다." });
    }
    // 유효하지 않은 토큰일 때
    if (err.message === "invalid signature") {
      return res.status(FORBIDDEN).json({ state: "올바르지 않은 접근입니다." });
    }
    return res.status(FORBIDDEN).json({ state: "접근 권한이 없습니다." });
  }
}
// 후기 삭제
export async function deleteReviewController(req, res) {
  /*
   * req.query
   *  libraryIndex
   *  reviewIndex
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
    // 해당 도서관,후기 존재 유무와 해당 후기에 대한 유저의 권한 체크
    const checkReview = await checkReviewMethod(req.query.libraryIndex, req.query.reviewIndex, loginIndex, req.ip);
    // sequelize query 메서드 실패
    if (checkReview.state === "sequelize 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(checkReview);
    // 해당 도서관 정보가 없을 때
    else if (checkReview.state === "존재하지않는도서관") return res.status(NOT_FOUND).json(checkReview);
    // 해당 인덱스의 후기가 존재하지 않거나 이미 삭제됐을 때
    else if (checkReview.state === "존재하지않는후기") return res.status(NOT_FOUND).json(checkReview);
    // 요청 유저가 해당 후기를 작성한 유저가 아닐 때
    else if (checkReview.state === "접근권한없음") return res.status(FORBIDDEN).json(checkReview);
    // 접근 성공
    else if (checkReview.state === "접근성공") {
      // 후기삭제 모델 실행 결과
      const modelResult = await deleteReviewModel(req.query.reviewIndex, loginIndex, req.ip);
      // 모델 실행결과에 따른 분기처리
      // sequelize query 메서드 실패
      if (modelResult.state === "sequelize 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
      // 성공적으로 해당 후기 삭제
      else if (modelResult.state === "후기삭제") return res.status(NO_CONTENT).end();
    }
  } catch (err) {
    // 만료된 토큰
    if (err.message === "jwt expired") {
      return res.status(UNAUTHORIZED).json({ state: "만료된 토큰입니다." });
    }
    // 유효하지 않은 토큰일 때
    if (err.message === "invalid signature") {
      return res.status(FORBIDDEN).json({ state: "올바르지 않은 접근입니다." });
    }
    return res.status(FORBIDDEN).json({ state: "접근 권한이 없습니다." });
  }
}

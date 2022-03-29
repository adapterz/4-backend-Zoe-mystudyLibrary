// 도서관 후기 컨트롤러
// 내장모듈
import { checkReviewMethod } from "../CustomModule/CheckDataOrAuthority";
import { FORBIDDEN, UNAUTHORIZED, INTERNAL_SERVER_ERROR, NOT_FOUND, NO_CONTENT, OK, CREATED } from "../CustomModule/StatusCode";
import { deleteReviewModel, editReviewModel, getReviewModel, registerReviewModel } from "../Model/Review";

/*
 * 1. 도서관 후기 등록
 * 2. 수정시 기존 후기 정보 불러오기
 * 3. 후기 수정 요청
 * 4. 후기 삭제 요청
 */

// 특정 도서관 이용 후 후기 등록
export async function registerReviewController(req, res) {
  /*  req.query
   *   libraryIndex
   *  req.body
   *   reviewContent: 후기 내용
   *   grade: 평점(1~5)
   */
  // 필요 변수 미리 선언
  const loginCookie = req.signedCookies.user;
  let loginIndex;
  // 로그인 돼있고 세션키와 발급받은 쿠키의 키가 일치할때 유저인덱스 알려줌
  if (req.session.user) {
    if (req.session.user.key === loginCookie) loginIndex = req.session.user.id;
    else return res.status(FORBIDDEN).json({ state: "올바르지않은 접근" });
  } else return res.status(UNAUTHORIZED).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 후기 등록 모델 사용 결과
  const modelResult = await registerReviewModel(req.query.libraryIndex, loginIndex, req.body, req.ip);
  // 모델 사용 후 분기처리
  // mysql query 메서드 실패
  if (modelResult.state === "mysql 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
  // 성공적으로 도서관 후기 등록
  else if (modelResult.state === "도서관후기등록") return res.status(CREATED).end();
}

// 수정시 기존 댓글 정보 불러오기
export async function getReviewController(req, res) {
  /*
   * req.query
   *  libraryIndex
   *  reviewIndex
   */

  // 필요 변수 선언
  const loginCookie = req.signedCookies.user;
  let loginIndex;
  // 로그인 돼있고 세션키와 발급받은 쿠키의 키가 일치할때 유저인덱스 알려줌
  if (req.session.user) {
    if (req.session.user.key === loginCookie) loginIndex = req.session.user.id;
    else return res.status(FORBIDDEN).json({ state: "올바르지않은 접근" });
  } else return res.status(UNAUTHORIZED).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 해당 도서관, 후기 정보가 있는지 확인하고 해당 후기에 대한 유저의 권한 체크
  const checkReview = await checkReviewMethod(req.query.libraryIndex, req.query.reviewIndex, loginIndex, req.ip);
  // mysql query 메서드 실패
  if (checkReview.state === "mysql 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(checkReview);
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
    // mysql query 메서드 실패
    if (modelResults.state === "mysql 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(modelResults);
    // 해당 후기 정보가 없을 때
    else if (modelResults.state === "존재하지않는후기") return res.status(NOT_FOUND).json(modelResults);
    // 성공적으로 후기 정보 가져왔을 때
    else if (modelResults.state === "후기정보로딩") return res.status(OK).json(modelResults.data);
  }
}
// 후기 수정 요청
export async function editReviewController(req, res) {
  /*
   * req.body
   *  reviewContent: 댓글내용
   *  grade: 평점
   */

  // 필요 변수 선언
  const loginCookie = req.signedCookies.user;
  let loginIndex;
  // 로그인 돼있고 세션키와 발급받은 쿠키의 키가 일치할때 유저인덱스 알려줌
  if (req.session.user) {
    if (req.session.user.key === loginCookie) loginIndex = req.session.user.id;
    else return res.status(FORBIDDEN).json({ state: "올바르지않은 접근" });
  } else return res.status(UNAUTHORIZED).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 해당 도서관,후기가 있는제 확인하고 후기에 대한 유저의 권한 체크
  const checkReview = await checkReviewMethod(req.query.libraryIndex, req.query.reviewIndex, loginIndex, req.ip);
  // mysql query 메서드 실패
  if (checkReview.state === "mysql 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(checkReview);
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
    // mysql query 메서드 실패
    if (modelResult.state === "mysql 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
    // 성공적으로 후기수정 요청 수행
    else if (modelResult.state === "후기수정") return res.status(OK).end();
  }
}
// 후기 삭제
export async function deleteReviewController(req, res) {
  /*
   * req.query
   *  libraryIndex
   *  reviewIndex
   */

  // 필요 변수 선언
  const loginCookie = req.signedCookies.user;
  let loginIndex;
  // 로그인 돼있고 세션키와 발급받은 쿠키의 키가 일치할때 유저인덱스 알려줌
  if (req.session.user) {
    if (req.session.user.key === loginCookie) loginIndex = req.session.user.id;
    else return res.status(FORBIDDEN).json({ state: "올바르지않은 접근" });
  } else return res.status(UNAUTHORIZED).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });

  // 해당 도서관,후기 존재 유무와 해당 후기에 대한 유저의 권한 체크
  const checkReview = await checkReviewMethod(req.query.libraryIndex, req.query.reviewIndex, loginIndex, req.ip);
  // mysql query 메서드 실패
  if (checkReview.state === "mysql 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(checkReview);
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
    // mysql query 메서드 실패
    if (modelResult.state === "mysql 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
    // 성공적으로 해당 후기 삭제
    else if (modelResult.state === "후기삭제") return res.status(NO_CONTENT).end();
  }
}

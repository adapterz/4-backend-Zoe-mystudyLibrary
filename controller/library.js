// 내정보 컨트롤러
const library_model = require("../model/library");
const review_model = require("../model/review");
const check_authority_model = require("../model/check_authority");
const comment_model = require("../model/comment");

// 전체 도서관 정보
const allLib = function (req, res) {
  // 전체 도서관 정보 가져오는 모델실행 결과
  const model_results = library_model.allLibModel(req.ip);
  /* TODO 비동기 공부한 후 작성
    // mysql query 메서드 실패
  if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
  // 전체 도서관 정보 응답
  else if (model_results.state === "전체도서관정보") return res.status(200).json(model_results.data);
   */
};

// 내가 사는 지역을 입력하면 주변 도서관 정보를 주는 함수(post)
const localLib = function (req, res) {
  /*
  rea.body
    nameOfCity: 시도명
    districts: 시군구명
   */
  // 유저가 요청한 시도명/시군구명에 맞게 데이터 가져오는 모델 실행 결과
  const model_results = library_model.localLibModel(req.body, req.ip);
  // 모델 실행 결과에 따른 분기처리
  /* TODO 비동기 공부한 후 작성
    // mysql query 메서드 실패
  if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
  // 도서관 정보가 없을 때(올바른 요청이지만 안타깝게도 정보가 존재하지 않을 때)
  else if (model_results.state === "존재하지않는정보") return res.status(200).json(model_results);
  // 도서관 정보가 있을 때 도서관 정보 응답
  else if (model_results.state === "주변도서관") return res.status(200).json(model_results.data);
   */
};

// 특정 도서관인덱스의 도서관 정보 응답
const particularLib = function (req, res) {
  // params: libIndex
  // 특정 libIndex의 도서관 정보 자세히 보는 모델 실행 결과
  const model_results = library_model.particularLibModel(req.params.libIndex, req.ip);
  // 결과에따른 분기처리
  /* TODO 비동기 공부한 후 작성
  // mysql query 메서드 실패
  if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
  // 해당 libIndex의 정보가 존재하지 않거나 삭제됐을 때
  else if (model_results.state === "존재하지않는정보") return res.status(404).json(model_results);
  // 성공적으로 해당 도서관 정보 응답
  else if (model_results.state === "상세도서관정보") return res.status(200).json(model_results.data);
   */
};

// 내 정보 '관심도서관' 항목에 해당 인덱스의 도서관 데이터 추가
const registerMyLib = function (req, res) {
  // params: libIndex
  // 로그인 여부 검사
  const login_cookie = req.signedCookies.user;
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 관심도서관 항목 추가 모델 실행 결과
  const model_results = library_model.registerMyLibModel(req.params.libIndex, login_cookie, req.ip);
  /* TODO 비동기 공부한 후 작성
   // mysql query 메서드 실패
  if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
  // 성공적으로 관심도서관 추가 요청 수행
  else if (model_results.state === "유저의관심도서관") return res.status(200).end();
   */
};

// 특정 도서관 이용 후 후기등록
const registerComment = function (req, res) {
  /* params: libIndex
  req.body
    reviewContent: 후기 내용
    grade: 평점(1~5)
   */
  // 로그인 여부 검사

  const login_cookie = req.signedCookies.user;
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 후기 등록 모델 사용 결과
  const model_results = review_model.registerReviewModel(req.params.libIndex, login_cookie, req.body, req.ip);
  /* TODO 비동기 공부한 후 작성
  // mysql query 메서드 실패
  if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
  // 성공적으로 도서관 후기 등록
  else if (model_results.state === "도서관후기등록") return res.status(201).end();
   */
};

// 수정시 기존 댓글 정보 불러오기
const getReview = function (req, res) {
  // 로그인 여부 검사
  const login_cookie = req.signedCookies.user;
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 해당 후기에 대한 유저의 권한 체크
  const check_authority = check_authority_model.isReviewAuthorModel(req.query.reviewIndex, login_cookie, req.ip);
  // mysql query 메서드 실패
  if (check_authority.state === "mysql 사용실패") return res.status(500).json(check_authority);
  // 해당 boardIndex와 일치하는 로우가 없을 때
  else if (check_authority.state === "존재하지않는후기") return res.status(404).json(check_authority);
  // 로그인돼있는 유저와 해당 게시물 작성 유저가 일치하지 않을 때
  else if (check_authority.state === "접근권한없음") return res.status(403).json(check_authority);
  // 해당 게시물 작성한 유저와 로그인한 유저가 일치할 때
  else if (check_authority.state === "접근성공") {
    // 해당 인덱스의 댓글 정보 가져오기
    const model_results = review_model.getReviewModel(req.query.reviewIndex, login_cookie, req.ip);
    /* TODO 비동기 공부후 다시작성
    // mysql query 메서드 실패
    if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
    // 해당 commentIndex와 일치하는 로우가 없을 때
    else if (model_results.state === "존재하지않는후기") return res.status(404).json(model_results);
    // 성공적으로 댓글 정보 가져왔을 때
    else if (model_results.state === "후기정보로딩") return res.status(200).json(model_results.data);
     */
  }
};
// 댓글 수정 요청
const reviseReview = function (req, res) {
  // req.body - reviewContent (댓글내용), grade(평점)
  // 로그인 여부 검사
  const login_cookie = req.signedCookies.user;
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 해당 후기에 대한 유저의 권한 체크
  const check_authority = check_authority_model.isReviewAuthorModel(req.query.reviewIndex, login_cookie, req.body, req.ip);
  // mysql query 메서드 실패
  if (check_authority.state === "mysql 사용실패") return res.status(500).json(check_authority);
  // 해당 commentIndex와 일치하는 로우가 없을 때
  else if (check_authority.state === "존재하지않는후기") return res.status(404).json(check_authority);
  // 로그인돼있는 유저와 해당 게시물 작성 유저가 일치하지 않을 때
  else if (check_authority.state === "접근권한없음") return res.status(403).json(check_authority);
  // 해당 게시물 작성한 유저와 로그인한 유저가 일치할 때
  else if (check_authority.state === "접근성공") {
    // 댓글수정 모델 실행 결과
    const model_results = review_model.reviseReviewModel(req.query.reviewIndex, login_cookie, req.ip);
    /* TODO 비동기 공부후 다시작성
    // mysql query 메서드 실패
    if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
    else if(model_results.state === "존재하지않는후기") return res.status(404).json(model_results);
    // 성공적으로 댓글삭제 요청 수행
    else if (model_results.state === "후기수정") return res.status(200).end();

     */
  }
};
// 후기 삭제
const deleteReview = function (req, res) {
  // params: libIndex
  // 로그인 여부 검사
  const login_cookie = req.signedCookies.user;
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 해당 후기에 대한 유저의 권한 체크
  const check_authority = check_authority_model.isReviewAuthorModel(req.query.reviewIndex, login_cookie, req.ip);
  // mysql query 메서드 실패
  if (check_authority.state === "mysql 사용실패") return res.status(500).json(check_authority);
  // 해당 인덱스의 후기가 존재하지 않거나 이미 삭제됐을 때
  else if (check_authority.state === "존재하지않는후기") return res.status(404).json(check_authority);
  // 요청 유저가 해당 후기를 작성한 유저가 아닐 때
  else if (check_authority.state === "접근권한없음") return res.status(403).json(check_authority);
  else if (check_authority.state === "접근성공") {
    // 후기삭제 모델 실행 결과
    const model_results = review_model.deleteReviewModel(req.query.reviewIndex, login_cookie, req.ip);
    /*TODO 비동기 공부후 다시작성
    // mysql query 메서드 실패
    if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
    // 성공적으로 해당 후기 삭제
    else if (model_results.state === "후기삭제") return res.status(204).end();
  */
  }
};

// 모듈화
module.exports = {
  allLib: allLib,
  localLib: localLib,
  particularLib: particularLib,
  registerMyLib: registerMyLib,
  registerComment: registerComment,
  getReview: getReview,
  reviseReview: reviseReview,
  deleteReview: deleteReview,
};

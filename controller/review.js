// 특정 도서관 이용 후 후기등록
const review_model = require("../model/review");
const check_data_or_authority_model = require("../my_module/check_data_or_authority");
const registerReview = async function (req, res) {
  /* params: libIndex
  req.body
    reviewContent: 후기 내용
    grade: 평점(1~5)
   */
  // 로그인 여부 검사

  const login_cookie = req.signedCookies.user;
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 후기 등록 모델 사용 결과
  const model_results = await review_model.registerReviewModel(req.query.libraryIndex, login_cookie, req.body, req.ip);
  // mysql query 메서드 실패
  if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
  // 성공적으로 도서관 후기 등록
  else if (model_results.state === "도서관후기등록") return res.status(201).end();
};

// 수정시 기존 댓글 정보 불러오기
const getReview = async function (req, res) {
  // 로그인 여부 검사
  const login_cookie = req.signedCookies.user;
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 해당 후기에 대한 유저의 권한 체크
  const check_review = await check_data_or_authority_model.checkReviewModel(
    req.query.libraryIndex,
    req.query.reviewIndex,
    login_cookie,
    req.ip,
  );
  // mysql query 메서드 실패
  if (check_review.state === "mysql 사용실패") return res.status(500).json(check_review);
  // 해당 도서관이 정보가 없을 때
  else if (check_review.state === "존재하지않는도서관") return res.status(404).json(check_review);
  // 해당 boardIndex와 일치하는 로우가 없을 때
  else if (check_review.state === "존재하지않는후기") return res.status(404).json(check_review);
  // 로그인돼있는 유저와 해당 게시물 작성 유저가 일치하지 않을 때
  else if (check_review.state === "접근권한없음") return res.status(403).json(check_review);
  // 해당 게시물 작성한 유저와 로그인한 유저가 일치할 때
  else if (check_review.state === "접근성공") {
    // 해당 인덱스의 댓글 정보 가져오기
    const model_results = await review_model.getReviewModel(req.query.reviewIndex, login_cookie, req.ip);
    // mysql query 메서드 실패
    if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
    // 해당 commentIndex와 일치하는 로우가 없을 때
    else if (model_results.state === "존재하지않는후기") return res.status(404).json(model_results);
    // 성공적으로 댓글 정보 가져왔을 때
    else if (model_results.state === "후기정보로딩") return res.status(200).json(model_results.data);
  }
};
// 후기 수정 요청
const reviseReview = async function (req, res) {
  // req.body - reviewContent (댓글내용), grade(평점)
  // 로그인 여부 검사
  const login_cookie = req.signedCookies.user;
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 해당 후기에 대한 유저의 권한 체크
  const check_review = await check_data_or_authority_model.checkReviewModel(
    req.query.libraryIndex,
    req.query.reviewIndex,
    login_cookie,
    req.ip,
  );
  // mysql query 메서드 실패
  if (check_review.state === "mysql 사용실패") return res.status(500).json(check_review);
  // 해당 도서관이 정보가 없을 때
  else if (check_review.state === "존재하지않는도서관") return res.status(404).json(check_review);
  // 해당 commentIndex와 일치하는 로우가 없을 때
  else if (check_review.state === "존재하지않는후기") return res.status(404).json(check_review);
  // 로그인돼있는 유저와 해당 게시물 작성 유저가 일치하지 않을 때
  else if (check_review.state === "접근권한없음") return res.status(403).json(check_review);
  // 해당 게시물 작성한 유저와 로그인한 유저가 일치할 때
  else if (check_review.state === "접근성공") {
    // 댓글수정 모델 실행 결과
    const model_results = await review_model.reviseReviewModel(req.query.reviewIndex, login_cookie, req.body, req.ip);
    // mysql query 메서드 실패
    if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
    // 성공적으로 댓글삭제 요청 수행
    else if (model_results.state === "후기수정") return res.status(200).end();
  }
};
// 후기 삭제
const deleteReview = async function (req, res) {
  // params: libIndex
  // 로그인 여부 검사
  const login_cookie = req.signedCookies.user;
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 해당 후기에 대한 유저의 권한 체크
  const check_review = await check_data_or_authority_model.checkReviewModel(
    req.query.libraryIndex,
    req.query.reviewIndex,
    login_cookie,
    req.ip,
  );
  // mysql query 메서드 실패
  if (check_review.state === "mysql 사용실패") return res.status(500).json(check_review);
  else if (check_review.state === "존재하지않는도서관") return res.status(404).json(check_review);
  // 해당 인덱스의 후기가 존재하지 않거나 이미 삭제됐을 때
  else if (check_review.state === "존재하지않는후기") return res.status(404).json(check_review);
  // 요청 유저가 해당 후기를 작성한 유저가 아닐 때
  else if (check_review.state === "접근권한없음") return res.status(403).json(check_review);
  else if (check_review.state === "접근성공") {
    // 후기삭제 모델 실행 결과
    const model_results = await review_model.deleteReviewModel(req.query.reviewIndex, login_cookie, req.ip);
    // mysql query 메서드 실패
    if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
    // 성공적으로 해당 후기 삭제
    else if (model_results.state === "후기삭제") return res.status(204).end();
  }
};

// 모듈화
module.exports = {
  registerReview: registerReview,
  getReview: getReview,
  reviseReview: reviseReview,
  deleteReview: deleteReview,
};

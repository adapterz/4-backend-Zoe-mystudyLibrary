// 내주변도서관 라우터의 컨트롤러
// db 모듈
const db = require("../a_mymodule/db");
// 날짜/시간 관련 모듈
const moment = require("../a_mymodule/date_time");
const mysql = require("mysql");
// 모델
const library_model = require("../model/library");

// 예시 데이터 (전체 도서관)
const user = {
  id: "Zoe",
  userIndex: 132132,
  nickName: "Zoe",
};

// 전체 도서관 정보 (get)
const allLib = function (req, res) {
  // 전체 도서관 정보 가져오는 모델실행 결과
  const model_results = library_model.allLibModel(req.ip);
  /* TODO 비동기 공부한 후 작성
  if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results.state);
  else if (model_results.state === "전체도서관정보") return res.status(200).json(model_results.data);
   */
};

// 내가 사는 지역을 입력하면 주변 도서관 정보를 주는 함수(post)
const localLib = function (req, res) {
  // 유저가 요청한 시도명/시군구명에 맞게 데이터 가져오는 모델 실행 결과
  const model_results = library_model.localLibModel(req.body, req.ip);
  // 결과에 따른 분기처리
  /* TODO 비동기 공부한 후 작성
  if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results.state);
  else if (model_results.state === "존재하지않는정보") return res.status(200).json(model_results.state);
  else if (model_results.state === "주변도서관") return res.status(200).json(model_results.data);
   */
};

// 특정 도서관 자세히 보기
const particularLib = function (req, res) {
  // 특정 libIndex의 도서관 정보 자세히 보는 모델 실행 결과
  // 결과에따른 분기처리
  const model_results = library_model.particularLibModel(req.params.libIndex, req.ip);

  /* TODO 비동기 공부한 후 작성
  if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results.state);
  else if (model_results.state === "존재하지않는정보") return res.status(404).json(model_results.state);
  else if (model_results.state === "상세도서관정보") return res.status(200).json(model_results.data);
   */
};

// 내 정보 '관심도서관' 항목에 해당 인덱스의 도서관 데이터 추가
const registerMyLib = function (req, res) {
  const login_cookie = req.signedCookies.user;
  // 로그인 여부 검사
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 관심도서관 항목 추가 모델 실행 결과
  const model_results = library_model.registerMyLibModel(req.params.libIndex, login_cookie, req.ip);
  /* TODO 비동기 공부한 후 작성
  if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results.state);
  else if (model_results.state === "유저의관심도서관") return res.status(200).end();
   */
};

// TODO 로그인 배운 뒤 다시 작성
// 특정 도서관 이용 후 후기등록
const registerComment = function (req, res) {
  const login_cookie = req.signedCookies.user;
  // 로그인 여부 검사
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 후기 등록 쿼리문
  const query = "INSERT INTO REVIEW(libIndex,userIndex,reviewContent,created,grade) VALUES (?,?,?,?,?)";
  db.db_connect.query(
    query,
    [req.params.libIndex, login_cookie, req.body.reviewContent, moment().format("YYYY-MM-DD HH:mm:ss"), req.body.grade],
    function (err) {
      // 오류 발생
      if (err) {
        console.log(("registerComment 메서드 mysql 모듈사용 실패:" + err).red.bold);
        return res.status(500).json({ state: "registerComment 메서드 mysql 모듈사용 실패:" + err });
      }
      // 정상적으로 쿼리문 실행(후기 등록)
      console.log(("CLIENT IP: " + req.ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + query).blue.bold);

      return res.status(201).end();
    },
  );
};

// TODO 로그인 배운 뒤 다시 작성
// 후기 삭제
const deleteReview = function (req, res) {
  const login_cookie = req.signedCookies.user;
  // 로그인 여부 검사
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });

  const query = "UPDATE REVIEW SET deleteDate = ? WHERE reviewIndex = ? WHERE userIndex =" + mysql.escape(login_cookie);
  // 오류 발생
  db.db_connect.query(query, [moment().format("YYYY-MM-DD HH:mm:ss"), req.query.reviewIndex], function (err) {
    if (err) {
      console.log(("deleteReview 메서드 mysql 모듈사용 실패:" + err).red.bold);
      return res.status(500).json({ state: "deleteReview 메서드 mysql 모듈사용 실패:" + err });
    }
    // 정상적으로 쿼리문 실행(후기 삭제)
    console.log(("CLIENT IP: " + req.ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + query).blue.bold);
    return res.status(204).end();
  });
};

// 모듈화
module.exports = {
  allLib: allLib,
  localLib: localLib,
  particularLib: particularLib,
  registerMyLib: registerMyLib,
  registerComment: registerComment,
  deleteReview: deleteReview,
};

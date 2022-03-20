// 내정보 컨트롤러
const library_model = require("../model/library");

// 전체 도서관 정보
const allLib = async function (req, res) {
  // 전체 도서관 정보 가져오는 모델실행 결과
  const model_results = await library_model.allLibModel(req.ip);
  // mysql query 메서드 실패
  if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
  // 전체 도서관 정보 응답
  else if (model_results.state === "전체도서관정보") return res.status(200).json(model_results.data);
};

// 내가 사는 지역을 입력하면 주변 도서관 정보를 주는 함수(post)
const localLib = async function (req, res) {
  /*
  rea.body
    nameOfCity: 시도명
    districts: 시군구명
   */
  // 유저가 요청한 시도명/시군구명에 맞게 데이터 가져오는 모델 실행 결과
  const model_results = await library_model.localLibModel(req.body, req.ip);
  // 모델 실행 결과에 따른 분기처리
  // mysql query 메서드 실패
  if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
  // 도서관 정보가 없을 때(올바른 요청이지만 안타깝게도 정보가 존재하지 않을 때)
  else if (model_results.state === "존재하지않는정보") return res.status(200).json(model_results);
  // 도서관 정보가 있을 때 도서관 정보 응답
  else if (model_results.state === "주변도서관") return res.status(200).json(model_results.data);
};

// 특정 도서관인덱스의 도서관 정보 응답
const particularLib = async function (req, res) {
  // params: libIndex
  // 특정 libIndex의 도서관 정보 자세히 보는 모델 실행 결과
  const model_results = await library_model.particularLibModel(req.params.libIndex, req.ip);
  // 결과에따른 분기처리
  // mysql query 메서드 실패
  if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
  // 해당 libIndex의 정보가 존재하지 않거나 삭제됐을 때
  else if (model_results.state === "존재하지않는정보") return res.status(404).json(model_results);
  // 성공적으로 해당 도서관 정보 응답
  else if (model_results.state === "상세도서관정보") return res.status(200).json(model_results.data);
};

// 내 정보 '관심도서관' 항목에 해당 인덱스의 도서관 데이터 추가
const registerMyLib = async function (req, res) {
  // params: libIndex
  // 로그인 여부 검사
  const login_cookie = req.signedCookies.user;
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 관심도서관 항목 추가 모델 실행 결과
  const model_results = await library_model.registerMyLibModel(req.params.libIndex, login_cookie, req.ip);
  // mysql query 메서드 실패
  if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
  else if (model_results.state === "중복된등록요청") return res.status(400).json(model_results);
  // 성공적으로 관심도서관 추가 요청 수행
  else if (model_results.state === "관심도서관추가") return res.status(200).end();
};

// 모듈화
module.exports = {
  allLib: allLib,
  localLib: localLib,
  particularLib: particularLib,
};

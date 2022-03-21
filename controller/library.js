// 도서관 컨트롤러
const library_model = require("../model/library");

// 전체 도서관 정보
const allLib = async function (req, res) {
  // 전체 도서관 정보 가져오는 모델실행 결과
  const model_results = await library_model.allLibModel(req.ip);
  // 모델 실행결과에 따른 분기처리
  // mysql query 메서드 실패
  if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
  // 전체 도서관 정보 응답
  else if (model_results.state === "전체도서관정보") return res.status(200).json(model_results.data);
};

// 내가 사는 지역을 입력하면 주변 도서관 정보를 주는 메서드
const localLib = async function (req, res) {
  /*
  req.body
    nameOfCity: 시도명
    districts: 시군구명
   */
  // 유저가 요청한 시도명/시군구명에 맞게 데이터 가져오는 모델 실행 결과
  const model_results = await library_model.localLibModel(req.query, req.ip);
  // 모델 실행 결과에 따른 분기처리
  // mysql query 메서드 실패
  if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
  // 도서관 정보가 없을 때(올바른 요청이지만 안타깝게도 정보가 존재하지 않을 때)
  else if (model_results.state === "존재하지않는정보") return res.status(200).json(model_results);
  // 도서관 정보가 있을 때 도서관 정보 응답
  else if (model_results.state === "주변도서관") return res.status(200).json(model_results.data);
};

// 특정 도서관인덱스의 도서관 정보 응답
const detailLib = async function (req, res) {
  // req.params: libraryIndex
  // 특정 libraryIndex의 도서관 정보 자세히 보는 모델 실행 결과
  const model_results = await library_model.particularLibModel(req.params.libraryIndex, req.ip);
  // 결과에 따른 분기처리
  // mysql query 메서드 실패
  if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
  // 해당 도서관 정보가 존재하지 않거나 삭제됐을 때
  else if (model_results.state === "존재하지않는정보") return res.status(404).json(model_results);
  // 성공적으로 해당 도서관 정보 응답
  else if (model_results.state === "상세도서관정보") return res.status(200).json(model_results.data);
};

// 모듈화
module.exports = {
  allLib: allLib,
  localLib: localLib,
  detailLib: detailLib,
};

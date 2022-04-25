// 도서관 컨트롤러
// 내장모듈
import { allLibraryModel, detailLibraryModel, localLibraryModel } from "../model/library.js";
import { INTERNAL_SERVER_ERROR, OK, NOT_FOUND } from "../customModule/statusCode.js";

/*
 * 1. 전체도서관 정보
 * 2. 입력한 지역의 도서관 정보
 * 3. 특정 인덱스의 도서관 정보
 *
 * 참고: model 메서드에 인자로 보낸 요청한 유저의 ip 정보는 model 수행 로그 남기는데 이용
 */

// 전체 도서관 정보
export async function allLibraryController(req, res) {
  // 전체 도서관 정보 가져오는 모델실행 결과
  const modelResult = await allLibraryModel(req.ip);
  // 모델 실행결과에 따른 분기처리
  // sequelize query 메서드 실패
  if (modelResult.state === "sequelize 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
  // 전체 도서관 정보 응답
  else if (modelResult.state === "전체도서관정보") return res.status(OK).json(modelResult.dataOfLibrary);
}

// 내가 사는 지역을 입력하면 주변 도서관 정보를 주는 메서드
export async function localLibraryController(req, res) {
  /*
   *  req.query
   *    nameOfCity: 시도명
   *    districts: 시군구명
   */
  // 유저가 요청한 시도명/시군구명에 맞게 데이터 가져오는 모델 실행 결과
  const modelResult = await localLibraryModel(req.query, req.ip);
  // 모델 실행 결과에 따른 분기처리
  // sequelize query 메서드 실패
  if (modelResult.state === "sequelize 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
  // 도서관 정보가 없을 때(올바른 요청이지만 안타깝게도 정보가 존재하지 않을 때)
  else if (modelResult.state === "존재하지않는정보") return res.status(OK).json(modelResult);
  // 도서관 정보가 있을 때 도서관 정보 응답
  else if (modelResult.state === "주변도서관") return res.status(OK).json(modelResult.dataOfLibrary);
}

// 특정 도서관인덱스의 도서관 정보 응답
export async function detailLibraryController(req, res) {
  // req.params: libraryIndex
  // 특정 libraryIndex의 도서관 정보 자세히 보는 모델 실행 결과
  const modelResult = await detailLibraryModel(req.params.libraryIndex, req.ip);
  // 결과에 따른 분기처리
  // sequelize query 메서드 실패
  if (modelResult.state === "sequelize 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
  // 해당 도서관 정보가 존재하지 않거나 삭제됐을 때
  else if (modelResult.state === "존재하지않는정보") return res.status(NOT_FOUND).json(modelResult);
  // 성공적으로 해당 도서관 정보 응답
  else if (modelResult.state === "상세도서관정보") return res.status(OK).json(modelResult.dataOfLibrary);
}

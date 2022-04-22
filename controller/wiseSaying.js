// 메인 리소스가 아닌 리소스의 컨트롤러
// 내부모듈
import { INTERNAL_SERVER_ERROR, NOT_FOUND, OK } from "../customModule/statusCode";
import { wiseSayingModel } from "../model/wiseSaying";
/*
 * 1. 랜덤으로 명언 정보 가져오는 컨트롤러
 *
 * 참고: model 메서드에 인자로 보낸 요청한 유저의 ip 정보는 model 수행 로그 남기는데 이용
 */

// 1. 랜덤한 명언 정보 가져오는 컨트롤러

export async function wiseSayingController(req, res) {
  // 최신글 자유게시판 글 5개/공부인증샷 글 4개 불러오는 모델 실행결과
  const modelResult = await wiseSayingModel(req.ip);
  // sequelize query 메서드 실패
  if (modelResult.state === "sequelize 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
  // 명언 리소스 찾는 것을 실패했을 때
  else if (modelResult.state === "존재하지않는정보") return res.status(NOT_FOUND).json(modelResult);
  // 성공적으로 최신글 정보 가져왔을 때
  else if (modelResult.state === "명언정보") return res.status(OK).json(modelResult.dataOfWiseSaying);
}

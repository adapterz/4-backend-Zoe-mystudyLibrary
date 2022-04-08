// 그 밖의 리소스 관련 모델
// 내장모듈
import { myPool } from "../CustomModule/Db";
import { queryFailLog, querySuccessLog } from "../CustomModule/QueryLog";
import { newLine } from "../CustomModule/ChangeDataForm";
import { randomNum } from "../CustomModule/RandomNum";

export async function wiseSayingModel(ip) {
  // 1 ~ 50 랜덤한 값 뽑기
  const random = await randomNum(1, 50);
  // 랜덤하게 명언 정보 가져오기
  const query = `SELECT wiseSayingContent, celebrity FROM wiseSaying WHERE wiseSayingIdx = ${random}`;
  // 성공시
  try {
    const [results, fields] = await myPool.query(query);
    // 성공 로그찍기
    await querySuccessLog(ip, query);
    // 정보가 없을 때
    if (results[0] === undefined) {
      return { state: "존재하지않는정보" };
    }
    // 가져온 정보 가공

    // 해당 게시글의 데이터 파싱
    // 게시글 데이터
    const wiseSayingData = {
      wiseSayingContent: await newLine(results[0].wiseSayingContent, 25),
      celebrity: results[0].celebrity,
    };
    // 가져온 게시글 정보 return
    return { state: "명언정보", dataOfWiseSaying: wiseSayingData };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await queryFailLog(err, ip, query);
    return { state: "mysql 사용실패" };
  }
}

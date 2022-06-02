// 명언 모델
// 내장모듈
import { db, Op } from "../orm/models/index.mjs";
import { modelFailLog, modelSuccessLog } from "../customModule/modelLog.js";
import { randomNum } from "../customModule/randomNum.js";

// 랜덤으로 DB에서 명언 정보 가져오기
export async function wiseSayingModel(ip) {
  // 1 ~ 50 랜덤한 값 뽑기
  const random = await randomNum(1, 50);
  // 성공시
  try {
    let result = await db["wiseSaying"].findAll({
      attributes: ["wiseSayingContent", "celebrity"],
      where: {
        wiseSayingIndex: { [Op.eq]: random },
      },
    });
    // 정보가 없을 때
    if (result[0] === undefined) {
      // 성공 로그찍기
      await modelSuccessLog(ip, "wiseSayingModel");
      return { state: "not_exist" };
    }
    // 가져온 정보 가공

    // 해당 게시글의 데이터 파싱
    // 게시글 데이터
    const wiseSayingData = {
      wiseSayingContent: result[0].wiseSayingContent,
      celebrity: result[0].celebrity,
    };
    // 가져온 게시글 정보 return
    return { state: "wiseSaying_information", dataOfWiseSaying: wiseSayingData };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "wiseSayingModel");
    return { state: "fail_sequelize" };
  }
}

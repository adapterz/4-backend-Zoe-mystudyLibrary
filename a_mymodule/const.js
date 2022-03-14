// 자주 사용하는 반복적인 코드 정의
const moment = require("./date_time");

// model 에서 쿼리 메서드 수행 실패시 로그 찍기 및 모델 실행 결과 반환
export const queryFailLog = function (err) {
  if (err) {
    console.log(("model-isAuthor 메서드 mysql 모듈사용 실패:" + err).red.bold);

    return { state: "mysql 사용실패" };
  }
};
// model 에서 쿼리 메서드 성공적으로 수행시 로그 찍기
export const querySuccessLog = function (ip, query) {
  console.log(("CLIENT IP: " + ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + query).blue.bold);
};

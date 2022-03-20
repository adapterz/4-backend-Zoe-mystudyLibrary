// 쿼리문 성공/실패 여부 로그
const moment = require("./date_time");
// model 에서 쿼리 메서드 수행 실패시 로그 찍기 및 모델 실행 결과 반환
function queryFail(err, ip, query) {
  console.log(
    ("mysql 모듈사용 실패:" + err + "\nCLIENT IP: " + ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + query)
      .red.bold,
  );
}
// model 에서 쿼리 메서드 성공적으로 수행시 로그 찍기
async function querySuccessLog(ip, query) {
  console.log(("CLIENT IP: " + ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + query).blue.bold);
}

module.exports = {
  queryFail: queryFail,
  querySuccessLog: querySuccessLog,
};

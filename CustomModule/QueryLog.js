// 쿼리문 성공/실패 여부 로그
import { moment } from "./DateTime";
// Model 에서 쿼리 메서드 수행 실패시 로그 찍기 및 모델 실행 결과 반환
export async function queryFailLog(err, ip, query) {
  console.log(
    ("mysql 모듈사용 실패:" + err + "\nCLIENT IP: " + ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + query)
      .red.bold,
  );
}
// Model 에서 쿼리 메서드 성공적으로 수행시 로그 찍기
export async function querySuccessLog(ip, query) {
  console.log(("CLIENT IP: " + ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + query).blue.bold);
}

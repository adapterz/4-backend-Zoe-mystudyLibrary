// sequelize 를 사용한 model 메서드 성공/실패 여부 로그
import { moment } from "./dateTime";
// model 에서 쿼리 메서드 수행 실패시 로그 찍기 및 모델 실행 결과 반환
export async function modelFailLog(err, ip, method) {
  console.log(
    (
      "sequelize 모듈사용 실패:" +
      err +
      "\nCLIENT IP: " +
      ip +
      "\nDATETIME: " +
      moment().format("YYYY-MM-DD HH:mm:ss") +
      "\nMETHOD: " +
      method
    ).red.bold
  );
}
// model 에서 쿼리 메서드 성공적으로 수행시 로그 찍기
export async function modelSuccessLog(ip, method) {
  console.log(
    (
      "sequelize 모듈사용 성공 \nCLIENT IP: " +
      ip +
      "\nDATETIME: " +
      moment().format("YYYY-MM-DD HH:mm:ss") +
      "\nMETHOD: " +
      method
    ).blue.bold
  );
}

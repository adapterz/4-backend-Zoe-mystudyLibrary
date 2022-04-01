// 조회수/좋아요 수 단위바꿔주기
import { moment } from "./DateTime";

export async function changeUnit(viewOrFavoriteCount) {
  const length = viewOrFavoriteCount.toString().length;
  // 1억이상일 때
  if (viewOrFavoriteCount >= 100000000) {
    // 천만 단위에서 반올림
    const roundCount = Math.round(viewOrFavoriteCount / 100000000) * 100000000;
    // '억'으로 단위변경
    return roundCount.toString().substring(0, length - 8) + " 억";
  }
  // 1억 이하 1000만 이상일 때
  else if (viewOrFavoriteCount < 100000000 && viewOrFavoriteCount >= 10000000) {
    // 백만 단위에서 반올림
    const roundCount = Math.round(viewOrFavoriteCount / 10000000) * 10000000;
    return roundCount.toString().substring(0, length - 7) + " 천만";
  }
  // 1000만 이하 100만 이상일 때
  else if (viewOrFavoriteCount < 10000000 && viewOrFavoriteCount >= 1000000) {
    // 십만 단위에서 반올림
    const roundCount = Math.round(viewOrFavoriteCount / 1000000) * 1000000;
    return roundCount.toString().substring(0, length - 6) + " 백만";
  }
  // 100만 이하 10만 이상일 때
  else if (viewOrFavoriteCount < 1000000 && viewOrFavoriteCount >= 100000) {
    // 만 단위에서 반올림
    const roundCount = Math.round(viewOrFavoriteCount / 100000) * 100000;
    return roundCount.toString().substring(0, length - 5) + " 십만";
  }
  // 10만 이하 만 이상일 때
  else if (viewOrFavoriteCount < 100000 && viewOrFavoriteCount >= 10000) {
    // 천 단위에서 반올림
    const roundCount = Math.round(viewOrFavoriteCount / 10000) * 10000;
    return roundCount.toString().substring(0, length - 4) + " 만";
  }
  // 만 이하 천 이상일 때
  else if (viewOrFavoriteCount < 10000 && viewOrFavoriteCount >= 1000) {
    // 백 단위에서 반올림
    const roundCount = Math.round(viewOrFavoriteCount / 1000) * 1000;
    return roundCount.toString().substring(0, length - 3) + " 천";
  }
  // 천 이하는 단위변경 x
  else return viewOrFavoriteCount;
}

// DateTime yyyy-mm-dd 형태로 변경해주는 메서드
export async function changeDateTimeForm(dateTime) {
  let tempDateTime = moment(dateTime, "YYYY-MM-DD").toDate();
  const stringDateTime =
    tempDateTime.getFullYear().toString() +
    "년 " +
    (tempDateTime.getMonth() + 1).toString() +
    "월 " +
    tempDateTime.getDate().toString() +
    "일";
  return stringDateTime;
}

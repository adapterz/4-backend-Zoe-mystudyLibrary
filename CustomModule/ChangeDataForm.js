// 조회수/좋아요 수 단위바꿔주기
import { moment } from "./DateTime";

export async function changeUnit(viewOrFavoriteCount) {
  const length = viewOrFavoriteCount.toString().length;
  // 1억이상일 때
  if (viewOrFavoriteCount >= 100000000) {
    // 천만 단위 숫자가 0일 때
    if (viewOrFavoriteCount.toString().substring(length - 8, length - 7) === "0") {
      return viewOrFavoriteCount.toString().substring(0, length - 8) + "억 ";
    }
    // 천만 단위 숫자가 1 이상일 때
    else if (viewOrFavoriteCount.toString().substring(length - 8, length - 7) !== "0") {
      return (
        viewOrFavoriteCount.toString().substring(0, length - 8) +
        "억 " +
        viewOrFavoriteCount.toString().substring(length - 8, length - 7) +
        "천만"
      );
    }
  }
  // 1억 이하 1000만 이상일 때
  else if (viewOrFavoriteCount < 100000000 && viewOrFavoriteCount >= 10000000) {
    // 백만 단위 숫자가 0일 때
    if (viewOrFavoriteCount.toString().substring(length - 7, length - 6) === "0") {
      return viewOrFavoriteCount.toString().substring(0, length - 7) + "천만 ";
    }
    // 백만 단위 숫자가 1 이상일 때
    else if (viewOrFavoriteCount.toString().substring(length - 8, length - 7) !== "0") {
      return (
        viewOrFavoriteCount.toString().substring(0, length - 7) +
        "천 " +
        viewOrFavoriteCount.toString().substring(length - 7, length - 6) +
        "백만"
      );
    }
  }
  // 1000만 이하 100만 이상일 때
  else if (viewOrFavoriteCount < 10000000 && viewOrFavoriteCount >= 1000000) {
    // 십만 단위 숫자가 0일 때
    if (viewOrFavoriteCount.toString().substring(length - 6, length - 5) === "0") {
      return viewOrFavoriteCount.toString().substring(0, length - 6) + "백만 ";
    }
    // 십만 단위 숫자가 1 이상일 때
    else if (viewOrFavoriteCount.toString().substring(length - 6, length - 5) !== "0") {
      return (
        viewOrFavoriteCount.toString().substring(0, length - 6) +
        "백 " +
        viewOrFavoriteCount.toString().substring(length - 6, length - 5) +
        "십만"
      );
    }
  }
  // 100만 이하 10만 이상일 때
  else if (viewOrFavoriteCount < 1000000 && viewOrFavoriteCount >= 100000) {
    // 만 단위 숫자가 0일 때
    if (viewOrFavoriteCount.toString().substring(length - 5, length - 4) === "0") {
      return viewOrFavoriteCount.toString().substring(0, length - 5) + "십만 ";
    }
    // 만 단위 숫자가 1 이상일 때
    else if (viewOrFavoriteCount.toString().substring(length - 5, length - 4) !== "0") {
      return (
        viewOrFavoriteCount.toString().substring(0, length - 5) +
        "십 " +
        viewOrFavoriteCount.toString().substring(length - 5, length - 4) +
        "만"
      );
    }
  }
  // 10만 이하 만 이상일 때
  else if (viewOrFavoriteCount < 100000 && viewOrFavoriteCount >= 10000) {
    // 천 단위 숫자가 0일 때
    if (viewOrFavoriteCount.toString().substring(length - 4, length - 3) === "0") {
      return viewOrFavoriteCount.toString().substring(0, length - 4) + "만 ";
    }
    // 천 단위 숫자가 1 이상일 때
    else if (viewOrFavoriteCount.toString().substring(length - 4, length - 3) !== "0") {
      return (
        viewOrFavoriteCount.toString().substring(0, length - 4) +
        "만 " +
        viewOrFavoriteCount.toString().substring(length - 4, length - 3) +
        "천"
      );
    }
  }
  // 만 이하 천 이상일 때
  else if (viewOrFavoriteCount < 10000 && viewOrFavoriteCount >= 1000) {
    // 천 단위 숫자가 0일 때
    if (viewOrFavoriteCount.toString().substring(length - 3, length - 2) === "0") {
      return viewOrFavoriteCount.toString().substring(0, length - 3) + "천 ";
    }
    // 천 단위 숫자가 1 이상일 때
    else if (viewOrFavoriteCount.toString().substring(length - 3, length - 2) !== "0") {
      return (
        viewOrFavoriteCount.toString().substring(0, length - 3) +
        "천 " +
        viewOrFavoriteCount.toString().substring(length - 3, length - 2) +
        "백"
      );
    }
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

// 도서관 후기 평균 평점 정보 가공
export async function changeGradeForm(grade) {
  // 후기가 없을 때
  if (grade === 0) return "후기없음";
  // 평점이 일의자리수만 있으면 .0 붙여주기
  else if (grade.toString().length === 1) return "★ " + grade.toString() + ".0 / 5 점";
  // 평점의 소수점 1의자리까지 있다면 문자열화만 해주기
  else return "★ " + grade.toString() + " / 5점";
}

// 도서관 정보 가공(전체도서관/ 지역도서관)
export async function changeLibrarysDataForm(libraryData) {
  // 도서관명이 15글자 이상일 때 자르기
  if (libraryData.libraryName.length >= 15) {
    libraryData.libraryName = libraryData.libraryName.substring(0, 15) + "...";
  }
  // 도서관 유형이 10글자 이상일때 자르기
  if (libraryData.libraryType.length >= 10) {
    libraryData.libraryType = libraryData.libraryType.substring(0, 10) + "...";
  }
  // 휴관일이 15글자 이상일때 자르기
  if (libraryData.closeDay.length >= 15) {
    libraryData.closeDay = libraryData.closeDay.substring(0, 15) + "...";
  }
  // 시작, 종료시간 5글자까지일떄 자르기(00:00 형태)
  libraryData.openWeekday = libraryData.openWeekday.toString().substring(0, 5);
  libraryData.endWeekday = libraryData.endWeekday.toString().substring(0, 5);
  libraryData.openSaturday = libraryData.openSaturday.toString().substring(0, 5);
  libraryData.endSaturday = libraryData.endSaturday.toString().substring(0, 5);
  libraryData.openHoliday = libraryData.openHoliday.toString().substring(0, 5);
  libraryData.endHoliday = libraryData.endHoliday.toString().substring(0, 5);

  // 주소 20글자까지 자르기

  if (libraryData.address.length >= 20) {
    libraryData.address = libraryData.address.substring(0, 20) + "...";
  }

  if (libraryData.libraryContact === "") libraryData.libraryContact = "연락처 없음";
  return libraryData;
}

// 도서관 정보 가공(특정 인덱스 도서관정보)
export async function changeLibraryDataForm(libraryData) {
  // 연락처가 빈문자열일 때 연락처 없다고 표기해주기
  if (libraryData.libraryContact === "") {
    libraryData.libraryContact = "연락처 없음";
  }
  // 휴관일 글자수 너무 길 경우 글자수 잘라주기
  // 50~100
  if (libraryData.closeDay.length > 50 && libraryData.closeDay.length <= 100) {
    libraryData.closeDay = libraryData.closeDay.substring(0, 50) + "\n" + libraryData.closeDay.substring(50, 100);
  }
  // 100~150
  else if (libraryData.closeDay.length > 100 && libraryData.closeDay.length <= 150) {
    libraryData.closeDay =
      libraryData.closeDay.substring(0, 50) +
      "\n" +
      libraryData.closeDay.substring(50, 100) +
      "\n" +
      libraryData.closeDay.substring(100, 150);
  }
  return libraryData;
}
// 후기 데이터 가공
export async function changeReviewDataForm(reviewData) {
  // 닉네임이 null이면 삭제된 닉네임 취급
  if (reviewData.nickName === null) reviewData.nickName = "삭제된 유저 정보입니다.";
  // 평점만큼 별 개수 출력하게 하기
  reviewData.grade = Number(reviewData.grade.toString().substring(0, 1));
  let tempStar = "";
  for (let i = 1; i <= 5; ++i) {
    if (i <= reviewData.grade) tempStar += "★";
    else tempStar += "☆";
  }
  tempStar += " " + reviewData.grade;

  reviewData.grade = tempStar;
  return reviewData;
}

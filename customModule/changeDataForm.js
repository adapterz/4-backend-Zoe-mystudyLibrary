// 내부모듈
import { moment } from "./dateTime.js"
/*
 * 1. 조회수/좋아요 수 단위 바꿔주는 메서드
 * 2. 도서관 후기 평균 평점 정보 가공
 * 3. 도서관 정보 가공(전체도서관/ 지역도서관)
 * 4. 도서관 정보 가공(특정 인덱스 도서관정보)
 * 5. 삭제된 닉네임 일 경우 null -> 삭제된 유저입니다로 변경
 * 6. 특정 글자수 단위로 개행문자 넣어주는 메서드
 * 7. 도서관 종류(Int)를 문자열로 바꿔주는 메서드
 */
// 조회수/좋아요 수 단위 바꿔주는 메서드
export async function changeUnit(viewOrFavoriteCount) {
  const length = viewOrFavoriteCount.toString().length
  // 1000,000 이상일 때
  if (viewOrFavoriteCount >= 1000000) {
    // 100,000 단위 숫자가 0일 때
    if (viewOrFavoriteCount.toString().substring(length - 6, length - 5) === "0") {
      return viewOrFavoriteCount.toString().substring(0, length - 6) + "M "
    }
    // 100,000 1 이상일 때
    else if (viewOrFavoriteCount.toString().substring(length - 6, length - 5) !== "0") {
      return (
        viewOrFavoriteCount.toString().substring(0, length - 6) +
        "." +
        viewOrFavoriteCount.toString().substring(length - 6, length - 5) +
        "M"
      )
    }
  }
  // 1000,000이하 1000 이상일 때
  else if (viewOrFavoriteCount < 100000000 && viewOrFavoriteCount >= 1000) {
    // 100 단위가가 0일 때
    if (viewOrFavoriteCount.toString().substring(length - 3, length - 2) === "0") {
      return viewOrFavoriteCount.toString().substring(0, length - 3) + "K"
    }
    // 100단위가 1일 때
    else if (viewOrFavoriteCount.toString().substring(length - 3, length - 2) !== "0") {
      return (
        viewOrFavoriteCount.toString().substring(0, length - 3) +
        "." +
        viewOrFavoriteCount.toString().substring(length - 3, length - 2) +
        "K"
      )
    }
  }
  // 천 이하는 단위변경 x
  else return viewOrFavoriteCount
}

// yyyy-mm-dd 형태로 변경해주는 메서드
export async function changeTimestampForm(timestamp) {
  const isToday = moment().isSame(moment(timestamp), "day")
  let stringTimestamp
  // 작성일이 오늘일 때
  if (isToday) {
    stringTimestamp = moment(timestamp).format("YYYY년MM월DD일 HH시MM분")
    // 작성일이 오늘이 아닐 때
  } else if (!isToday) {
    stringTimestamp = moment(timestamp).format("YYYY년MM월DD일")
  }

  return stringTimestamp
}

/*
 * 도서관 후기 평균 평점 정보 가공
 * 1. 후기 없을 때
 * 2. 후기가 있는데 평균 평점이 정수로 딱 떨어질 때
 * 3. 후기가 있고 평균 평점이 정수가 아닐 때
 */
export async function changeGradeForm(grade) {
  // 1. 후기가 없을 때
  if (grade === 0) return "후기없음"
  // 2. 평균 평점이 정수로 딱 떨어질 때 ".0" 붙여주기
  else if (grade.toString().length === 1) return grade.toString() + ".0"
  // 3. 평균 평점이 정수가 아닐 때 소수점 1의자리까지 문자열화
  else return grade.toString()
}

// 도서관 정보 가공(전체도서관/ 지역도서관)
export async function changeLibrarysDataForm(libraryData) {
  // 도서관명이 15글자 이상일 때 자르고 ... 붙이기
  if (libraryData.libraryName.length >= 15) {
    libraryData.libraryName = libraryData.libraryName.substring(0, 15) + "..."
  }
  // 도서관 유형이 10글자 이상일때 자르고 ... 붙이기
  if (libraryData.libraryType.length >= 10) {
    libraryData.libraryType = libraryData.libraryType.substring(0, 10) + "..."
  }
  // 휴관일이 15글자 이상일때 자르고 ... 붙이기
  if (libraryData.closeDay.length >= 15) {
    libraryData.closeDay = libraryData.closeDay.substring(0, 15) + "..."
  }
  // 시작, 종료시간 5글자까지일떄 자르기(00:00:00 -> 00:00 형태)
  libraryData.openWeekday = libraryData.openWeekday.toString().substring(0, 5)
  libraryData.endWeekday = libraryData.endWeekday.toString().substring(0, 5)
  libraryData.openSaturday = libraryData.openSaturday.toString().substring(0, 5)
  libraryData.endSaturday = libraryData.endSaturday.toString().substring(0, 5)
  libraryData.openHoliday = libraryData.openHoliday.toString().substring(0, 5)
  libraryData.endHoliday = libraryData.endHoliday.toString().substring(0, 5)

  // 주소 20글자까지 자르고 ... 붙이기
  if (libraryData.address.length >= 20) {
    libraryData.address = libraryData.address.substring(0, 20) + "..."
  }
  // 연락처 문자열이 비어있을 때
  if (libraryData.libraryContact === "") libraryData.libraryContact = "연락처 없음"
  return libraryData
}

// 도서관 정보 가공(특정 인덱스 도서관정보)
export async function changeLibraryDataForm(libraryData) {
  // 연락처가 빈문자열일 때 연락처 없다고 표기해주기
  if (libraryData.libraryContact === "") {
    libraryData.libraryContact = "연락처 없음"
  }
  // 휴관일 25글자 단위로 잘라서 줄바꿈 기호 넣어주기
  const closeDayLength = libraryData.closeDay.length
  const closeDayLoopCount = Math.ceil(closeDayLength / 25)
  // 휴관일 데이터를 임시로 저장할 변수
  let tempCloseDay = ``
  for (let count = 0; count < closeDayLoopCount; ++count) {
    tempCloseDay += `${libraryData.closeDay.substring(count * 25, (count + 1) * 25)}
`
  }
  libraryData.closeDay = tempCloseDay

  // 주소 25글자 단위로 잘라서 줄바꿈 기호 넣어주기
  const addressLength = libraryData.address.length
  const addressLoopCount = Math.ceil(addressLength / 25)
  // 주소 데이터 임시로 저장할 변수
  let tempAddress = ``
  for (let count = 0; count < addressLoopCount; ++count) {
    tempAddress += `${libraryData.address.substring(count * 25, (count + 1) * 25)}
`
  }
  libraryData.address = tempAddress
  return libraryData
}

// 삭제된 닉네임 일 경우 null -> 삭제된 유저입니다로 변경
export async function checkExistUser(nickname) {
  // 닉네임이 null이면 삭제된 닉네임 취급
  if (nickname === null) return "삭제된 유저입니다."
  return nickname
}

// 특정 글자수 단위로 개행문자 넣어주는 메서드
export async function newLine(data, countOfWord) {
  // 데이터의 글자수와 몇번 반복문 돌릴지 정하기
  const length = data.length
  const loopCount = Math.ceil(length / countOfWord)
  // 파싱한 데이터를 임시로 저장할 변수
  let tempData = ``
  for (let count = 0; count < loopCount; ++count) {
    tempData += `${data.substring(count * countOfWord, (count + 1) * countOfWord)}
`
  }
  data = tempData
  return data
}

// 도서관 종류(Int)를 문자열로 바꿔주는 메서드
export async function changeLibraryType(libraryType) {
  if (libraryType === 0) return "작은도서관"
  if (libraryType === 1) return "공공도서관"
  if (libraryType === 2) return "어린이도서관"
  if (libraryType === 3) return "전문도서관"
  if (libraryType === 4) return "대학도서관"
  if (libraryType === 5) return "학교도서관"
}

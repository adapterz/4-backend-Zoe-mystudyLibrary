// 도서관 모델
// 외장모듈
import mysql from "mysql2/promise";
// 내장모듈
import { myPool } from "../CustomModule/Db";
import { queryFailLog, querySuccessLog } from "../CustomModule/QueryLog";
import {
  changeDetailLibraryData,
  changeGradeForm,
  changeLibraryDataForm,
  changeLibrarysDataForm,
  changeLibraryㄴDataForm,
} from "../CustomModule/ChangeDataForm";

/*
 * 1. 전체도서관 정보
 * 2. 입력한 지역의 도서관 정보
 * 3. 특정 인덱스의 도서관 정보
 */

// 전체 도서관 정보 불러오는 모델
export async function allLibraryModel(ip) {
  let libraryData = [];
  // 전체 도서관 정보 가져오는 쿼리문 + 도서관 별 후기 평균 평점, 평점개수 가져오는 쿼리문
  const query =
    "SELECT LIBRARY.libraryIndex,libraryName,libraryType,closeDay,openWeekday,endWeekday,openSaturday,endSaturday,openHoliday,endHoliday,nameOfCity,districts,address,libraryContact,AVG(grade) avgOfGrade FROM LIBRARY LEFT JOIN REVIEW ON LIBRARY.libraryIndex=REVIEW.libraryIndex WHERE LIBRARY.deleteDateTime IS NULL AND REVIEW.deleteDateTime IS NULL GROUP BY libraryIndex";
  try {
    // 쿼리문 메서드 성공
    const [results, fields] = await myPool.query(query);
    // 성공 로그찍기
    await querySuccessLog(ip, query);
    // 전체도서관 데이터 가공
    for (const index in results) {
      // 평점 둘째자리에서 반올림한 후 평점 데이터 가공
      const grade = await changeGradeForm(Math.round(results[index].avgOfGrade * 10) / 10);
      // 데이터 가공 메서드
      const tempResult = await changeLibrarysDataForm(results[index]);
      const tempData = {
        libraryIndex: results[index].libraryIndex,
        libraryName: tempResult.libraryName,
        libraryType: tempResult.libraryType,
        closeDay: tempResult.closeDay,
        weekDayOperateTime: tempResult.openWeekday + " ~ " + tempResult.endWeekday,
        SaturdayOperateTime: tempResult.openSaturday + " ~ " + tempResult.endSaturday,
        HolidayOperateTime: tempResult.openHoliday + " ~ " + tempResult.endHoliday,
        districts: results[index].nameOfCity + " " + results[index].districts,
        address: tempResult.address,
        libraryContact: tempResult.libraryContact,
        averageGrade: grade,
      };
      libraryData.push(tempData);
    }
    return { state: "전체도서관정보", dataOfLibrary: libraryData };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await queryFailLog(err, ip, query);
    return { state: "mysql 사용실패" };
  }
}

// 입력한 지역에 따라 도서관 정보주는 모델
export async function localLibraryModel(inputLocal, ip) {
  let libraryData = [];
  // 유저가 요청한 시도명/시군구명에 맞게 데이터 가져오는 쿼리문
  const query =
    "SELECT LIBRARY.libraryIndex,libraryName,libraryType,closeDay,openWeekday,endWeekday,openSaturday,endSaturday,openHoliday,endHoliday,nameOfCity,districts,address,libraryContact,AVG(grade) avgOfGrade FROM LIBRARY LEFT JOIN REVIEW ON LIBRARY.deleteDateTime=REVIEW.deleteDateTime WHERE LIBRARY.deleteDateTime IS NULL AND REVIEW.deleteDateTime IS NULL AND nameOfCity =" +
    mysql.escape(inputLocal.nameOfCity) +
    " AND districts =" +
    mysql.escape(inputLocal.districts) +
    "GROUP BY libraryIndex";
  try {
    const [results, fields] = await myPool.query(query);
    // 성공 로그찍기
    await querySuccessLog(ip, query);
    // 유저가 요청한 지역에 도서관이 존재하지 않을 때
    if (results[0] === undefined) {
      return { state: "존재하지않는정보" };
    }
    // 검색된도서관 데이터 가공
    for (const index in results) {
      // 평점 둘째자리에서 반올림한 후 평점 데이터 가공
      const grade = await changeGradeForm(Math.round(results[index].avgOfGrade * 10) / 10);
      // 데이터 가공 메서드
      const tempResult = await changeLibrarysDataForm(results[index]);
      const tempData = {
        libraryIndex: results[index].libraryIndex,
        libraryName: tempResult.libraryName,
        libraryType: tempResult.libraryType,
        closeDay: tempResult.closeDay,
        weekDayOperateTime: tempResult.openWeekday + " ~ " + tempResult.endWeekday,
        SaturdayOperateTime: tempResult.openSaturday + " ~ " + tempResult.endSaturday,
        HolidayOperateTime: tempResult.openHoliday + " ~ " + tempResult.endHoliday,
        districts: results[index].nameOfCity + " " + results[index].districts,
        address: tempResult.address,
        libraryContact: tempResult.libraryContact,
        averageGrade: grade,
      };
      libraryData.push(tempData);
    }
    // 유저가 요청한 지역에 도서관이 존재할 때
    return { state: "주변도서관", dataOfLibrary: libraryData };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await queryFailLog(err, ip, query);
    return { state: "mysql 사용실패" };
  }
}

// 특정 도서관 정보 가져오는 모델
export async function detailLibraryModel(libraryIndex, ip) {
  // 특정 libraryIndex의 도서관 정보 후기의 평균 평점/평점개수 가져오는 다중 쿼리문
  const query =
    "SELECT Library.libraryIndex, libraryName,libraryType,closeDay,openWeekday,endWeekday,openSaturday,endSaturday,openHoliday,endHoliday,nameOfCity,districts,address,libraryContact,COUNT(grade) countOfGrade,AVG(grade) avgOfGrade FROM LIBRARY LEFT JOIN REVIEW ON LIBRARY.libraryIndex=REVIEW.libraryIndex WHERE LIBRARY.deleteDateTime IS NULL AND REVIEW.deleteDateTime IS NULL AND LIBRARY.libraryIndex=" +
    mysql.escape(libraryIndex) +
    " GROUP BY libraryIndex";

  // 성공시
  try {
    const [results, fields] = await myPool.query(query);
    // 성공 로그
    await querySuccessLog(ip, query);
    // 유저가 요청한 인덱스의 도서관 정보가 존재하지 않을 때
    if (results[0] === undefined) {
      return { state: "존재하지않는정보" };
    }
    // 해당 도서관인덱스의 데이터 가공
    // 평점 둘째자리에서 반올림한 후 평점 데이터 가공
    const grade = await changeGradeForm(Math.round(results[0].avgOfGrade * 10) / 10);
    // 글자수 너무길어지면 잘라주는 메서드
    const tempResult = await changeLibraryDataForm(results[0]);

    const libraryData = {
      libraryName: results[0].libraryName,
      libraryType: results[0].libraryType,
      districts: results[0].nameOfCity + " " + results[0].districts,
      address: results[0].address,
      closeDay: tempResult.closeDay,
      weekDayOperateTime: results[0].openWeekday.toString().substring(0, 5) + " ~ " + results[0].endWeekday.toString().substring(0, 5),
      SaturdayOperateTime: results[0].openSaturday.toString().substring(0, 5) + " ~ " + results[0].endSaturday.toString().substring(0, 5),
      HolidayOperateTime: results[0].openHoliday.toString().substring(0, 5) + " ~ " + results[0].endHoliday.toString().substring(0, 5),
      libraryContact: tempResult.libraryContact,
      countOfGrade: results[0].countOfGrade + " 개",
      averageGrade: grade,
    };
    // 유저가 요청한 도서관 정보가 존재할 때
    return { state: "상세도서관정보", dataOfLibrary: libraryData };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await queryFailLog(err, ip, query);
    return { state: "mysql 사용실패" };
  }
}

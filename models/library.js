// 도서관 모델
// 내장모듈
import { db } from "../orm/models/index.mjs";
import { modelFailLog, modelSuccessLog } from "../customModule/modelLog.js";
import {
  changeGradeForm,
  changeLibraryDataForm,
  changeLibrarysDataForm,
  changeLibraryType,
} from "../customModule/changeDataForm.js";
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
    `SELECT library.libraryIndex,libraryName,libraryType,closeDay,openWeekday,endWeekday,openSaturday,endSaturday,openHoliday,endHoliday,` +
    `nameOfCity,districts,address,libraryContact,AVG(grade) avgOfGrade FROM library LEFT JOIN review ON library.libraryIndex=review.libraryIndex ` +
    `AND review.deleteTimestamp IS NULL WHERE library.deleteTimestamp IS NULL GROUP BY libraryIndex`;
  try {
    const [results, metadata] = await db.sequelize.query(query);
    // 전체도서관 데이터 가공
    for (const index in results) {
      // 평점 둘째자리에서 반올림한 후 평점 데이터 가공
      const grade = await changeGradeForm(Math.round(results[index].avgOfGrade * 10) / 10);
      // 데이터 가공 메서드
      const tempResult = await changeLibrarysDataForm(results[index]);
      const tempData = {
        libraryIndex: results[index].libraryIndex,
        libraryName: tempResult.libraryName,
        libraryType: await changeLibraryType(tempResult.libraryType),
        closeDay: tempResult.closeDay,
        weekdayOperateTime: tempResult.openWeekday + " ~ " + tempResult.endWeekday,
        saturdayOperateTime: tempResult.openSaturday + " ~ " + tempResult.endSaturday,
        holidayOperateTime: tempResult.openHoliday + " ~ " + tempResult.endHoliday,
        districts: results[index].nameOfCity + " " + results[index].districts,
        address: tempResult.address,
        libraryContact: tempResult.libraryContact,
        averageGrade: grade,
      };
      libraryData.push(tempData);
    }
    // 성공 로그찍기
    await modelSuccessLog(ip, "allLibraryModel");
    return { state: "entire_library_information", dataOfLibrary: libraryData };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "allLibraryModel");
    return { state: "fail_sequelize" };
  }
}

// 입력한 지역에 따라 도서관 정보주는 모델
export async function localLibraryModel(inputLocal, ip) {
  const libraryData = [];
  // 유저가 요청한 시도명/시군구명에 맞게 데이터 가져오는 쿼리문
  const query =
    `SELECT library.libraryIndex,libraryName,libraryType,closeDay,openWeekday,endWeekday,openSaturday,endSaturday,openHoliday,endHoliday,` +
    `nameOfCity,districts,address,libraryContact,AVG(grade) avgOfGrade FROM library LEFT JOIN review ON library.libraryIndex=review.libraryIndex ` +
    `AND review.deleteTimestamp IS NULL WHERE library.deleteTimestamp IS NULL AND nameOfCity = ? AND districts = ? GROUP BY libraryIndex`;
  try {
    const [results, metadata] = await db.sequelize.query(query, {
      replacements: [inputLocal.nameOfCity, inputLocal.districts],
    });
    // 유저가 요청한 지역에 도서관이 존재하지 않을 때
    if (results[0] === undefined) {
      await modelSuccessLog(ip, "localLibraryModel");
      return { state: "non_existent_library" };
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
        libraryType: await changeLibraryType(tempResult.libraryType),
        closeDay: tempResult.closeDay,
        weekdayOperateTime: tempResult.openWeekday + " ~ " + tempResult.endWeekday,
        saturdayOperateTime: tempResult.openSaturday + " ~ " + tempResult.endSaturday,
        holidayOperateTime: tempResult.openHoliday + " ~ " + tempResult.endHoliday,
        districts: results[index].nameOfCity + " " + results[index].districts,
        address: tempResult.address,
        libraryContact: tempResult.libraryContact,
        averageGrade: grade,
      };
      libraryData.push(tempData);
    }
    // 유저가 요청한 지역에 도서관이 존재할 때
    await modelSuccessLog(ip, "localLibraryModel");
    return { state: "local_library_information", dataOfLibrary: libraryData };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "localLibraryMode");
    return { state: "fail_sequelize" };
  }
}

// 특정 도서관 정보 가져오는 모델
export async function detailLibraryModel(libraryIndex, ip) {
  // 특정 libraryIndex의 도서관 정보 후기의 평균 평점/평점개수 가져오는 다중 쿼리문
  const query =
    `SELECT library.libraryIndex,libraryName,libraryType,closeDay,openWeekday,endWeekday,openSaturday,endSaturday,openHoliday,endHoliday,` +
    `nameOfCity,districts,address,libraryContact,COUNT(grade) countOfGrade,AVG(grade) avgOfGrade FROM library LEFT JOIN review ON library.libraryIndex=review.libraryIndex` +
    ` AND review.deleteTimestamp IS NULL WHERE library.deleteTimestamp IS NULL AND library.libraryIndex= ? GROUP BY libraryIndex`;

  // 성공시
  try {
    const [results, fields] = await db.sequelize.query(query, {
      replacements: [libraryIndex],
    });
    // 유저가 요청한 인덱스의 도서관 정보가 존재하지 않을 때
    if (results[0] === undefined) {
      await modelSuccessLog(ip, "detailLibraryModel");
      return { state: "non_existent_library" };
    }
    // 해당 도서관인덱스의 데이터 가공
    // 평점 둘째자리에서 반올림한 후 평점 데이터 가공
    const grade = await changeGradeForm(Math.round(results[0].avgOfGrade * 10) / 10);
    // 글자수 너무길어지면 잘라주는 메서드
    const tempResult = await changeLibraryDataForm(results[0]);

    const libraryData = {
      libraryName: results[0].libraryName,
      libraryType: await changeLibraryType(results[0].libraryType),
      districts: results[0].nameOfCity + " " + results[0].districts,
      address: tempResult.address,
      closeDay: tempResult.closeDay,
      weekdayOperateTime:
        results[0].openWeekday.toString().substring(0, 5) + " ~ " + results[0].endWeekday.toString().substring(0, 5),
      saturdayOperateTime:
        results[0].openSaturday.toString().substring(0, 5) + " ~ " + results[0].endSaturday.toString().substring(0, 5),
      holidayOperateTime:
        results[0].openHoliday.toString().substring(0, 5) + " ~ " + results[0].endHoliday.toString().substring(0, 5),
      libraryContact: tempResult.libraryContact,
      countOfGrade: results[0].countOfGrade + " 개",
      averageGrade: grade,
    };
    // 유저가 요청한 도서관 정보가 존재할 때
    await modelSuccessLog(ip, "detailLibraryModel");
    return { state: "detail_library_information", dataOfLibrary: libraryData };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "detailLibraryModel");
    return { state: "fail_sequelize" };
  }
}

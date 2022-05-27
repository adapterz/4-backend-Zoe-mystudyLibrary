// 유저 모델
// 외장 모듈
import fs from "fs";
import bcrypt from "bcrypt";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

// 내장 모듈
import { modelFailLog, modelSuccessLog } from "../customModule/modelLog.js";
import { hashPw } from "../customModule/pwBcrypt.js";
import { changeGradeForm, changeLibrarysDataForm, changeLibraryType } from "../customModule/changeDataForm.js";
import { db, Op } from "../orm/models/index.mjs";

// es6 버전에서 __filename, __dirname 사용할 수 있게하기
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
/*
 * 1. 회원가입/탈퇴
 * 2. 로그인/(로그아웃 - 모델x)
 * 3. 유저 관심도서관 조회/등록/탈퇴
 * 4. 유저 정보 수정
 * 5. 유저 정보 가져오기
 */

// 1. 회원가입/탈퇴
// 1-1. 회원가입
export async function signUpModel(inputUser, ip) {
  // 성공시
  try {
    // 유저가 입력한 아이디가 기존에 있는지 체크
    let result = await db["user"].findAll({
      attributes: ["id"],
      where: {
        id: { [Op.eq]: inputUser.id },
      },
    });
    // 1. 유저가 입력한 id나 닉네임이 기존에 있을 때
    // 유저가 입력한 아이디가 기존에 존재하는 아이디일 때
    if (result[0] !== undefined) {
      await modelSuccessLog(ip, "signUpModel");
      return { state: "already_exist_id" };
    }
    // 유저가 입력한 닉네임이 기존에 있는지 체크
    result = await db["user"].findAll({
      attributes: ["nickname"],
      where: {
        nickname: { [Op.eq]: inputUser.nickname },
      },
    });

    // 유저가 입력한 닉네임이 기존에 존재하는 닉네임일 때
    if (result[0] !== undefined) {
      await modelSuccessLog(ip, "signUpModel");
      return { state: "already_exist_nickname" };
    }

    // 2. 비밀번호 유효성 검사
    // 입력한 비밀번호와 비밀번호 확인이 다를 때
    const hashedPw = await hashPw(inputUser.pw);
    if (!bcrypt.compareSync(inputUser.confirmPw, hashedPw)) {
      await modelSuccessLog(ip, "signUpModel");
      return { state: "pw/pw_confirm_mismatched" };
    }

    // 모든 유효성 검사 통과 후 회원정보 추가
    await db["user"].create({
      id: inputUser.id,
      pw: hashedPw,
      name: inputUser.name,
      gender: inputUser.gender,
      phoneNumber: inputUser.phoneNumber,
      nickname: inputUser.nickname,
      createTimestamp: db.sequelize.fn("NOW"),
    });

    await modelSuccessLog(ip, "signUpModel");
    return { state: "sign_up" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "signUpModel");
    return { state: "fail_sequelize" };
  }
}

// 1-2. 회원탈퇴
export async function dropOutModel(ip, loginCookie) {
  const transactionObj = await db.sequelize.transaction();
  // 성공시
  try {
    // 해당 유저 정보 탈퇴 유저 테이블에 옮기기
    // 1. 해당 유저 정보 불러오기
    let result = await db["user"].findAll({
      attributes: ["id", "pw", "name", "gender", "phoneNumber", "nickname", "profileImage"],
      where: {
        userIndex: { [Op.eq]: loginCookie },
      },
    });
    // 2. 탈퇴유저 테이블에 불러온 유저 정보 옮기기
    await db["withdrawalUser"].create(
      {
        userIndex: loginCookie,
        id: result[0].id,
        pw: result[0].pw,
        name: result[0].name,
        gender: result[0].gender,
        phoneNumber: result[0].phoneNumber,
        nickname: result[0].nickname,
        profileImage: result[0].profileImage,
        withdrawalTimestamp: db.sequelize.fn("NOW"),
      },
      { transaction: transactionObj }
    );
    // 3. 유저테이블에서 해당 유저 데이터 삭제
    await db["user"].destroy({ where: { userIndex: loginCookie } }, { transaction: transactionObj });
    // 성공 로그찍기
    await modelSuccessLog(ip, "dropOutModel");
    await transactionObj.commit();
    // 성공적으로 회원탈퇴
    return { state: "user_withdrawal" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await transactionObj.rollback();
    await modelFailLog(err, ip, "dropOutModel");
    return { state: "fail_sequelize" };
  }
}

// 2. 로그인
export async function loginModel(inputLogin, ip) {
  // 성공시
  try {
    // 유저가 입력한 id의 유저 정보 가져오기
    let result = await db["user"].findAll({
      attributes: ["userIndex", "id", "pw", "name", "gender", "phoneNumber", "nickname", "profileImage"],
      where: {
        id: { [Op.eq]: inputLogin.id },
      },
    });
    // 1. 요청한 id와 일치하는 아이디가 없을 때
    if (result[0] === undefined) {
      await modelSuccessLog(ip, "loginModel");
      return { state: "no_matching_id" };
    }
    // 2. 등록된 유저 pw와 입력한 pw가 다르면 로그인 실패
    if (!bcrypt.compareSync(inputLogin.pw, result[0].pw)) {
      await modelSuccessLog(ip, "loginModel");
      return { state: "pw_mismatched" };
    }
    // 유효성 검사 통과 - 로그인 성공
    await modelSuccessLog(ip, "loginModel");
    return { state: "login", userIndex: result[0].userIndex };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "loginModel");
    return { state: "fail_sequelize" };
  }
}

// 3. 내 관심도서관 조회/등록/탈퇴
// 3-1. 관심도서관 조회
export async function userLibraryModel(userIndex, ip) {
  const libraryData = [];
  // 해당 유저가 관심도서관으로 등록한 도서관 정보 가져오기
  let query =
    `SELECT library.libraryIndex,libraryName,libraryType,closeDay,openWeekday,endWeekday,openSaturday,endSaturday,openHoliday,endHoliday,` +
    `nameOfCity,districts,address,libraryContact,AVG(grade) avgOfGrade FROM userLibrary LEFT JOIN library ON library.libraryIndex = userLibrary.libraryIndex ` +
    `LEFT JOIN review ON userLibrary.libraryIndex = review.libraryIndex AND review.deleteTimestamp IS NULL WHERE library.deleteTimestamp IS NULL ` +
    `AND userLibrary.deleteTimestamp IS NULL AND userLibrary.userIndex= ? GROUP BY libraryIndex ORDER BY libraryIndex`;
  // 성공시
  try {
    let [results, metadata] = await db.sequelize.query(query, {
      replacements: [userIndex],
    });
    if (results[0] === undefined) {
      await modelSuccessLog(ip, "userLibraryModel");
      return { state: "no_registered_information" };
    }
    // 유저도서관 데이터 가공
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

    await modelSuccessLog(ip, "userLibraryModel");
    return { state: "user_library_information", dataOfLibrary: libraryData };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "userLibraryModel");
    return { state: "fail_sequelize" };
  }
}

// 3-2. 관심도서관 등록
export async function registerUserLibraryModel(libraryIndex, userIndex, ip) {
  // 성공시
  try {
    // 기존에 등록돼있는 관심도서관인지 확인
    let results = await db["userLibrary"].findAll({
      attributes: ["userIndex", "libraryIndex"],
      where: {
        deleteTimestamp: { [Op.is]: null },
      },
      replacements: [userIndex, libraryIndex],
    });
    if (results[0] !== undefined) {
      await modelSuccessLog(ip, "registerUserLibraryModel");
      return { state: "duplicated_registration_request" };
    }
    // USERLIBRARY 테이블에 유저인덱스와 해당 유저가 등록한 도서관인덱스 추가
    await db["userLibrary"].create({
      userIndex: userIndex,
      libraryIndex: libraryIndex,
      updateTimestamp: db.sequelize.fn("NOW"),
    });
    await modelSuccessLog(ip, "registerUserLibraryModel");
    return { state: "additional_user_library" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "registerUserLibraryModel");
    return { state: "fail_sequelize" };
  }
}
// 3-3. 관심도서관 삭제
export async function deleteUserLibraryModel(libraryIndex, userIndex, ip) {
  try {
    // 등록한 관심도서관이 존재하는지 확인
    let results = await db["userLibrary"].findAll({
      attributes: ["userIndex"],
      where: {
        userIndex: { [Op.eq]: userIndex },
        libraryIndex: { [Op.eq]: libraryIndex },
      },
    });
    // 기존에 해당 유저 인덱스로 해당 관심도서관이 등록되지 않았을 때
    if (results[0] === undefined) {
      await modelSuccessLog(ip, "deleteUserLibraryModel");
      return { state: "no_registered_information" };
    }
    // 등록한 관심도서관 삭제
    await db["userLibrary"].update(
      {
        deleteTimestamp: db.sequelize.fn("NOW"),
      },
      {
        where: { libraryIndex: libraryIndex },
      }
    );

    await modelSuccessLog(ip, "deleteUserLibraryModel");
    return { state: "delete_user_library" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "deleteUserLibraryModel");
    return { state: "fail_sequelize" };
  }
}

// 4. 유저 정보 수정
// 4-1. 프로필 - 닉네임 변경
export async function editProfileNicknameModel(inputRevise, ip, loginCookie) {
  // 성공시
  try {
    // 유저가 입력한 닉네임이 기존에 존재하는지 확인하기 위해 조회
    let result = await db["user"].findAll({
      attributes: ["nickname"],
      where: {
        nickname: inputRevise.nickname,
      },
    });
    // 유저가 입력한 닉네임이 기존에 존재할 때
    if (result[0] !== undefined) {
      await modelSuccessLog(ip, "editProfileNicknameModel");
      return { state: "duplicated_nickname" };
    }

    // 새 프로필 닉네임 정보 수정해줄 쿼리문
    await db["user"].update(
      {
        nickname: inputRevise.nickname,
        updateTimestamp: db.sequelize.fn("NOW"),
      },
      { where: { userIndex: loginCookie } }
    );

    await modelSuccessLog(ip, "editProfileNicknameModel");
    return { state: "edit_nickname" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "editProfileNicknameModel");
    return { state: "fail_sequelize" };
  }
}

// 4-2. 프로필 - 이미지 변경 모델
export async function editProfileImageModel(imagePath, ip, loginCookie) {
  // 성공시
  try {
    // 새 프로필 이미지 정보 수정해줄 쿼리문
    await db["user"].update(
      {
        profileImage: imagePath,
        updateTimestamp: db.sequelize.fn("NOW"),
      },
      { where: { userIndex: loginCookie } }
    );

    await modelSuccessLog(ip, "editProfileImageModel");
    return { state: "edit_profile_image" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "editProfileImageModel");
    return { state: "fail_sequelize" };
  }
}
// 4-3. 연락처 변경 모델
export async function editPhoneNumberModel(newContact, ip, loginCookie) {
  // 성공시
  try {
    // 유저의 연락처 변경
    await db["user"].update(
      {
        phoneNumber: newContact.phoneNumber,
        updateTimestamp: db.sequelize.fn("NOW"),
      },
      { where: { userIndex: loginCookie } }
    );

    // 연락처 수정 성공
    await modelSuccessLog(ip, "editPhoneNumberModel");
    return { state: "edit_contact" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "editPhoneNumberModel");
    return { state: "fail_sequelize" };
  }
}

// 4-4. 비밀번호 수정 요청 모델
export async function editPwModel(inputPw, ip, loginCookie) {
  // 해싱된 새비밀번호 변수 미리 선언
  let hashedNewPw;
  try {
    // 기존에 비밀번호와 일치하나 확인하기 위해 조회
    let result = await db["user"].findAll({
      attributes: ["pw"],
      where: {
        userIndex: loginCookie,
      },
    });
    // 유효성 검사
    // DB의 유저 pw와 '현재 비밀번호'창에 입력한 pw 비교
    // 1. 입력한 '현재 비밀번호' DB에 있던 pw과 비교
    if (!bcrypt.compareSync(inputPw.pw, result[0].pw)) {
      await modelSuccessLog(ip, "editPwModel");
      return { state: "pw_mismatched" };
    }
    // 2. '새 비밀번호'와 '새 비밀번호 확인'이 일치하지 않으면 비밀번호 변경 불가
    hashedNewPw = await hashPw(inputPw.newPw);
    if (!bcrypt.compareSync(inputPw.confirmPw, hashedNewPw)) {
      await modelSuccessLog(ip, "editPwModel");
      return { state: "pw/pw_confirm_mismatched" };
    }
    // 유효성 검사 통과
    // 비밀번호 수정
    await db["user"].update(
      {
        pw: hashedNewPw,
        updateTimestamp: db.sequelize.fn("NOW"),
      },
      { where: { userIndex: loginCookie } }
    );
    // 비밀번호 변경 성공
    await modelSuccessLog(ip, "editPwModel");
    return { state: "edit_pw" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "editPwModel");
    return { state: "fail_sequelize" };
  }
}

// 5. 유저 정보 가져오기
export async function getUserModel(ip, loginCookie) {
  let userData;
  // 성공시
  try {
    // 유저 정보 가져오기
    const result = await db["user"].findAll({
      attributes: ["nickname", "profileImage"],
      where: {
        userIndex: { [Op.eq]: loginCookie },
      },
    });
    // 등록된 프로필 이미지가 없을 때
    if (result[0].profileImage === null) {
      userData = {
        isProfileImage: false,
        nickname: result[0].nickname,
      };
    }
    // 등록된 프로필 이미지가 있을 때
    else {
      // 프로필 사진 파일 이름은 유저인덱스이므로 파일 이름과 요청 유저의 인덱스가 일치하지 않은 경우 분기처리
      const checkUserIndex = result[0].profileImage.split(".");
      if (checkUserIndex[0] !== "profileImage/" + loginCookie) return { state: "incorrect_access" };
      // 프로필 사진 이름과 요청 유저의 인덱스가 일치할 때
      // 경로 명에 맞는 프로필사진 base64로 인코딩해서 전달
      const profileImage = fs.readFileSync(path.join(__dirname, "..", result[0].profileImage));
      const encodingImage = new Buffer.from(profileImage).toString("base64");
      userData = {
        isProfileImage: true,
        nickname: result[0].nickname,
        profileImage: encodingImage,
        mime: `image/${checkUserIndex[1]}`,
      };
    }

    await modelSuccessLog(ip, "getUserModel");
    return { state: "user_information", dataOfUser: userData };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "getUserModel");
    return { state: "fail_sequelize" };
  }
}

// 유저 모델
// 내장모듈
import { modelFailLog, modelSuccessLog } from "../CustomModule/QueryLog";
import bcrypt from "bcrypt";
import { hashPw } from "../CustomModule/PwBcrypt";
import {
  changeTimestampForm,
  changeGradeForm,
  changeLibrarysDataForm,
  changeUnit,
  changeLibraryType,
} from "../CustomModule/ChangeDataForm";
import { db, Op } from "../Orm/models";
/*
 * 1. 회원가입/탈퇴
 * 2. 로그인/(로그아웃 - 모델x)
 * 3. 유저 관심도서관 조회/등록/탈퇴
 * 4. 유저가 작성한 글/댓글/후기 조회
 * 5. 유저 정보 수정
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
    // 성공로그
    // 1. 유저가 입력한 id나 닉네임이 기존에 있을 때
    // 유저가 입력한 아이디가 기존에 존재하는 아이디일 때
    if (result[0] !== undefined) {
      await modelSuccessLog(ip, "signUpModel");
      return { state: "존재하는 아이디" };
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
      return { state: "존재하는 닉네임" };
    }

    // 2. 비밀번호 유효성 검사
    // 입력한 비밀번호와 비밀번호 확인이 다를 때
    const hashedPw = await hashPw(inputUser.pw);
    if (!bcrypt.compareSync(inputUser.confirmPw, hashedPw)) {
      await modelSuccessLog(ip, "signUpModel");
      return { state: "비밀번호/비밀번호확인 불일치" };
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
    return { state: "회원가입" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "signUpModel");
    return { state: "sequelize 사용실패" };
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
    return { state: "회원탈퇴" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await transactionObj.rollback();
    await modelFailLog(err, ip, "dropOutModel");
    return { state: "sequelize 사용실패" };
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
      return { state: "일치하는 id 없음" };
    }
    // 2. 등록된 유저 pw와 입력한 pw가 다르면 로그인 실패
    if (!bcrypt.compareSync(inputLogin.pw, result[0].pw)) {
      await modelSuccessLog(ip, "loginModel");
      return { state: "비밀번호 불일치" };
    }
    // 유효성 검사 통과 - 로그인 성공
    await modelSuccessLog(ip, "loginModel");
    return { state: "로그인성공", userIndex: result[0].userIndex };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "loginModel");
    return { state: "sequelize 사용실패" };
  }
}

// 3. 내 관심도서관 조회/등록/탈퇴
// 3-1. 관심도서관 조회
export async function userLibraryModel(userIndex, ip) {
  const libraryData = [];
  // 해당 유저가 관심도서관으로 등록한 도서관 정보 가져오기
  let query =
    `SELECT LIBRARY.libraryIndex,libraryName,libraryType,closeDay,openWeekday,endWeekday,openSaturday,endSaturday,openHoliday,endHoliday,` +
    `nameOfCity,districts,address,libraryContact,AVG(grade) avgOfGrade FROM USERLIBRARY LEFT JOIN LIBRARY ON LIBRARY.libraryIndex = USERLIBRARY.libraryIndex ` +
    `LEFT JOIN REVIEW ON USERLIBRARY.libraryIndex = REVIEW.libraryIndex AND REVIEW.deleteTimestamp IS NULL WHERE LIBRARY.deleteTimestamp IS NULL ` +
    `AND USERLIBRARY.deleteTimestamp IS NULL AND USERLIBRARY.userIndex= ? GROUP BY libraryIndex ORDER BY libraryIndex`;
  // 성공시
  try {
    let [results, metadata] = await db.sequelize.query(query, {
      replacements: [userIndex],
    });
    if (results[0] === undefined) {
      await modelSuccessLog(ip, "userLibraryModel");
      return { state: "등록된정보없음" };
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
    return { state: "유저의관심도서관", dataOfLibrary: libraryData };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "userLibraryModel");
    return { state: "sequelize 사용실패" };
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
      return { state: "중복된등록요청" };
    }
    // USERLIBRARY 테이블에 유저인덱스와 해당 유저가 등록한 도서관인덱스 추가
    await db["userLibrary"].create({
      userIndex: userIndex,
      libraryIndex: libraryIndex,
      updateTimestamp: db.sequelize.fn("NOW"),
    });
    await modelSuccessLog(ip, "registerUserLibraryModel");
    return { state: "관심도서관추가" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "registerUserLibraryModel");
    return { state: "sequelize 사용실패" };
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
      return { state: "존재하지않는정보" };
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
    return { state: "관심도서관삭제" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "deleteUserLibraryModel");
    return { state: "sequelize 사용실패" };
  }
}

// 4. 유저가 작성한 글/댓글/후기 조회
// 4-1. 유저가 작성한 글
export async function userBoardModel(userIndex, page, ip) {
  const boardData = [];
  // 해당 유저가 작성한 게시글 정보 가져오기
  const query = `SELECT postTitle,viewCount,favoriteCount FROM BOARD WHERE deleteTimestamp IS NULL AND userIndex = ? ORDER BY boardIndex DESC LIMIT ${
    10 * (page - 1)
  }, 10`;
  // 성공시
  try {
    let [results, metadata] = await db.sequelize.query(query, {
      replacements: [userIndex],
    });
    // 요청한 데이터가 없을 때
    if (results[0] === undefined) {
      await modelSuccessLog(ip, "userBoardModel");
      return { state: "등록된글이없음" };
    }
    // 게시글 정보 파싱
    for (const index in results) {
      // 게시글 제목의 글자수가 25자 미만일 때
      if (results[index].postTitle.length <= 25) {
        const tempData = {
          postTitle: results[index].postTitle,
          viewCount: await changeUnit(results[index].viewCount),
          favoriteCount: await changeUnit(results[index].favoriteCount),
          createDate: await changeTimestampForm(results[index].createTimestamp),
        };
        boardData.push(tempData);
      }
      // 게시글 제목의 글자수가 25자 이상일 때
      else if (results[index].postTitle.length > 25) {
        const tempData = {
          postTitle: results[index].postTitle.substring(0, 25) + "...",
          viewCount: await changeUnit(results[index].viewCount),
          favoriteCount: await changeUnit(results[index].favoriteCount),
          createDate: await changeTimestampForm(results[index].createTimestamp),
        };
        boardData.push(tempData);
      }
    }
    await modelSuccessLog(ip, "userBoardModel");
    return { state: "내작성글조회", dataOfBoard: boardData };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "userBoardModel");
    return { state: "sequelize 사용실패" };
  }
}

// 4-2. 유저가 작성한 댓글
export async function userCommentModel(userIndex, page, ip) {
  const commentData = [];
  // 해당 유저가 작성한 댓글 정보 select 해오는 쿼리문
  const query =
    `SELECT COMMENT.commentContent,COMMENT.createTimestamp,BOARD.postTitle,COMMENT.boardDeleteTimestamp FROM COMMENT LEFT JOIN BOARD ` +
    `ON COMMENT.boardIndex =BOARD.boardIndex WHERE COMMENT.deleteTimestamp IS NULL AND COMMENT.userIndex= ? ORDER BY commentIndex DESC LIMIT ${
      5 * (page - 1)
    }, 5`;
  // 성공시
  try {
    let [results, metadata] = await db.sequelize.query(query, {
      replacements: [userIndex],
    });
    // 쿼리문 성공 로그
    await modelSuccessLog(ip, query);
    // DB에 데이터가 없을 때
    if (results[0] === undefined) {
      await modelSuccessLog(ip, "userCommentModel");
      return { state: "등록된댓글없음" };
    }
    // 댓글 정보
    for (const index in results) {
      // 삭제된 게시글인 경우 제목 바꿔주기
      if (results[index].boardDeleteTimestamp !== null) results[index].postTitle = "삭제된 게시글입니다";
      // 게시글 제목의 글자수가 25자 미만일 때
      if (results[index].postTitle.length <= 25) {
        const tempData = {
          postTitle: results[index].postTitle,
          commentContent: results[index].commentContent,
          createDate: await changeTimestampForm(results[index].createTimestamp),
        };
        commentData.push(tempData);
      }
      // 게시글 제목의 글자수가 25자 이상일 때
      else if (results[index].postTitle.length > 25) {
        const tempData = {
          postTitle: results[index].postTitle.substring(0, 25) + "...",
          commentContent: results[index].commentContent,
          createDate: await changeTimestampForm(results[index].createTimestamp),
        };
        commentData.push(tempData);
      }
    }

    // DB에 데이터가 있을 때
    await modelSuccessLog(ip, "userCommentModel");
    return { state: "성공적조회", dataOfComment: commentData };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "userCommentModel");
    return { state: "sequelize 사용실패" };
  }
}

// 4-3. 유저가 작성한 후기
export async function userReviewModel(userIndex, page, ip) {
  const reviewData = [];
  // 해당 유저가 작성한 후기 정보 가져오는 쿼리문
  const query =
    `SELECT REVIEW.reviewContent,REVIEW.grade,REVIEW.createTimestamp,LIBRARY.libraryName FROM REVIEW INNER JOIN LIBRARY ` +
    `ON REVIEW.libraryIndex = LIBRARY.libraryIndex WHERE REVIEW.deleteTimestamp IS NULL AND LIBRARY.deleteTimestamp IS NULL AND REVIEW.userIndex= ? ` +
    `ORDER BY reviewIndex DESC LIMIT ${5 * (page - 1)} ,5`;

  // 성공시
  try {
    let [results, metadata] = await db.sequelize.query(query, {
      replacements: [userIndex],
    });
    // 데이터가 없을 때
    if (results[0] === undefined) {
      await modelSuccessLog(ip, "userReviewModel");
      return { state: "등록된후기없음" };
    }
    // 데이터가 있을 때

    for (const index in results) {
      const tempData = {
        libraryName: results[index].libraryName,
        reviewContent: results[index].reviewContent,
        createDate: await changeTimestampForm(results[index].createTimestamp),
        grade: results[index].grade,
      };
      reviewData.push(tempData);
    }

    await modelSuccessLog(ip, "userReviewModel");
    return { state: "성공적조회", dataOfReview: reviewData };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "userReviewModel");
    return { state: "sequelize 사용실패" };
  }
}
// 5. 유저 정보 수정
// 5-1. 프로필 변경
export async function editProfileModel(inputRevise, ip, loginCookie) {
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
      await modelSuccessLog(ip, "editProfileModel");
      return { state: "중복닉네임" };
    }

    // 새 프로필 정보 수정해줄 쿼리문
    await db["user"].update(
      {
        nickname: inputRevise.nickname,
        updateTimestamp: db.sequelize.fn("NOW"),
      },
      { where: { userIndex: loginCookie } }
    );

    await modelSuccessLog(ip, "editProfileModel");
    return { state: "프로필변경성공" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "editProfileModel");
    return { state: "sequelize 사용실패" };
  }
}
// 5-2. 연락처 변경 모델
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
    return { state: "연락처변경성공" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "editPhoneNumberModel");
    return { state: "sequelize 사용실패" };
  }
}

// 5-3. 비밀번호 수정 요청 모델
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
      return { state: "기존비밀번호 불일치" };
    }
    // 2. '새 비밀번호'와 '새 비밀번호 확인'이 일치하지 않으면 비밀번호 변경 불가
    hashedNewPw = await hashPw(inputPw.newPw);
    if (!bcrypt.compareSync(inputPw.confirmPw, hashedNewPw)) {
      await modelSuccessLog(ip, "editPwModel");
      return { state: "비밀번호/비밀번호확인 불일치" };
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
    return { state: "비밀번호변경성공" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "editPwModel");
    return { state: "sequelize 사용실패" };
  }
}

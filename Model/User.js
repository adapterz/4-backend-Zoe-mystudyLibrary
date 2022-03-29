// 유저 모델
// 외장모듈
import mysql from "mysql2/promise";
// 내장모듈
import { myPool } from "../CustomModule/Db";
import { moment } from "../CustomModule/DateTime";
import { queryFailLog, querySuccessLog } from "../CustomModule/QueryLog";
import bcrypt from "bcrypt";
import { hashPw } from "../CustomModule/PwBcrypt";
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
  // 유저가 입력한 아이디가 기존에 있는지 select 해올 쿼리문
  // TODO 무엇에 대한 쿼리문인지(변수명)
  let query = "SELECT id FROM USER WHERE id = " + mysql.escape(inputUser.id);
  // 성공시
  try {
    let [results, fields] = await myPool.query(query);
    // 성공로그
    await querySuccessLog(ip, query);
    // 1. 유저가 입력한 id나 닉네임이 기존에 있을 때
    // 유저가 입력한 아이디가 기존에 존재하는 아이디일 때
    if (results[0] !== undefined) {
      return { state: "존재하는 아이디" };
    }
    // 유저가 입력한 닉네임이 기존에 존재하는 닉네임일 때
    // 유저가 입력한 닉네임이 기존에 있는지 select 해올 쿼리문
    query = "SELECT nickName FROM USER WHERE nickName = " + mysql.escape(inputUser.nickName);
    [results, fields] = await myPool.query(query);
    await querySuccessLog(ip, query);
    if (results[0] !== undefined) {
      return { state: "존재하는 닉네임" };
    }

    // 2. 비밀번호 유효성 검사
    // 입력한 비밀번호와 비밀번호 확인이 다를 때
    const hashedPw = await hashPw(inputUser.pw);
    //const hashed_confirm_pw = await hashPw(inputUser.confirmPw);
    console.log("pw비교:" + bcrypt.compareSync(inputUser.confirmPw, hashedPw));
    if (!bcrypt.compareSync(inputUser.confirmPw, hashedPw)) {
      return { state: "비밀번호/비밀번호확인 불일치" };
    }

    // 모든 유효성 검사 통과 후 회원정보 추가해줄 새로운 쿼리문
    query =
      "INSERT INTO USER(id,pw,name,gender,phoneNumber,nickName,updateDateTime) VALUES (" +
      mysql.escape(inputUser.id) +
      "," +
      mysql.escape(hashedPw) + // 라우터에서 해싱된 pw값 insert
      "," +
      mysql.escape(inputUser.name) +
      "," +
      mysql.escape(inputUser.gender) +
      "," +
      mysql.escape(inputUser.phoneNumber) +
      "," +
      mysql.escape(inputUser.nickName) +
      "," +
      mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) + // 계정 생성날짜
      ")";

    await myPool.query(query);
    // 성공 로그찍기
    await querySuccessLog(ip, query);

    return { state: "회원가입" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await queryFailLog(err, ip, query);
    return { state: "mysql 사용실패" };
  }
}

// 1-2. 회원탈퇴
export async function dropOutModel(ip, loginCookie) {
  // 해당 유저 데이터 삭제 쿼리문
  const query = "DELETE FROM USER WHERE userIndex =" + mysql.escape(loginCookie);
  // 성공시
  try {
    await myPool.query(query);
    // 성공 로그찍기
    await querySuccessLog(ip, query);
    // 성공적으로 회원탈퇴
    return { state: "회원탈퇴" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await queryFailLog(err, ip, query);
    return { state: "mysql 사용실패" };
  }
}

// 2. 로그인
export async function loginModel(inputLogin, ip) {
  // 유저가 입력한 id의 유저 정보 가져오는 쿼리문
  const query = "SELECT userIndex,id,pw,name,gender,phoneNumber,nickName,profileShot FROM USER WHERE id = " + mysql.escape(inputLogin.id);
  // 성공시
  try {
    const [results, fields] = await myPool.query(query);
    // 성공로그
    await querySuccessLog(ip, query);

    // 1. 요청한 id와 일치하는 아이디가 없을 때
    if (results[0] === undefined) {
      return { state: "일치하는 id 없음" };
    }
    // 2. 등록된 유저 pw와 입력한 pw가 다르면 로그인 실패
    if (!bcrypt.compareSync(inputLogin.pw, results[0].pw)) {
      return { state: "비밀번호 불일치" };
    }
    // 유효성 검사 통과 - 로그인 성공
    return { state: "로그인성공", userIndex: results[0].userIndex };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await queryFailLog(err, ip, query);
    return { state: "mysql 사용실패" };
  }
}

// 3. 내 관심도서관 조회/등록/탈퇴
// 3-1. 관심도서관 조회
export async function userLibraryModel(userIndex, ip) {
  // 해당 유저가 관심도서관으로 등록한 도서관 정보 가져오기
  let query =
    "SELECT LIBRARY.libraryIndex,libraryName,libraryType,closeDay,openWeekday,endWeekday,openSaturday,endSaturday,openHoliday,endHoliday,nameOfCity,districts,address,libraryContact,AVG(grade),COUNT(grade) FROM USERLIBRARY LEFT JOIN LIBRARY ON LIBRARY.libraryIndex = USERLIBRARY.libraryIndex LEFT JOIN REVIEW ON USERLIBRARY.libraryIndex = REVIEW.libraryIndex WHERE LIBRARY.deleteDateTime IS NULL AND USERLIBRARY.deleteDateTime IS NULL AND REVIEW.deleteDateTime IS NULL AND USERLIBRARY.userIndex=" +
    mysql.escape(userIndex) +
    " GROUP BY libraryIndex";
  // 성공시
  try {
    const [results, fields] = await myPool.query(query);
    // 쿼리 성공 로그
    await querySuccessLog(ip, query);
    if (results[0] === undefined) {
      return { state: "등록된정보없음" };
    }
    return { state: "유저의관심도서관", data: results };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await queryFailLog(err, ip, query);
    return { state: "mysql 사용실패" };
  }
}

// 3-2. 관심도서관 등록
export async function registerUserLibraryModel(libraryIndex, userIndex, ip) {
  // 기존에 등록돼있는 관심도서관인지 확인하는 쿼리문
  let query =
    "SELECT userIndex,libraryIndex FROM USERLIBRARY WHERE deleteDateTime IS NULL AND userIndex=" +
    mysql.escape(userIndex) +
    " AND libraryIndex=" +
    mysql.escape(libraryIndex);
  // 성공시
  try {
    const [results, fields] = await myPool.query(query);
    if (results[0] !== undefined) {
      return { state: "중복된등록요청" };
    }
    // USERLIBRARY 테이블에 유저인덱스와 해당 유저가 등록한 도서관인덱스 추가하는 쿼리문
    query =
      "INSERT INTO USERLIBRARY(userIndex,libraryIndex,updateDateTime) VALUES (" +
      mysql.escape(userIndex) +
      "," +
      mysql.escape(libraryIndex) +
      "," +
      mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
      ")";
    await myPool.query(query);
    // 성공 로그
    await querySuccessLog(ip, query);
    return { state: "관심도서관추가" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await queryFailLog(err, ip, query);
    return { state: "mysql 사용실패" };
  }
}
// 3-3. 관심도서관 삭제
export async function deleteUserLibraryModel(libraryIndex, userIndex, ip) {
  // 등록한 관심도서관이 존재하는지 확인하는 쿼리문
  let query =
    "SELECT userIndex FROM USERLIBRARY WHERE userIndex = " + mysql.escape(userIndex) + " AND libraryIndex=" + mysql.escape(libraryIndex);

  try {
    let [results, fields] = await myPool.query(query);
    // 쿼리문 성공 로그
    await querySuccessLog(ip, query);
    // 기존에 해당 유저 인덱스로 해당 관심도서관이 등록되지 않았을 때
    if (results[0] === undefined) {
      return { state: "존재하지않는정보" };
    }
    // 등록한 관심도서관 삭제하는 쿼리문
    query =
      "UPDATE USERLIBRARY SET deleteDateTime =" +
      mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
      "WHERE libraryIndex =" +
      mysql.escape(libraryIndex);
    await myPool.query(query);
    // 쿼리문 성공 로그
    await querySuccessLog(ip, query);
    return { state: "관심도서관삭제" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await queryFailLog(err, ip, query);
    return { state: "mysql 사용실패" };
  }
}

// 4. 유저가 작성한 글/댓글/후기 조회
// 4-1. 유저가 작성한 글
export async function userBoardModel(userIndex, page, ip) {
  // 해당 유저가 작성한 게시글 정보 가져오기
  const query =
    "SELECT boardIndex,postTitle,viewCount,favoriteCount FROM BOARD WHERE deleteDateTime IS NULL AND userIndex = " +
    mysql.escape(userIndex) +
    " ORDER BY boardIndex DESC LIMIT " +
    10 * (page - 1) +
    ", 10";
  // 성공시
  try {
    const [results, fields] = await myPool.query(query);
    // 성공 로그
    await querySuccessLog(ip, query);
    // 요청한 데이터가 없을 때
    if (results[0] === undefined) {
      return { state: "등록된글이없음" };
    }
    // 성공 로그찍기, 커밋하고 data return
    return { state: "내작성글조회", data: results };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await queryFailLog(err, ip, query);
    return { state: "mysql 사용실패" };
  }
}

// 4-2. 유저가 작성한 댓글
export async function userCommentModel(userIndex, page, ip) {
  // 해당 유저가 작성한 댓글 정보 select 해오는 쿼리문
  const query =
    "SELECT COMMENT.commentIndex,COMMENT.commentContent,COMMENT.createDateTime,BOARD.postTitle FROM COMMENT INNER JOIN BOARD ON COMMENT.boardIndex =BOARD.boardIndex WHERE BOARD.deleteDateTime IS NULL AND COMMENT.deleteDateTime IS NULL AND COMMENT.userIndex=" +
    mysql.escape(userIndex) +
    " ORDER BY commentIndex DESC LIMIT " +
    5 * (page - 1) +
    ", 5";

  // 성공시
  try {
    const [results, fields] = await myPool.query(query);
    // 쿼리문 성공 로그
    await querySuccessLog(ip, query);
    // DB에 데이터가 없을 때
    if (results[0] === undefined) {
      return { state: "등록된댓글없음" };
    }
    // DB에 데이터가 있을 때
    return { state: "성공적조회", data: results };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await queryFailLog(err, ip, query);
    return { state: "mysql 사용실패" };
  }
}

// 4-3. 유저가 작성한 후기
export async function userReviewModel(userIndex, page, ip) {
  // 해당 유저가 작성한 후기 정보 가져오는 쿼리문
  const query =
    "SELECT REVIEW.reviewContent,REVIEW.grade,REVIEW.createDateTime,LIBRARY.libraryName FROM REVIEW INNER JOIN LIBRARY ON REVIEW.libraryIndex = LIBRARY.libraryIndex WHERE REVIEW.deleteDateTime IS NULL AND LIBRARY.deleteDateTime IS NULL AND REVIEW.userIndex=" +
    mysql.escape(userIndex) +
    " ORDER BY reviewIndex DESC LIMIT " +
    5 * (page - 1) +
    ",5";

  // 성공시
  try {
    const [results, fields] = await myPool.query(query);
    // 성공 로그
    await querySuccessLog(ip, query);
    // 데이터가 없을 때
    if (results[0] === undefined) {
      return { state: "등록된후기없음" };
    }
    // 데이터가 있을 때
    return { state: "성공적조회", data: results };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await queryFailLog(err, ip, query);
    return { state: "mysql 사용실패" };
  }
}
// 5. 유저 정보 수정
// 5-1. 프로필 변경
export async function editProfileModel(inputRevise, ip, loginCookie) {
  // 유저가 입력한 닉네임이 기존에 존재하는지 확인하기 위해 select 해올 쿼리문
  let query = "SELECT nickName FROM USER WHERE nickName =" + mysql.escape(inputRevise.nickName);
  // 성공시
  try {
    let [results, fields] = await myPool.query(query);
    // 성공 로그
    await querySuccessLog(ip, query);
    // 유저가 입력한 닉네임이 기존에 존재할 때
    if (results[0] !== undefined) {
      return { state: "중복닉네임" };
    }

    // 새 프로필 정보 수정해줄 쿼리문
    query =
      "UPDATE USER SET nickName=" +
      mysql.escape(inputRevise.nickName) +
      ", profileShot =" +
      mysql.escape(inputRevise.profileShot) +
      ", updateDateTime =" +
      mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
      " WHERE userIndex =" +
      mysql.escape(loginCookie);

    await myPool.query(query);
    // 성공 로그
    await querySuccessLog(ip, query);

    return { state: "프로필변경성공" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await queryFailLog(err, ip, query);
    return { state: "mysql 사용실패" };
  }
}
// 5-2. 연락처 변경 모델
export async function editPhoneNumberModel(newContact, ip, loginCookie) {
  // 폰번호 변경 쿼리문
  const query =
    "UPDATE USER SET phoneNumber=" +
    mysql.escape(newContact.phoneNumber) +
    ", updateDateTime =" +
    mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
    " WHERE userIndex = " +
    mysql.escape(loginCookie);
  // 성공시
  try {
    await myPool.query(query);
    // 성공 로그
    await querySuccessLog(ip, query);

    // 연락처 수정 성공
    return { state: "연락처변경성공" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await queryFailLog(err, ip, query);
    await myPool.query("ROLLBACK");
    return { state: "mysql 사용실패" };
  }
}

// 5-3. 비밀번호 수정 요청 모델
export async function editPwModel(inputPw, ip, loginCookie) {
  // 해싱된 새비밀번호 변수 미리 선언
  let hashedNewPw;
  // 기존에 비밀번호와 일치하나 확인하기 위한 쿼리문
  let query = "SELECT pw FROM USER WHERE userIndex = " + mysql.escape(loginCookie);
  try {
    const [results, fields] = await myPool.query(query);
    // 성공 로그
    await querySuccessLog(ip, query);
    // 유효성 검사
    // DB의 유저 pw와 '현재 비밀번호'창에 입력한 pw 비교
    // 1. 입력한 '현재 비밀번호' DB에 있던 pw과 비교
    if (!bcrypt.compareSync(inputPw.pw, results[0].pw)) {
      return { state: "기존비밀번호 불일치" };
    }
    // 2. '새 비밀번호'와 '새 비밀번호 확인'이 일치하지 않으면 비밀번호 변경 불가
    hashedNewPw = await hashPw(inputPw.newPw);
    if (!bcrypt.compareSync(inputPw.confirmPw, hashedNewPw)) {
      return { state: "비밀번호/비밀번호확인 불일치" };
    }
    // 유효성 검사 통과
    // 비밀번호 변경 요청 쿼리문
    query =
      "UPDATE USER SET pw= " +
      mysql.escape(hashedNewPw) + // 해싱한 새 암호 DB에 저장
      ", updateDateTime=" +
      mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
      " WHERE userIndex = " +
      mysql.escape(loginCookie);

    await myPool.query(query);
    // 성공 로그
    await querySuccessLog(ip, query);

    // 비밀번호 변경 성공
    return { state: "비밀번호변경성공" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await queryFailLog(err, ip, query);
    return { state: "mysql 사용실패" };
  }
}

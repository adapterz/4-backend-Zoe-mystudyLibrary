const mysql = require("mysql2/promise");
const db = require("../a_mymodule/db");
const moment = require("../a_mymodule/date_time");
const { hashPw } = require("../a_mymodule/pw_bcrypt");
const bcrypt = require("bcrypt");
const { queryFail, querySuccessLog } = require("../a_mymodule/const");

// 내 정보/회원가입 기능 관련 모델
// 프로필 변경 요청 모델
async function reviseProfileModel(input_revise, ip, login_cookie) {
  // 유저가 입력한 닉네임이 기존에 존재하는지 확인하기 위해 select 해올 쿼리문
  let query = "SELECT nickName FROM USER WHERE nickName =" + mysql.escape(input_revise.nickName);
  // 성공시
  try {
    await db.pool.query("START TRANSACTION");
    let [results, fields] = await db.pool.query(query);
    // 성공 로그
    await querySuccessLog(ip, query);
    // 유저가 입력한 닉네임이 기존에 존재할 때
    if (results[0] !== undefined) {
      await db.pool.query("ROLLBACK");
      return { state: "중복닉네임" };
    }

    // 새 프로필 정보 수정해줄 쿼리문
    query =
      "UPDATE USER SET nickName=" +
      mysql.escape(input_revise.nickName) +
      ", profileShot =" +
      mysql.escape(input_revise.profileShot) +
      ", updateDateTime =" +
      mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
      " WHERE userIndex =" +
      mysql.escape(login_cookie);

    console.log(1);
    await db.pool.query(query);

    console.log(2);
    // 성공 로그
    await querySuccessLog(ip, query);
    console.log(3);
    await db.pool.query("COMMIT");

    console.log(4);
    return { state: "프로필변경성공" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await queryFail(err, ip, query);
    await db.pool.query("ROLLBACK");
    return { state: "mysql 사용실패" };
  }
}
// 연락처 변경 모델
async function revisePhoneNumberModel(new_contact, ip, login_cookie) {
  // 폰번호 변경 쿼리문
  const query =
    "UPDATE USER SET phoneNumber=" +
    mysql.escape(new_contact.phoneNumber) +
    ", updateDateTime =" +
    mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
    " WHERE userIndex = " +
    mysql.escape(login_cookie);
  // 성공시
  try {
    await db.pool.query(query);
    // 성공 로그
    await querySuccessLog(ip, query);

    // 연락처 수정 성공
    return { state: "연락처변경성공" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await queryFail(err, ip, query);
    await db.pool.query("ROLLBACK");
    return { state: "mysql 사용실패" };
  }
}

// 비밀번호 수정 요청 모델
async function revisePwModel(input_pw, ip, login_cookie) {
  // 해싱된 새비밀번호 변수 미리 선언
  let hashed_new_pw;
  // 기존에 비밀번호와 일치하나 확인하기 위한 쿼리문
  let query = "SELECT pw FROM USER WHERE userIndex = " + mysql.escape(login_cookie);
  try {
    const [results, fields] = await db.pool.query(query);
    // 성공 로그
    await querySuccessLog(ip, query);
    // 유효성 검사
    // DB의 유저 pw와 '현재 비밀번호'창에 입력한 pw 비교
    // 1. 입력한 '현재 비밀번호' DB에 있던 pw과 비교
    if (!bcrypt.compare(input_pw.pw, results[0].pw)) {
      return { state: "기존비밀번호 불일치" };
    }
    // 2. '새 비밀번호'와 '새 비밀번호 확인'이 일치하지 않으면 비밀번호 변경 불가
    hashed_new_pw = await hashPw(input_pw.newPw);
    if (!bcrypt.compareSync(input_pw.confirmPw, hashed_new_pw)) {
      return { state: "비밀번호/비밀번호확인 불일치" };
    }
    // 유효성 검사 통과
    // 비밀번호 변경 요청 쿼리문
    query =
      "UPDATE USER SET pw= " +
      mysql.escape(hashed_new_pw) + // 해싱한 새 암호 DB에 저장
      ", updateDateTime=" +
      mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
      " WHERE userIndex = " +
      mysql.escape(login_cookie);

    await db.pool.query(query);
    // 성공 로그
    await querySuccessLog(ip, query);

    // 비밀번호 변경 성공
    return { state: "비밀번호변경성공" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await queryFail(err, ip, query);
    return { state: "mysql 사용실패" };
  }
}

// 회원탈퇴
async function dropOutModel(ip, login_cookie) {
  // 해당 유저 데이터 삭제 쿼리문
  const query = "DELETE FROM USER WHERE userIndex =" + mysql.escape(login_cookie);
  // 성공시
  try {
    await db.pool.query(query);
    // 성공 로그찍기
    await querySuccessLog(ip, query);
    // 성공적으로 회원탈퇴
    return { state: "회원탈퇴" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await queryFail(err, ip, query);
    await db.pool.query("ROLLBACK");
    return { state: "mysql 사용실패" };
  }
}

module.exports = {
  reviseProfileModel: reviseProfileModel,
  revisePhoneNumberModel: revisePhoneNumberModel,
  revisePwModel: revisePwModel,
  dropOutModel: dropOutModel,
};

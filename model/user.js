const mysql = require("mysql");
const db = require("../a_mymodule/db");
const moment = require("../a_mymodule/date_time");
const { encryption } = require("../a_mymodule/pw_bcrypt");
const bcrypt = require("bcrypt");
const { queryFail, querySuccessLog } = require("../a_mymodule/const");
const { db_connect } = require("../a_mymodule/db");

// 내 정보/회원가입 기능 관련 모델
// 프로필 변경 요청 모델
async function reviseProfileModel(revised, ip, login_cookie) {
  db.db_connect.beginTransaction(async function (error) {
    if (error) throw error;
    // 유저가 입력한 닉네임이 기존에 존재하는지 확인하기 위해 select 해올 쿼리문
    let query = "SELECT nickName FROM USER WHERE nickName =" + mysql.escape(revised.nickName);

    db.db_connect.query(query, async function (err, results) {
      // 쿼리문 실패 메서드
      const fail = await queryFail(err, ip, query);
      if (fail.state === "mysql 사용실패") {
        db_connect.rollback();
        return { state: "mysql 사용실패" };
      }
      await querySuccessLog(ip, query);
      // 유저가 입력한 닉네임이 기존에 존재할 때
      if (results[0] !== undefined) {
        db_connect.rollback();
        return { state: "중복닉네임" };
      }
    });

    // 새 프로필 정보 수정해줄 쿼리문
    query =
      "UPDATE USER SET nickName=" +
      mysql.escape(revised.nickName) +
      ", profileShot =" +
      mysql.escape(revised.profileShot) +
      ", updateDateTime =" +
      mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
      " WHERE userIndex =" +
      mysql.escape(login_cookie);
    // 콜백 쿼리문 실행
    db.db_connect.query(query, async function (err) {
      // 쿼리문 실패 메서드
      const fail = await queryFail(err, ip, query);
      if (fail.state === "mysql 사용실패") {
        db_connect.rollback();
        return { state: "mysql 사용실패" };
      }
      await querySuccessLog(ip, query);
      db_connect.commit();
      return { state: "프로필변경성공" };
    });
  });
}
// 연락처 변경 모델
async function revisePhoneNumberModel(new_contact, ip, login_cookie) {
  db.db_connect.beginTransaction(async function (error) {
    if (error) throw error;
    // 새 개인정보 정보 수정해줄 쿼리문
    const query =
      "UPDATE USER SET phoneNumber=" +
      mysql.escape(new_contact.phoneNumber) +
      ", updateDateTime =" +
      mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
      " WHERE userIndex = " +
      mysql.escape(login_cookie);

    db.db_connect.query(query, async function (err) {
      // 쿼리문 실패 메서드
      const fail = await queryFail(err, ip, query);
      if (fail.state === "mysql 사용실패") {
        db_connect.rollback();
        return { state: "mysql 사용실패" };
      }
      await querySuccessLog(ip, query);

      // 연락처 수정 성공
      db_connect.commit();
      return { state: "연락처변경성공" };
    });
  });
}

// 비밀번호 수정 요청 모델
async function revisePwModel(input_pw, ip, login_cookie) {
  db.db_connect.beginTransaction(async function (error) {
    if (error) throw error;
    // 해싱된 새비밀번호 변수 미리 선언
    let hashed_new_pw;
    // 기존에 비밀번호와 일치하나 확인하기 위한 쿼리문
    let query = "SELECT pw FROM USER WHERE userIndex = " + mysql.escape(login_cookie);

    db.db_connect.query(query, async function (err, results) {
      // 쿼리문 실패 메서드
      const fail = await queryFail(err, ip, query);
      if (fail.state === "mysql 사용실패") {
        db_connect.rollback();
        return { state: "mysql 사용실패" };
      }
      await querySuccessLog(ip, query);
      // 유효성 검사
      // DB의 유저 pw와 '현재 비밀번호'창에 입력한 pw 비교
      // 1. 입력한 '현재 비밀번호' 해싱
      const hashed_old_pw = await encryption(input_pw.pw);
      // DB에 있던 pw과 비교
      if (!bcrypt.compare(hashed_old_pw, results[0].pw)) {
        db_connect.rollback();
        return { state: "기존비밀번호 불일치" };
      }
      // 2. '새 비밀번호'와 '새 비밀번호 확인'이 일치하지 않으면 비밀번호 변경 불가
      hashed_new_pw = await encryption(input_pw.newPw);
      const hashed_new_confirm = await encryption(input_pw.confirmPw);
      if (!bcrypt.compare(hashed_new_pw, hashed_new_confirm)) {
        db_connect.rollback();
        return { state: "비밀번호/비밀번호확인 불일치" };
      }
    });
    // 유효성 검사 통과
    // 비밀번호 변경 요청 쿼리문
    query =
      "UPDATE USER SET pw= " +
      mysql.escape(hashed_new_pw) + // 해싱한 새 암호 DB에 저장
      ", updateDateTime=" +
      mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
      " WHERE userIndex = " +
      mysql.escape(login_cookie);

    db.db_connect.query(query, async function (err) {
      // 쿼리문 실패 메서드
      const fail = await queryFail(err, ip, query);
      if (fail.state === "mysql 사용실패") {
        db_connect.rollback();
        return { state: "mysql 사용실패" };
      }
      await querySuccessLog(ip, query);

      // 비밀번호 변경 성공
      db_connect.commit();
      return { state: "비밀번호변경성공" };
    });
  });
}

// 회원탈퇴
async function dropOutModel(ip, login_cookie) {
  db.db_connect.beginTransaction(async function (error) {
    if (error) throw error;
    // 해당 유저 데이터 삭제 쿼리문
    const query = "DELETE FROM USER WHERE userIndex =" + mysql.escape(login_cookie);
    // 쿼리문 실행
    db.db_connect.query(query, async function (err) {
      // 쿼리문 실패 메서드
      const fail = await queryFail(err, ip, query);
      if (fail.state === "mysql 사용실패") {
        db_connect.rollback();
        return { state: "mysql 사용실패" };
      }
      await querySuccessLog(ip, query);
      db_connect.commit();

      // 성공적으로 회원탈퇴
      return { state: "회원탈퇴" };
    });
  });
}

module.exports = {
  reviseProfileModel: reviseProfileModel,
  revisePhoneNumberModel: revisePhoneNumberModel,
  revisePwModel: revisePwModel,
  dropOutModel: dropOutModel,
};

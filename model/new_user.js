const mysql = require("mysql");
const db = require("../a_mymodule/db");
const { encryption } = require("../a_mymodule/pw_bcrypt");
const bcrypt = require("bcrypt");
const { queryFail, querySuccessLog } = require("../a_mymodule/const");
const moment = require("../a_mymodule/date_time");
const { db_connect } = require("../a_mymodule/db");

// 회원가입 모듈
async function signUpModel(input_user, ip) {
  db.db_connect.beginTransaction(async function (error) {
    if (error) throw error;
    // 해싱 pw 변수 미리 정의
    let hashed_pw;
    // 유저가 입력한 아이디/닉네임이 기존에 있는지 select 해올 쿼리문
    const query =
      "SELECT id,nickName FROM USER WHERE id = " + mysql.escape(input_user.id) + "OR nickName = " + mysql.escape(input_user.nickName);
    db.db_connect.query(query, async function (err, results) {
      // 쿼리문 메서드 실패
      const fail = await queryFail(err, ip, query);
      if (fail.state === "mysql 사용실패") {
        db_connect.rollback();
        return { state: "mysql 사용실패" };
      }
      // 쿼리문 메서드 성공
      await querySuccessLog(ip, query);
      // 1. 유저가 입력한 id나 닉네임이 기존에 있을 때
      if (results[0] !== undefined) {
        db_connect.rollback();
        // 유저가 입력한 아이디가 기존에 존재하는 아이디일 때
        if (results[0].nickName !== input_user.nickName) return { state: "존재하는 아이디" };
        // 유저가 입력한 닉네임이 기존에 존재하는 닉네임일 때
        else return { state: "존재하는 닉네임" };
      }
      // 2. 비밀번호 유효성 검사
      // 입력한 비밀번호와 비밀번호 확인이 다를 때 (해싱된 값끼리 비교)
      hashed_pw = await encryption(input_user.pw);
      const hashed_confirm_pw = await encryption(input_user.confirmPw);
      if (!bcrypt.compare(hashed_pw, hashed_confirm_pw)) {
        db_connect.rollback();
        return { state: "비밀번호/비밀번호확인 불일치" };
      }
    });

    // 모든 유효성 검사 통과 후 회원정보 추가해줄 새로운 쿼리문
    const new_query =
      "INSERT INTO USER(id,pw,name,gender,phoneNumber,nickName,updateDateTime) VALUES (" +
      mysql.escape(input_user.id) +
      "," +
      mysql.escape(hashed_pw) + // 라우터에서 해싱된 pw값 insert
      "," +
      mysql.escape(input_user.name) +
      "," +
      mysql.escape(input_user.gender) +
      "," +
      mysql.escape(input_user.phoneNumber) +
      "," +
      mysql.escape(input_user.nickName) +
      "," +
      mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) + // 계정 생성날짜
      ")";

    db.db_connect.query(new_query, async function (err) {
      // 쿼리문 메서드 실패
      const fail = await queryFail(err, ip, query);
      if (fail.state === "mysql 사용실패") {
        db_connect.rollback();
        return { state: "mysql 사용실패" };
      }
      // 쿼리문 메서드 성공
      await querySuccessLog(ip, query);
      db_connect.commit();
      return { state: "회원가입" };
    });
  });
}

module.exports = { signUpModel: signUpModel };

const mysql = require("mysql");
const db = require("../a_mymodule/db");
const { encryption } = require("../a_mymodule/pw_bcrypt");
const bcrypt = require("bcrypt");
const { queryFail, querySuccessLog } = require("../a_mymodule/const");
const moment = require("../a_mymodule/date_time");

// 회원가입 모듈
function signUpModel(input_user, ip) {
  // 유저가 입력한 아이디/닉네임이 기존에 있는지 select 해올 쿼리문
  const query =
    "SELECT id,nickName FROM USER WHERE id = " + mysql.escape(input_user.id) + "OR nickName = " + mysql.escape(input_user.nickName);
  // 쿼리문 실행
  db.db_connect.query(query, function (err, results) {
    // 쿼리문 메서드 실패
    queryFail(err, ip, query);
    // 쿼리문 메서드 성공
    querySuccessLog(ip, query);
    // 1. 유저가 입력한 id나 닉네임이 기존에 있을 때
    if (results[0] !== undefined) {
      // 유저가 입력한 아이디가 기존에 존재하는 아이디일 때
      if (results[0].nickName !== input_user.nickName) return { state: "존재하는 아이디" };
      // 유저가 입력한 닉네임이 기존에 존재하는 닉네임일 때
      else return { state: "존재하는 닉네임" };
    }
    // 2. 비밀번호 유효성 검사
    // 입력한 비밀번호와 비밀번호 확인이 다를 때 (해싱된 값끼리 비교)
    const hashed_pw = encryption(input_user.pw);
    const hashed_confirm_pw = encryption(input_user.confirmPw);
    if (!bcrypt.compare(hashed_pw, hashed_confirm_pw)) {
      return { state: "비밀번호/비밀번호확인 불일치" };
    }
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

    db.db_connect.query(new_query, function (err) {
      // 쿼리문 메서드 실패
      queryFail(err, ip, query);
      // 쿼리문 메서드 성공
      querySuccessLog(ip, query);
      return { state: "회원가입" };
    });
  });
}

module.exports = { signUpModel: signUpModel };

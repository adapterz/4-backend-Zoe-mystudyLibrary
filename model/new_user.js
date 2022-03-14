// 필요 모듈
const mysql = require("mysql");
const db = require("../a_mymodule/db");
const moment = require("../a_mymodule/date_time");
const { encryption } = require("../a_mymodule/pw_bcrypt");
const bcrypt = require("bcrypt");
const { queryFail, querySuccessLog } = require("../a_mymodule/const");

// 회원가입 모듈
function signUpModel(input_user, ip) {
  // 기존에 아이디가 있나 확인할 쿼리문
  const query =
    "SELECT id,nickName FROM USER WHERE id = " + mysql.escape(input_user.id) + "OR nickName = " + mysql.escape(input_user.nickName);
  // 쿼리문 실행
  db.db_connect.query(query, function (err, results) {
    queryFail(err);
    querySuccessLog(ip, query);
    // 1. 기존에 존재하는 id나 닉네임이 있을 때
    if (results[0] !== undefined) {
      if (results[0].nickName !== input_user.nickName) return { state: "존재하는 아이디" };
      else return { state: "존재하는 닉네임" };
    }
    // 2. 비밀번호 유효성 검사
    // 입력한 비밀번호와 비밀번호 확인이 다를 때 ( 둘다 해싱된 값)
    const hashed_pw = encryption(input_user.pw);
    const hashed_confirm_pw = encryption(input_user.confirmPw);
    if (!bcrypt.compare(hashed_pw, hashed_confirm_pw)) {
      return { state: "비밀번호/비밀번호확인 불일치" };
    }
    // 모든 유효성 검사 통과 후 회원정보 추가
    const new_query =
      "INSERT INTO USER(id,pw,name,gender,phoneNumber,nickName) VALUES (" +
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
      ")";

    // 쿼리문 실행
    db.db_connect.query(new_query, function (err) {
      queryFail(err);
      querySuccessLog(ip, query);
      return { state: "회원가입" };
    });
  });
}

module.exports = { signUpModel: signUpModel };

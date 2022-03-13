// 모듈
const mysql = require("mysql");
const db = require("../a_mymodule/db");
const moment = require("../a_mymodule/date_time");
const { encryption } = require("../a_mymodule/crypto");
const bcrypt = require("bcrypt");
const {query_fail_log, query_success_log} = require("../a_mymodule/const");

// 로그인 모델
function loginModel(input_login, ip) {
  let state;
  // 유저가 입력한 정보 가져오기
  const query = "SELECT userIndex,id,pw,name,gender,phoneNumber,nickName,profileShot FROM USER WHERE id = " + mysql.escape(input_login.id);
  // 쿼리문 실행
  db.db_connect.query(query, function (err, results) {
    query_fail_log(err);
    query_success_log(ip,query);

    // 1. 존재하는 아이디가 없을 때
    if (results[0] === undefined) {
      state = { state: "일치하는 id 없음" };
      return state;
    }
    // 2. 등록된 유저 pw와 입력한 pw가 다르면 로그인 실패
    const hashed_pw = encryption(input_login.pw);
    console.log(hashed_pw);
    if (!bcrypt.compare(hashed_pw, results[0].pw)) {
      state = { state: "비밀번호 불일치" };
      return state;
    }
    // 유효성 검사 통과
    const success = { state: "로그인 성공", userIndex: results[0].userIndex };
    return success;
  });
}

module.exports = { loginModel: loginModel };

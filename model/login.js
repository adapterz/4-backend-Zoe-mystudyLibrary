const mysql = require("mysql");
const db = require("../a_mymodule/db");
const { encryption } = require("../a_mymodule/pw_bcrypt");
const bcrypt = require("bcrypt");
const { queryFail, querySuccessLog } = require("../a_mymodule/const");
const { db_connect } = require("../a_mymodule/db");

// 로그인 모델
async function loginModel(input_login, ip) {
  db.db_connect.beginTransaction(async function (error) {
    if (error) throw error;
    // 유저가 입력한 id의 로우 정보 가져오는 쿼리문
    const query =
      "SELECT userIndex,id,pw,name,gender,phoneNumber,nickName,profileShot FROM USER WHERE id = " + mysql.escape(input_login.id);
    db.db_connect.query(query, async function (err, results) {
      // 쿼리문 메서드 실패
      const fail = await queryFail(err, ip, query);
      if (fail.state === "mysql 사용실패") {
        db_connect.rollback();
        return { state: "mysql 사용실패" };
      }
      // 쿼리문 메서드 성공
      await querySuccessLog(ip, query);

      // 1. 요청한 id와 일치하는 아이디가 없을 때
      if (results[0] === undefined) {
        db_connect.rollback();
        return { state: "일치하는 id 없음" };
      }
      // 2. 등록된 유저 pw와 입력한 pw가 다르면 로그인 실패
      const hashed_pw = await encryption(input_login.pw);
      console.log(hashed_pw);
      if (!bcrypt.compare(hashed_pw, results[0].pw)) {
        db_connect.rollback();
        return { state: "비밀번호 불일치" };
      }
      // 유효성 검사 통과 - 로그인 성공
      db_connect.commit();
      return { state: "로그인 성공", userIndex: results[0].userIndex };
    });
  });
}

module.exports = { loginModel: loginModel };

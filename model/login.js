const mysql = require("mysql2/promise");
const db = require("../a_mymodule/db");
const { hashPw } = require("../a_mymodule/pw_bcrypt");
const bcrypt = require("bcrypt");
const { queryFail, querySuccessLog } = require("../a_mymodule/const");

// 로그인 모델
async function loginModel(input_login, ip) {
  // 유저가 입력한 id의 로우 정보 가져오는 쿼리문
  const query = "SELECT userIndex,id,pw,name,gender,phoneNumber,nickName,profileShot FROM USER WHERE id = " + mysql.escape(input_login.id);
  // 성공시
  try {
    const [results, fields] = await db.pool.query(query);
    // 쿼리문 메서드 성공로그
    await querySuccessLog(ip, query);

    // 1. 요청한 id와 일치하는 아이디가 없을 때
    if (results[0] === undefined) {
      return { state: "일치하는 id 없음" };
    }
    // 2. 등록된 유저 pw와 입력한 pw가 다르면 로그인 실패
    console.log("pw비교" + bcrypt.compareSync(input_login.pw, results[0].pw));
    if (!bcrypt.compareSync(input_login.pw, results[0].pw)) {
      return { state: "비밀번호 불일치" };
    }
    // 유효성 검사 통과 - 로그인 성공
    return { state: "로그인성공", userIndex: results[0].userIndex };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await queryFail(err, ip, query);
    return { state: "mysql 사용실패" };
  }
}

module.exports = { loginModel: loginModel };

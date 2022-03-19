const mysql = require("mysql2/promise");
const db = require("../a_mymodule/db");
const { hashPw } = require("../a_mymodule/pw_bcrypt");
const bcrypt = require("bcrypt");
const { queryFail, querySuccessLog } = require("../a_mymodule/const");
const moment = require("../a_mymodule/date_time");

// 회원가입 모듈
async function signUpModel(input_user, ip) {
  // 유저가 입력한 아이디가 기존에 있는지 select 해올 쿼리문
  let query = "SELECT id FROM USER WHERE id = " + mysql.escape(input_user.id);
  // 성공시
  try {
    let [results, fields] = await db.pool.query(query);
    // 쿼리문 메서드 성공
    await querySuccessLog(ip, query);
    // 1. 유저가 입력한 id나 닉네임이 기존에 있을 때
    // 유저가 입력한 아이디가 기존에 존재하는 아이디일 때
    if (results[0] !== undefined) {
      return { state: "존재하는 아이디" };
    }
    // 유저가 입력한 닉네임이 기존에 존재하는 닉네임일 때
    // 유저가 입력한 닉네임이 기존에 있는지 select 해올 쿼리문
    query = "SELECT nickName FROM USER WHERE nickName = " + mysql.escape(input_user.nickName);
    [results, fields] = await db.pool.query(query);
    await querySuccessLog(ip, query);
    if (results[0] !== undefined) {
      return { state: "존재하는 닉네임" };
    }

    // 2. 비밀번호 유효성 검사
    // 입력한 비밀번호와 비밀번호 확인이 다를 때
    const hashed_pw = await hashPw(input_user.pw);
    //const hashed_confirm_pw = await hashPw(input_user.confirmPw);
    console.log("pw비교:" + bcrypt.compareSync(input_user.confirmPw, hashed_pw));
    if (!bcrypt.compareSync(input_user.confirmPw, hashed_pw)) {
      return { state: "비밀번호/비밀번호확인 불일치" };
    }

    // 모든 유효성 검사 통과 후 회원정보 추가해줄 새로운 쿼리문
    query =
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

    await db.pool.query(query);
    // 성공 로그찍기
    await querySuccessLog(ip, query);

    return { state: "회원가입" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await queryFail(err, ip, query);
    return { state: "mysql 사용실패" };
  }
}

module.exports = { signUpModel: signUpModel };

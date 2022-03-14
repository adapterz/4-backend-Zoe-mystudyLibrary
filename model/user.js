// 필요모듈
const mysql = require("mysql");
const db = require("../a_mymodule/db");
const moment = require("../a_mymodule/date_time");
const { encryption } = require("../a_mymodule/pw_bcrypt");
const bcrypt = require("bcrypt");
const library_model = require("./library");
const { queryFail, querySuccessLog } = require("../a_mymodule/const");

// 내 정보/회원가입 기능 관련 모델
// 프로필 변경 모델
function reviseProfileModel(revised, ip, login_cookie) {
  let query = "SELECT nickName FROM USER WHERE nickName =" + mysql.escape(revised.nickName);
  // 쿼리문 실행
  db.db_connect.query(query, function (err, results) {
    queryFail(err);
    querySuccessLog(ip, query);
    // 기존에 존재하는 닉네임이 있을 때
    if (results[0] !== undefined) {
      return { state: "중복닉네임" };
    }
    // 새 프로필 정보 수정해줄 쿼리문
    // eslint-disable-next-line no-unreachable
    query =
      "UPDATE USER SET nickName=" +
      mysql.escape(revised.nickName) +
      ", profileShot =" +
      mysql.escape(revised.profileShot) +
      " WHERE userIndex =" +
      mysql.escape(login_cookie);
    // 콜백 쿼리문 실행
    db.db_connect.query(query, function (err) {
      queryFail(err);
      querySuccessLog(ip, query);
      return { state: "프로필변경성공" };
    });
  });
}
// 연락처 변경 모델
function revisePhoneNumberModel(new_contact, ip, login_cookie) {
  // 새 개인정보 정보 수정해줄 쿼리문
  const query = "UPDATE USER SET phoneNumber=" + mysql.escape(new_contact.phoneNumber) + " WHERE userIndex = " + mysql.escape(login_cookie);
  // 쿼리문 실행
  db.db_connect.query(query, function (err) {
    queryFail(err);
    querySuccessLog(ip, query);

    // 연락처 수정 성공
    return { state: "연락처변경성공" };
  });
}

// 비밀번호 수정
function revisePwModel(input_pw, ip, login_cookie) {
  // 기존에 비밀번호와 일치하나 확인해줄 쿼리문
  let query = "SELECT pw,salt FROM USER WHERE userIndex = " + mysql.escape(login_cookie);
  // 쿼리문 실행
  db.db_connect.query(query, function (err, results) {
    queryFail(err);
    querySuccessLog(ip, query);
    // 유효성 검사
    // 유저 비밀번호와 oldPw 비교
    // 1. input oldPw 해싱
    const hashed_old_pw = encryption(input_pw.pw);
    if (!bcrypt.compare(hashed_old_pw, results[0].pw)) {
      return { state: "기존비밀번호 불일치" };
    }
    // 2. '새 비밀번호'와 '새 비밀번호 확인'이 일치하지 않으면 비밀번호 변경 불가
    const hashed_old_confirm = encryption(input_pw.confirmPw);
    if (!bcrypt.compare(hashed_old_pw, hashed_old_confirm)) {
      return { state: "비밀번호/비밀번호확인 불일치" };
    }
    // 유효성 검사 통과
    // 비밀번호 변경 쿼리문
    const hashed_new_pw = encryption(input_pw.newPw);
    query =
      "UPDATE USER SET pw= " +
      mysql.escape(hashed_new_pw) + // 라우터에서 해싱된 암호 DB에 저장
      " WHERE userIndex = " +
      mysql.escape(login_cookie);
    // 쿼리문 실행
    db.db_connect.query(query, function (err) {
      queryFail(err);
      querySuccessLog(ip, query);

      // 비밀번호 변경 성공
      return { state: "비밀번호변경성공" };
    });
  });
}

// 회원탈퇴
function dropOutModel(ip, login_cookie) {
  // 해당 유저 데이터 삭제 쿼리문
  const query = "DELETE FROM USER WHERE userIndex =" + mysql.escape(login_cookie);
  // 쿼리문 실행
  db.db_connect.query(query, function (err) {
    queryFail(err);
    querySuccessLog(ip, query);

    // 회원탈퇴 안내조항에 체크했을 때 성공적으로 회원탈퇴
    return { state: "회원탈퇴" };
  });
}

module.exports = {
  reviseProfileModel: reviseProfileModel,
  revisePhoneNumberModel: revisePhoneNumberModel,
  revisePwModel: revisePwModel,
  dropOutModel: dropOutModel,
};

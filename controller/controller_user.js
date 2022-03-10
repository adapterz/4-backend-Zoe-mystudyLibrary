// 내 정보 라우터의 컨트롤러
// 예시 유저 ( 로그인 한 유저의 정보)
const crypto = require("crypto");
const db = require("../a_mymodule/db");
const moment = require("../a_mymodule/date_time");

// mysql 모듈
const mysql = require("mysql");

const user = {
  userIndex: 1,
  id: "syjg1234",
  password: "hassing_pw1",
  name: "Zoe",
  gender: "여",
  phoneNumber: "01028400631",
  salt: "1234#",
  nickName: null,
  profileShot: null,
};
// TODO 로그인 기능 배운 뒤 다시작성
// 내 프로필 수정
const reviseProfile = function (req, res) {
  const login_cookie = req.signedCookies.user;
  // 로그인 여부 검사
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });

  // 입력된 새 프로필 정보 수정 요청
  const new_profile = req.body;
  // 유효성 검사
  // 기존에 닉네임이 있나 확인할 쿼리문
  let query = "SELECT nickName FROM USER WHERE nickName =" + mysql.escape(new_profile.nickName);
  // 쿼리문 실행
  db.db_connect.query(query, function (err, results) {
    if (err) {
      console.log(("reviseProfile 메서드 mysql 모듈사용 실패:" + err).red.bold);
      return res.status(500).json({ state: "reviseProfile 메서드 mysql 모듈사용 실패:" + err });
    }
    console.log(("CLIENT IP: " + req.ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + query).blue.bold);

    // 기존에 존재하는 닉네임이 있을 때
    if (results[0].nickName === new_profile.nickName) return res.status(400).json({ state: "기존에 존재하는 닉네임입니다." });

    // 새 프로필 정보 수정해줄 쿼리문
    query =
      "UPDATE USER SET nickName=" +
      mysql.escape(new_profile.nickName) +
      ", profileShot =" +
      mysql.escape(new_profile.profileShot) +
      " WHERE userIndex =" +
      mysql.escape(user.userIndex);
    // 콜백 쿼리문 실행
    db.db_connect.query(query, function (err) {
      if (err) {
        console.log(("reviseProfile 메서드 mysql 모듈사용 실패:" + err).red.bold);
        return res.status(500).json({ state: "reviseProfile 메서드 mysql 모듈사용 실패:" + err });
      }
      console.log(("CLIENT IP: " + req.ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + query).blue.bold);

      // 프로필 수정 성공
      res.status(200).end();
    });
  });
};

// 회원정보 수정(연락처 수정)
const revisePhoneNumber = function (req, res) {
  const login_cookie = req.signedCookies.user;
  // 로그인 여부 검사
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  const new_contact = req.body;
  // 새 개인정보 정보 수정해줄 쿼리문
  const query =
    "UPDATE USER SET phoneNumber=" + mysql.escape(new_contact.phoneNumber) + " WHERE userIndex = " + mysql.escape(user.userIndex);
  // 쿼리문 실행
  db.db_connect.query(query, function (err) {
    if (err) {
      console.log(("revisePhoneNumber 메서드 mysql 모듈사용 실패:" + err).red.bold);
      return res.status(500).json({ state: "revisePhoneNumber 메서드 mysql 모듈사용 실패:" + err });
    }
    console.log(("CLIENT IP: " + req.ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + query).blue.bold);

    // 연락처 수정 성공
    res.status(200).end();
  });
};

// 비밀번호 수정(patch)
const revisePw = function (req, res) {
  /*
  body : oldPw/newPw/confirmPw
   */
  // 입력된 비밀번호 정보 가져오기
  const revise_pw = req.body;

  const login_cookie = req.signedCookies.user;
  // 로그인 여부 검사
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 유효성 검사
  // 기존에 비밀번호와 일치하나 확인해줄 쿼리문
  let query = "SELECT pw,salt FROM USER WHERE userIndex = " + mysql.escape(user.userIndex);
  // 쿼리문 실행
  db.db_connect.query(query, function (err, results) {
    if (err) {
      console.log(("revisePw 메서드 mysql 모듈사용 실패:" + err).red.bold);
      return res.status(500).json({ state: "revisePw 메서드 mysql 모듈사용 실패:" + err });
    }
    console.log(("CLIENT IP: " + req.ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + query).blue.bold);
    // 유효성 검사
    // 유저 비밀번호와 oldPw 비교
    // 1. input oldPw 해싱
    let salts = results[0].salt;
    const hashed_input_pw = crypto
      .createHash("sha512")
      .update(revise_pw.oldPw + salts)
      .digest("hex");
    if (hashed_input_pw !== results[0].pw) return res.status(400).json({ state: "비밀번호가 일치하지 않습니다." });
    // 2. '새 비밀번호'와 '새 비밀번호 확인'이 일치하지 않으면 비밀번호 변경 불가
    if (revise_pw.newPw !== revise_pw.confirmPw)
      return res.status(400).json({ state: "'비밀번호'와 '비밀번호 확인'이 일치하지 않습니다." });
    // 유효성 검사 통과
    // 암호화
    // 새로운 salts 발급
    salts = crypto.randomBytes(128).toString("base64");
    // 해싱된 암호
    const hashed_pw = crypto
      .createHash("sha512")
      .update(revise_pw.newPw + salts)
      .digest("hex");
    // 비밀번호 변경 쿼리문
    query =
      "UPDATE USER SET pw= " +
      mysql.escape(hashed_pw) +
      ",salt=" +
      mysql.escape(salts) +
      " WHERE userIndex = " +
      mysql.escape(user.userIndex);
    // 쿼리문 실행
    db.db_connect.query(query, function (err) {
      if (err) {
        console.log(("revisePw 메서드 mysql 모듈사용 실패:" + err).red.bold);
        return res.status(500).json({ state: "revisePw 메서드 mysql 모듈사용 실패:" + err });
      }
      console.log(("CLIENT IP: " + req.ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + query).blue.bold);

      // 비밀번호 변경 성공
      res.status(200).end();
    });
  });
};

// TODO 체크박스 체크여부 갖고올 수 있을 때 다시 작성
// 회원탈퇴 요청
const dropOut = function (req, res) {
  // 예시 바디
  const example_body = {
    checkBox1: false,
  };
  const login_cookie = req.signedCookies.user;
  // 로그인 여부 검사
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 회원탈퇴 안내조항에 체크 했는지
  const is_agreed = req.body;
  // 안내조항에 체크하지 않았을 때 회원탈퇴 실패
  if (!is_agreed) return res.status(400).json({ state: "회원탈퇴를 위해서는 안내조항에 동의해주세요." });
  // 해당 유저 데이터 삭제 쿼리문
  const query = "DELETE FROM USER WHERE userIndex =" + mysql.escape(user.userIndex);
  // 쿼리문 실행
  db.db_connect.query(query, function (err) {
    if (err) {
      console.log(("dropOut 메서드 mysql 모듈사용 실패:" + err).red.bold);
      return res.status(500).json({ state: "dropOut 메서드 mysql 모듈사용 실패:" + err });
    }
    console.log(("CLIENT IP: " + req.ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + query).blue.bold);

    // 회원탈퇴 안내조항에 체크했을 때 성공적으로 회원탈퇴
    return res.status(204).end();
  });
};

// 모듈화
module.exports = {
  reviseProfile: reviseProfile,
  revisePhoneNumber: revisePhoneNumber,
  revisePw: revisePw,
  dropOut: dropOut,
};

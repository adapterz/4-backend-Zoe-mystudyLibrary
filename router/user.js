// 로그인 후 내 정보창 눌렀을 때 탭 라우터
const express = require("express");
const router = express.Router();
const controller = require("../controller/controller_user");
//
const { body } = require("express-validator");

// 내프로필 변경
router.patch(
  "/profile",
  body("profileShot").isDataURI(),
  body("nickName")
    .isString()
    .trim()
    .isLength({ min: 2, max: 8 })
    .matches(/^[가-힣|a-z|A-Z|0-9]+$/), // 한글, 숫자, 영어만 입력 가능한 정규 표현식
  controller.reviseProfile,
);
// 연락처변경 요청
router.patch(
  "/user-data",
  body("phoneNumber")
    .matches(/^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/) // 휴대전화 정규식
    .notEmpty(),
  controller.revisePhoneNumber,
);
// 비밀번호변경 요청
router.patch(
  "/new-pw",
  body("newPw")
    .isString()
    .trim()
    .matches(/^(?=.*[a-zA-z])(?=.*[0-9])(?=.*[$`~!@$!%*#^?&\\(\\)\-_=+]).{8,16}$/), // 하나 이상의 문자(영문),숫자,특수문자가 포함되도록 하는 정규식(8~16)
  controller.revisePw,
);

// 회원탈퇴 요청
router.delete("/drop-out", controller.dropOut);
// 모듈화
module.exports = router;

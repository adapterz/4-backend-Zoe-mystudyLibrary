// 회원가입화면 라우터
const express = require("express");
const router = express.Router();
const controller = require("../controller/controller_new_user");
const { body } = require("express-validator");
const check = require("../validation");

// 요청 별 정의
// 회원가입 약관확인
router.post("/", body("checkBox1").isBoolean(), body("checkBox2").isBoolean(), body("checkBox3").isBoolean(), check.is_validate, controller.signUpGuide);

// 회원가입 요청
router.post(
  "/sign-up",
  body("id")
    .isString()
    .trim()
    .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{5,20}$/), // 5 ~ 20글자 사이의 하나 이상의 문자와 하나의 숫자 정규식
  body("pw")
    .isString()
    .trim()
    .matches(/^(?=.*[a-zA-z])(?=.*[0-9])(?=.*[$`~!@$!%*#^?&\\(\\)\-_=+]).{8,16}$/), // 8~16자리 하나 이상의 문자,숫자,특수문자가 포함되도록 하는 정규식
  body("name")
    .isString()
    .trim()
    .notEmpty()
    .isLength({ max: 30 })
    .matches(/^[가-힣]+$/), // 한글만
  body("gender").isString().notEmpty(),
  body("phoneNumber").matches(/^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/), // 휴대전화 정규식
  check.is_validate,
  controller.signUp,
);

// 모듈화
module.exports = router;

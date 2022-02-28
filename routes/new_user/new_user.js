// 회원가입화면 라우터
const express = require("express");
const router = express.Router();
const controller = require("./controller_new_user");

// 요청 별 정의
// 회원가입 약관확인
router.post("/", controller.signUpGuide);

// 회원가입 요청
router.post("/sign_up", controller.signUp);

// 모듈화
module.exports = router;

// 회원가입화면 라우터
const express = require("express");
const router = express.Router();
const control = require("./controller_new_user");

// 요청 별 정의
// 기본화면
router.get("/", control.get_new_user);

// 회원가입 약관확인
router.post("/", control.confirm_terms_of_use);

// 회원가입 요청
router.post("/sign_up", control.sign_up);

// 모듈화
module.exports = router;

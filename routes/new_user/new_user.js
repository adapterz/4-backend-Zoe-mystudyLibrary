// 회원가입화면 라우터
const express = require("express");
const router = express.Router();
const control = require("./controller_new_user");

// 요청 별 정의
router.get("/", control.get_new_user);

// 모듈화
module.exports = router;

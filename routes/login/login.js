// 로그인창 라우터
const express = require("express");
const router = express.Router();
const control = require("./controller_login");

// 요청 별 정의
// 기본화면
router.get("/", control.get_login);

// 로그인 요청
router.post("/", control.login);

// 모듈화
module.exports = router;

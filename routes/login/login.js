// 로그인창 라우터
const express = require("express");
const router = express.Router();
const control = require("./controller_login");

// 요청 별 정의
router.get("/", control.get_login);

// 모듈화
module.exports = router;

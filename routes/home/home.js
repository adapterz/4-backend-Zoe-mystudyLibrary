// 홈 화면 라우터
const express = require("express");
const router = express.Router();
const control = require("./controller_home");

// 요청 별 정의
router.get("/", control.get_home);

// 모듈화
module.exports = router;

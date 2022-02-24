// 홈 화면 라우터
const express = require("express");
const router = express.Router();
const controller = require("./controller_home");

// 요청 별 정의
router.get("/", controller.get_home);

// 모듈화
module.exports = router;

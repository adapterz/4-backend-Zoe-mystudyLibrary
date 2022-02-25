// 로그인창 라우터
const express = require("express");
const router = express.Router();
const controller = require("./controller_mypost");

// 요청 별 정의
// 기본화면
router.get("/", controller.my);

// 모듈화
module.exports = router;

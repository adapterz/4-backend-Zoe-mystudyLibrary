// 로그인창 라우터
const express = require("express");
const router = express.Router();
const controller = require("./controller_login");

// 요청 별 정의
// 로그인 요청
router.post("/", controller.login);

// 모듈화
module.exports = router;

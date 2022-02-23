// 서비스 설명 라우터
const express = require("express");
const router = express.Router();
const control = require("./controller_service_description");

// 요청 별 정의
router.get("/", control.get_service_description);

// 모듈화
module.exports = router;

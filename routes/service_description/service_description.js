// 서비스 설명 라우터
const express = require("express");
const router = express.Router();
const controller = require("./controller_service_description");

// 서비스설명 탭 화면
router.get("/", controller.get_service_description);

// 모듈화
module.exports = router;

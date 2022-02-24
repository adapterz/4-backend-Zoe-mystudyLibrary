// 로그인 후 내 정보창 눌렀을 때 탭 라우터
const express = require("express");
const router = express.Router();
const controller = require("./controller_user");
// 요청 별 정의
router.get("/", controller.get_user);

// 모듈화
module.exports = router;

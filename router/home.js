// 홈 화면 라우터
const express = require("express");
const router = express.Router();
const controller = require("../controller/controller_home");

// 최신글 자유게시판 5개, 공부인증샷 4개 정보
router.get("/", controller.getRecentPost);

// 모듈화
module.exports = router;

// 홈 화면 라우터
const express = require("express");
const router = express.Router();
const controller = require("../controller/controller_home");

// 최신글 자유게시판 5개, 공부인증샷 4개 정보
router.get("/", controller.getRecentPost);

// 내가 관심도서관으로 등록한 도서관 정보
router.get("/my-lib", controller.myLib);

// 모듈화
module.exports = router;

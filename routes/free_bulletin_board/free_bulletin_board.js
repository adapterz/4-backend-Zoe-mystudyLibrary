// 자유게시판 눌렀을 때 라우터
const express = require("express");
const router = express.Router();
const control = require("./controller_free_bulletin_board");

// 요청 별 정의
router.get("/", control.get_free_bulletin_board);

// 모듈화
module.exports = router;

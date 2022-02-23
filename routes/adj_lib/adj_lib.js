// 내주변도서관 눌렀을 때 라우터
const express = require("express");
const router = express.Router();
const control = require("./controller_adj_lib");

// 요청 별 정의
router.get("/", control.get_adj_lib);

// 모듈화
module.exports = router;

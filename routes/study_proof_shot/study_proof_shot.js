// 공부인증샷 라우터
const express = require("express");
const router = express.Router();
const control = require("./controller_study_proof_shot");

// 요청 별 정의
router.get("/", control.get_study_proof_shot);

// 모듈화
module.exports = router;

// 로그인창 라우터
const express = require("express");
const router = express.Router();
const controller = require("../controller/controller_login");

// 유효성 검사를 위한 모듈
const { body } = require("express-validator");
const check = require("../validation");

// 로그인 요청
router.post("/", body("id").isString().trim(), body("pw").isString().trim(), check.is_validate, controller.login);

// 모듈화
module.exports = router;

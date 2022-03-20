// 도서관 라우터
const express = require("express");
const router = express.Router();
const controller = require("../controller/library");
// 유효성 검사를 위한 모듈
const { body } = require("express-validator");
const check = require("../my_module/check_validation.js");

// 전체도서관 정보
router.get("/", controller.allLib);
// 내 지역의 도서관 정보(시도명, 시군구명 body 로 보내기)
router.post(
  "/",
  body("nameOfCity")
    .isString()
    .trim()
    .isLength({ min: 1, max: 10 })
    .matches(/^[가-힣\n]+$/), // 한글, 띄어쓰기만
  body("districts")
    .isString()
    .trim()
    .isLength({ min: 1, max: 10 })
    .matches(/^[가-힣\n]+$/),
  check.is_validate,
  controller.localLib,
);
// 특정 도서관 자세히 보기
router.get("/:libIndex", controller.particularLib);
// 모듈화
module.exports = router;

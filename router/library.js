// 도서관 라우터
const express = require("express");
const router = express.Router();
const controller = require("../controller/library");
// 유효성 검사를 위한 모듈
const { query, param } = require("express-validator");
const check = require("../my_module/check_validation.js");

// 전체도서관 정보
router.get("/", controller.allLibrary);
// 내 지역의 도서관 정보(시도명, 시군구명 body 로 보내기)
router.get(
  "/search",
  query("nameOfCity")
    .isString()
    .trim()
    .isLength({ min: 1, max: 8 })
    .matches(/^[가-힣]+$/), // 한글만
  query("districts")
    .isString()
    .trim()
    .isLength({ min: 1, max: 15 })
    .matches(/^[가-힣]+$/),
  check.isValidate,
  controller.localLibrary,
);
// 특정 도서관 자세히 보기
router.get("/detail/:libraryIndex", param("libraryIndex").isInt(), check.isExist, controller.detailLibrary);
// 모듈화
module.exports = router;

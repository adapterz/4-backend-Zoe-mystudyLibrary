// 내주변도서관 눌렀을 때 라우터
const express = require("express");
const router = express.Router();
const controller = require("../controller/controller_adj_lib");
// 유효성 검사를 위한 모듈
const { body } = require("express-validator");

// 전체도서관 정보
router.get("/", controller.allLib);
// 내 지역의 도서관 정보(시도명, 시군구명 body로 보내기)
router.post(
  "/",
  body("nameOfCity")
    .isString()
    .trim()
    .notEmpty()
    .isLength({ max: 10 })
    .matches(/^[가-힣]+$/), // 한글만
  body("districts")
    .isString.trim()
    .notEmpty()
    .isLength({ max: 10 })
    .matches(/^[가-힣]+$/),
  controller.localLib,
);
// 특정 도서관 자세히 보기
router.get("/:lib-index", controller.particularLib);

// 모듈화
module.exports = router;

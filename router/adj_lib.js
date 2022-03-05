// 내주변도서관 눌렀을 때 라우터
const express = require("express");
const router = express.Router();
const controller = require("../controller/controller_adj_lib");
// 유효성 검사를 위한 모듈
const { body } = require("express-validator");
const check = require("../a_mymodule/validation.js");

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
// 내 정보의 '관심 도서관'에 특정도서관 데이터 추가
router.patch("/:libIndex", controller.registerMyLib);
// 특정 도서관 이용 후 후기등록
router.post(
  "/:libIndex/review",
  body("reviewContent").isLength({ min: 2, max: 100 }).isString(),
  body("grade").isFloat({ min: 1, max: 5 }),
  check.is_validate,
  controller.registerComment,
);
// 후기 삭제
router.delete("/:libIndex", controller.deleteReview);

// 모듈화
module.exports = router;

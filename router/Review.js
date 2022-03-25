// 도서관 후기 라우터
const express = require("express");
const router = express.Router();
const controller = require("../controller/Review");

const { body, query } = require("express-validator");
const check = require("../custom_module/CheckValidation");
// 후기 등록
router.post(
  "/post",
  query("libraryIndex").isInt(),
  check.isExist,
  body("reviewContent").isLength({ min: 2, max: 100 }).isString(),
  body("grade").isFloat({ min: 1, max: 5 }),
  check.isValidate,
  controller.registerReview,
);
// 수정 시 기존 후기 정보 불러오기
router.get("/", query("libraryIndex").isInt(), query("reviewIndex").isInt(), check.isExist, controller.getReview);
// 후기 수정 요청
router.patch(
  "/patch",
  query("libraryIndex").isInt(),
  query("reviewIndex").isInt(),
  check.isExist,
  body("reviewContent").isLength({ min: 2, max: 100 }).isString(),
  body("grade").isInt({ min: 1, max: 5 }),
  check.isValidate,
  controller.reviseReview,
);
// 후기 삭제
router.delete(
  "/delete",
  query("libraryIndex").isInt().isLength({ min: 1, max: 4 }),
  query("reviewIndex").isInt(),
  check.isExist,
  controller.deleteReview,
);

// 모듈화
module.exports = router;

// 후기 라우터
const express = require("express");
const router = express.Router();
const controller = require("../controller/review");

const { body } = require("express-validator");
const check = require("../my_module/check_validation");

router.post(
  "/post",
  body("reviewContent").isLength({ min: 2, max: 100 }).isString(),
  body("grade").isFloat({ min: 1, max: 5 }),
  check.is_validate,
  controller.registerReview,
);
// 기존 후기 정보 불러오기
router.get("/", controller.getReview);
// 후기 수정요청
router.patch(
  "/patch",
  body("reviewContent").isLength({ min: 2, max: 100 }).isString(),
  body("grade").isInt({ min: 1, max: 5 }),
  check.is_validate,
  controller.reviseReview,
);
// 후기 삭제
router.delete("/delete", controller.deleteReview);

// 모듈화
module.exports = router;

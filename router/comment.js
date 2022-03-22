// 댓글 라우터
const express = require("express");
const router = express.Router();
const controller = require("../controller/comment");
const { body, query } = require("express-validator");
const check = require("../custom_module/check_validation");

// 댓글 작성
router.post(
  "/post",
  query("boardIndex").isInt().trim(),
  check.isExist,
  body("content").isLength({ min: 2, max: 500 }).isString(),
  check.isValidate,
  controller.writeComment,
);
// 기존 댓글 정보 불러오기
router.get("/", query("boardIndex").isInt().trim(), query("commentIndex").isInt().trim(), check.isExist, controller.getComment);
// 댓글 수정 요청
router.patch(
  "/patch",
  query("boardIndex").isInt().trim(),
  query("commentIndex").isInt().trim(),
  check.isExist,
  body("content").isLength({ min: 2, max: 500 }).isString(),
  check.isValidate,
  controller.reviseComment,
);
// 댓글 삭제
router.delete("/delete", query("boardIndex").isInt().trim(), query("commentIndex").isInt().trim(), check.isExist, controller.deleteComment);

// 모듈화
module.exports = router;

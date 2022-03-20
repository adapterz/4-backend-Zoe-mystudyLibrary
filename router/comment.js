// 댓글 라우터
const express = require("express");
const router = express.Router();
const controller = require("../controller/comment");
const { body } = require("express-validator");
const check = require("../my_module/check_validation");

// 댓글 작성
router.post("/post", body("content").isLength({ min: 2, max: 500 }).isString(), check.is_validate, controller.writeComment);
// 기존 댓글 정보 불러오기
router.get("/", controller.getComment);
// 댓글 수정요청
router.patch("/patch", body("content").isLength({ min: 2, max: 500 }).isString(), check.is_validate, controller.reviseComment);
// 댓글 삭제
router.delete("/delete", controller.deleteComment);

// 모듈화
module.exports = router;

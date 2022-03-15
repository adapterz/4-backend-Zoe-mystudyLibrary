// 게시판 라우터
const express = require("express");
const router = express.Router();
const controller = require("../controller/board");

// 유효성 검사를 위한 모듈
const { body } = require("express-validator");
const check = require("../a_mymodule/validation");

// 전체 게시물 목록보기
router.get("/search/:category", controller.entireBoard);
// 각 게시물 상세보기
router.get("/search/:boardIndex", controller.detailBoard);
// 글작성 완료시
router.post(
  "/write/:category",
  body("postTitle").isLength({ min: 2, max: 50 }).isString(),
  body("postContent").isLength({ min: 2, max: 5000 }).isString(),
  body("tags").isArray({ max: 5 }),
  body("tags.*.content")
    .isLength({ min: 2, max: 8 })
    .trim()
    .isString()
    .matches(/^[가-힣]+$/),
  check.is_validate,
  controller.writePost,
);
// 글 작성창 (최초작성, 기존 댓글 수정 기능 여기에 다 있음)
router.get("/write/:category", controller.getWrite);
// 게시글 수정 요청
router.patch(
  "/write/:category",
  body("postTitle").isLength({ min: 2, max: 50 }).isString(),
  body("postContent").isLength({ min: 2, max: 5000 }).isString(),
  body("tags").isArray({ max: 5 }),
  body("tags.*.content")
    .isLength({ min: 2, max: 8 })
    .trim()
    .isString()
    .matches(/^[가-힣]+$/),
  check.is_validate,
  controller.revisePost,
);
// 게시물 삭제
router.delete("/search/:boardIndex", controller.deletePost);
// 댓글 작성
router.post("/search/:boardIndex", body("content").isLength({ min: 2, max: 500 }).isString(), check.is_validate, controller.writeComment);
// 기존 댓글 정보 불러오기
router.get("/search/:boardIndex", controller.getComment);
// 댓글 수정요청
router.patch("/search/:boardIndex", body("content").isLength({ min: 2, max: 500 }).isString(), check.is_validate, controller.reviseComment);
// 댓글 삭제
router.delete("/search/:boardIndex", controller.deleteComment);
// 좋아요 기능
router.patch("/search/:boardIndex", controller.likePost);
// 검색관련 기능
router.get("/search/:category", controller.searchPost);
// 모듈화
module.exports = router;

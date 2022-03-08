// 게시판 라우터
const express = require("express");
const router = express.Router();
const controller = require("../controller/controller_board");

// 유효성 검사를 위한 모듈
const { body } = require("express-validator");
const check = require("../a_mymodule/validation");

// 전체 게시물 목록보기
router.get("/search/:category", controller.entireBoard);
// 각 게시물 상세보기
router.get("/search/:boardIndex", controller.detailBoard);
// 글작성 완료시
// 유효성 검사 포함
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
// 글 작성창
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
router.post(
  "/search/:boardIndex",
  body("commentContent").isLength({ min: 2, max: 500 }).isString(),
  check.is_validate,
  controller.writeComment,
);

// TODO RESTApi 공부
// 댓글 삭제
router.delete("/search/:boardIndex", controller.deleteComment);
// 좋아요 기능
router.patch("/search/:boardIndex", controller.likePost);

// TODO
// 검색관련 기능

// 모듈화
module.exports = router;

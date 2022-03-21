// 게시판 라우터
const express = require("express");
const router = express.Router();
const controller = require("../controller/board");

// 유효성 검사를 위한 모듈
const { body } = require("express-validator");
const check = require("../my_module/check_validation");

// 최신글 자유게시판 5개, 공부인증샷 4개 정보
router.get("/board", controller.getRecentPost);
// 전체 게시물 목록보기
router.get("/board/:category", controller.entireBoard);
// 각 게시물 상세보기
router.get("/board/:category/:boardIndex", controller.detailBoard);
// 최초 게시글 작성 요청
router.post(
  "/write",
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
// 수정시 기존 게시글 정보 가져오기
router.get("/write", controller.getWrite);
// 게시글 수정 요청
router.patch(
  "/write",
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
// 게시물 삭제 요청
router.delete("/delete", controller.deletePost);
// 좋아요 기능
router.patch("/like", controller.likePost);
// 검색관련 기능
router.get("/search/:category", controller.searchPost);
// 모듈화
module.exports = router;

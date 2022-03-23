// 게시판 라우터
const express = require("express");
const router = express.Router();
const controller = require("../controller/board");

// 유효성 검사를 위한 모듈
const { body, query, param } = require("express-validator");
const check = require("../custom_module/check_validation");
// 최신글 자유게시판 5개, 공부인증샷 4개 정보
router.get("/board", check.isExist, controller.getRecentPost);
// 전체 게시물 목록보기
router.get("/board/:category", check.isCategory, check.checkPageValidation, controller.entireBoard);
// 각 게시물 상세보기
router.get(
  "/board/:category/:boardIndex",
  param("boardIndex").isInt(),
  check.isCategory,
  check.isExist,
  check.checkPageValidation,
  controller.detailBoard,
);
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
  check.isValidate,
  check.isCategoryWhenWrite,
  controller.writePost,
);
// 수정시 기존 게시글 정보 가져오기
router.get("/write", query("boardIndex").isInt(), check.isExist, controller.getWrite);
// 게시글 수정 요청
router.patch(
  "/write",
  query("boardIndex").isInt(),
  check.isExist,
  body("postTitle").isLength({ min: 2, max: 50 }).isString(),
  body("postContent").isLength({ min: 2, max: 5000 }).isString(),
  body("tags").isArray({ max: 5 }),
  body("tags.*.content")
    .isLength({ min: 2, max: 8 })
    .trim()
    .isString()
    .matches(/^[가-힣]+$/),
  check.isValidate,
  check.isCategoryWhenWrite,
  controller.revisePost,
);
// 게시물 삭제 요청
router.delete("/delete", query("boardIndex").isInt(), check.isExist, controller.deletePost);
// 좋아요 기능
router.patch("/like", query("boardIndex").isInt(), check.isExist, controller.likePost);
// 검색관련 기능
router.get(
  "/search/:category",
  check.isCategory,
  check.isSearchOption,
  query("searchContent").isString(),
  check.isValidate,
  check.checkPageValidation,
  controller.searchPost,
);
// 모듈화
module.exports = router;

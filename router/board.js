// 게시판 라우터
const express = require("express");
const router = express.Router();
const controller = require("../controller/controller_board");

// 유효성 검사를 위한 모듈
const { body } = require("express-validator");
const check = require("../validation");

// 자유게시판
// 전체 게시물 목록보기
router.get("/free-board", controller.entireBoard);
// 각 게시물 상세보기
router.get("/free-board/:board-index", controller.detailBoard);
// 글작성 완료시
// 유효성 검사 포함
router.post(
  "/free-board/write",
  body("title").isLength({ min: 2, max: 50 }).isString(),
  body("content").isLength({ min: 2, max: 5000 }).isString(),
  body("tags").isArray({ max: 5 }),
  body("tags.*.content")
    .isLength({ min: 2, max: 8 })
    .trim()
    .isString()
    .matches(/^[가-힣]+$/),
  check.is_validate,
  controller.writePost,
);
// 게시물 수정
// 유효성 검사
router.patch(
  "/free-board/write",
  body("title").isLength({ min: 2, max: 50 }).isString(),
  body("content").isLength({ min: 2, max: 5000 }).isString(),
  body("tags").isArray({ max: 5 }).isString(),
  body("tags.*").isLength({ min: 2, max: 8 }).isString().trim(),
  check.is_validate,
  controller.revisePost,
);
// 게시물 삭제
router.delete("/free-board/:board-index", controller.deletePost);
// 댓글 작성
router.post("/free-board/:board-index/:comment-index", body("comments").isLength({ min: 2, max: 500 }).isString(), check.is_validate, controller.writeComment);
// 댓글 삭제
router.delete("/free-board/:board-index/:comment-index", controller.deleteComment);
// 좋아요 기능
router.patch("/free-board/:board-index", controller.likePost);

// 공부인증샷
// 자유게시판
// 전체 게시물 목록보기
router.get("/proof-shot", controller.entireBoard);
// 각 게시물 상세보기
router.get("/proof-shot/:board-index", controller.detailBoard);
// 글작성 완료시
router.post(
  "/proof-shot/write",
  body("title").isLength({ min: 2, max: 50 }).isString(),
  body("content").isLength({ min: 2, max: 5000 }).isString(),
  body("tags").isArray({ max: 5 }).isString(),
  body("tags.*").isLength({ min: 2, max: 8 }).isString().trim(),
  check.is_validate,
  controller.writePost,
);
// 게시물 수정
router.patch(
  "/proof-shot/write",
  body("title").isLength({ min: 2, max: 50 }).isString(),
  body("content").isLength({ min: 2, max: 5000 }).isString(),
  body("tags").isArray({ max: 5 }).isString(),
  body("tags.*").isLength({ min: 2, max: 8 }).isString().trim(),
  check.is_validate,
  controller.revisePost,
);
// 게시물 삭제
router.delete("/proof-shot/:board-index", controller.deletePost);
// 댓글 작성
router.post("/proof-shot/:board-index", body("comments").isLength({ min: 2, max: 500 }).isString(), check.is_validate, controller.writeComment);
// 댓글 삭제
router.delete("/proof-shot/:board-index", controller.deleteComment);
// 좋아요 기능
router.patch("/proof-shot/:board-index", controller.likePost);

// TODO
// 검색관련 기능

// 모듈화
module.exports = router;

// 게시판 라우터
const express = require("express");
const router = express.Router();
const controller_board = require("../controller/board");
const controller_comment = require("../controller/comment");

// 유효성 검사를 위한 모듈
const { body } = require("express-validator");
const check = require("../a_mymodule/validation");

// 전체 게시물 목록보기
router.get("/board/:category", controller_board.entireBoard);
// 각 게시물 상세보기
router.get("/board/:category/:boardIndex", controller_board.detailBoard);
// 글작성 완료시
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
  controller_board.writePost,
);
// 글 작성창 (최초작성, 기존 댓글 수정 기능 여기에 다 있음)
router.get("/write", controller_board.getWrite);
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
  controller_board.revisePost,
);
// 게시물 삭제
router.delete("/board/delete", controller_board.deletePost);
// 댓글 작성
router.post(
  "/comment/:boardIndex",
  body("content").isLength({ min: 2, max: 500 }).isString(),
  check.is_validate,
  controller_comment.writeComment,
);
// 기존 댓글 정보 불러오기
router.get("/comment/:boardIndex", controller_comment.getComment);
// 댓글 수정요청
router.patch(
  "/comment/:boardIndex",
  body("content").isLength({ min: 2, max: 500 }).isString(),
  check.is_validate,
  controller_comment.reviseComment,
);
// 댓글 삭제
router.delete("/comment/delete/:boardIndex", controller_comment.deleteComment);
// 좋아요 기능
router.patch("/board/:boardIndex", controller_board.likePost);
// 검색관련 기능
router.post("/search/:category", controller_board.searchPost);
// 모듈화
module.exports = router;

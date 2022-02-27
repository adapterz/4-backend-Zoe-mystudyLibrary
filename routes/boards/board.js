// 게시판 라우터
const express = require("express");
const router = express.Router();
const controller = require("./controller_board");

// 자유게시판
// 전체 게시물 목록보기
router.get("/free-board", controller.entireBoard);
// 각 게시물 상세보기
router.get("/free-board/:board-index", controller.detailBoard);
// 글작성 완료시
router.post("/free-board/write", controller.writePost);
// 게시물 수정
router.patch("/free-board/write", controller.revisePost);
// 게시물 삭제
router.delete("/free-board/:board-index", controller.deletePost);
// 댓글 작성
router.post("/free-board/:board-index/:comment-index", controller.writeComment);
// 댓글 삭제
router.delete(
  "/free-board/:board-index/:comment-index",
  controller.deleteComment
);

// 공부인증샷
// 자유게시판
// 전체 게시물 목록보기
router.get("/proof-shot", controller.entireBoard);
// 각 게시물 상세보기
router.get("/proof-shot/:board-index", controller.detailBoard);
// 글작성 완료시
router.post("/proof-shot/write", controller.writePost);
// 게시물 수정
router.patch("/proof-shot/write", controller.revisePost);
// 게시물 삭제
router.delete("/proof-shot/:board-index", controller.deletePost);
// 댓글 작성
router.post("/proof-shot/:board-index/:comment-index", controller.writeComment);
// 댓글 삭제
router.delete("/proof_shot/:id/comments", controller.deleteComment);
// 모듈화
module.exports = router;

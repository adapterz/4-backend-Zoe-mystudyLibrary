// 공부인증샷 라우터
const express = require("express");
const router = express.Router();
const controller = require("./controller_study_proof_shot");

// 요청 별 정의
router.get("/", controller.get_study_proof_shot);
// 각 게시물 상세보기
router.get("/:id", controller.get_detail_elements_of_board);
// 글작성 페이지
router.get("/write", controller.get_write_page);
// 글작성 완료시
router.post("/write", controller.write_posting);
// 게시글 수정창 열기
router.get("/revise/:id", controller.get_revise);
// 게시물 수정
router.patch("/revise/:id", controller.revise_posting);
// 게시물 삭제
router.delete("/revise/:id", controller.delete_posting);
// 댓글창 불러오기
router.get("/:id/:comments", controller.get_comment);
// 댓글 작성
router.post("/:id/:comments", controller.post_comment);
// 댓글 삭제
router.delete("/:id/comments", controller.delete_comment);

// 모듈화
module.exports = router;

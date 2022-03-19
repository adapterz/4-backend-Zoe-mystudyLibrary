// 로그인창 라우터
const express = require("express");
const router = express.Router();
const controller = require("../controller/my");

// 요청 별 정의

// 내가 관심도서관으로 등록한 도서관 정보
router.get("/my-lib", controller.myLib);
// 내가 쓴 글 목록 가져오기
router.get("/post", controller.myPost);
// 내가 쓴 댓글 목록 가져오기
router.get("/comment", controller.myComment);
// 도서관 후기 목록 가져오기
router.get("/review", controller.myReview);

// 특정 도서관 관심도서관에서 삭제
router.delete("/my-lib", controller.deleteMyLib);
// 목록 중 선택 글 삭제
router.delete("/post", controller.deletePost);
// 목록 중 선택 댓글 삭제
router.delete("/comment", controller.deleteComment);
// 목록 중 도서관 후기 삭제
router.delete("/review", controller.deleteReview);

// 모듈화
module.exports = router;

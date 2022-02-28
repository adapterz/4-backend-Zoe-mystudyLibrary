// 로그인창 라우터
const express = require("express");
const router = express.Router();
const controller = require("../controller/controller_mypost");

// 요청 별 정의
// 내가 쓴 글 데이터 가져오기
router.get("/post", controller.myPost);
// 내가 쓴 댓글 데이터 가져오기
router.get("/comments", controller.myComment);
// 도서관 후기 데이터 가져오기
router.get("/lib-epilogue", controller.myEpilogue);

// 선택글 삭제
router.delete("/post", controller.deletePost);
// 선택댓글 삭제
router.delete("/comments", controller.deleteComment);
// 도서관 후기 삭제
router.delete("/lib-epilogue", controller.deleteEpilogue);

// 모듈화
module.exports = router;

// 로그인창 라우터
const express = require("express");
const router = express.Router();
const controller = require("./controller_mypost");

// 요청 별 정의
// 내가 쓴 글 데이터 가져오기
router.get("/post", controller.myPost);
// 내가 쓴 댓글 데이터 가져오기
router.get("/comments", controller.myComment);
// 내가 쓴 후기 데이터 가져오기
router.get("/epilogue", controller.myEpilogue);

// 선택글 삭제
router.delete("/post", controller.deletePost);
// 선택댓글 삭제
router.delete("/comments", controller.deleteComment);
// 해당후기 삭제
router.delete("/epilogue", controller.deleteEpilogue);

// 모듈화
module.exports = router;

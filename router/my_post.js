// 로그인창 라우터
const express = require("express");
const router = express.Router();
const controller = require("../controller/controller_mypost");
const controller2 = require("../controller/controller_mypost_delete");

// 요청 별 정의
// 내가 쓴 글 데이터 가져오기
router.get("/post", controller.myPost);
// 내가 쓴 댓글 데이터 가져오기
router.get("/comments", controller.myComment);
// 도서관 후기 데이터 가져오기
router.get("/lib-epilogue", controller.myEpilogue);

// 선택 글 삭제
router.delete("/post", controller2.deletePost);
// 선택 댓글 삭제
router.delete("/comments", controller2.deleteComment);
// 도서관 후기 삭제
router.delete("/lib-epilogue", controller2.deleteEpilogue);

// 모듈화
module.exports = router;

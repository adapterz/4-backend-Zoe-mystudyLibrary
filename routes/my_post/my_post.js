// 로그인창 라우터
const express = require("express");
const router = express.Router();
const controller = require("./controller_mypost");

// 요청 별 정의
// 내가 작성한 글
router.get("/post", controller.my_post);
// 선택글 삭제
router.delete("/post", controller.delete_my_post);
// 내가 작성한 댓글
router.get("/comments", controller.my_comment);
// 선택댓글 삭제
router.delete("/comments", controller.delete_my_post);
// 내가 작성한 후기
router.get("/epilogue", controller.my_epilogue);
// 해당후기 삭제
router.delete("/epilogue", controller.delete_my_epilogue);

// 모듈화
module.exports = router;

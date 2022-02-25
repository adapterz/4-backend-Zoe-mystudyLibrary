// 로그인 후 내 정보창 눌렀을 때 탭 라우터
const express = require("express");
const router = express.Router();
const controller = require("./controller_user");
// 요청 별 정의
// 내정보 기본화면
router.get("/", controller.get_user);
// 비밀번호변경창
router.get("/new_pw", controller.get_revise_pw);
// 비밀번호변경요청
router.patch("new_pw", controller.patch_revise_pw);
// 모듈화
module.exports = router;

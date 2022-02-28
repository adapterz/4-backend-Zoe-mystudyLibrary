// 로그인 후 내 정보창 눌렀을 때 탭 라우터
const express = require("express");
const router = express.Router();
const controller = require("../controller/controller_user");
// 요청 별 정의
// 내프로필 변경
router.patch("/profile", controller.reviseProfile);
// 연락처변경 요청
router.patch("/user-data", controller.revisePhoneNumber);
// 비밀번호변경 요청
router.patch("/new-pw", controller.revisePw);
// 회원탈퇴 요청
router.delete("/drop-out", controller.dropOut);
// 모듈화
module.exports = router;

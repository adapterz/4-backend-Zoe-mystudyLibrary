// 로그인 후 내 정보창 눌렀을 때 탭 라우터
const express = require("express");
const router = express.Router();

router.get("/", function (req, res) {
  res.send("내정보창이에요");
  console.log("/user");
});
module.exports = router;

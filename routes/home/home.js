// 자유게시판 눌렀을 때 라우터
const express = require("express");
const router = express.Router();

router.get("/", function (req, res) {
  res.send("홈화면");
  console.log("home");
});
module.exports = router;

// 자유게시판 눌렀을 때 라우터
const express = require("express");
const router = express.Router();

router.get("/free_bulletin_board", function (req, res) {
  res.get("자유게시판");
});

module.exports = router;

// 내주변 도서관 눌렀을 때 라우터
const express = require("express");
const router = express.Router();

router.get("/adj_lib", function (req, res) {
  res.get("내주변도서관탭이에요");
});

module.exports = router;

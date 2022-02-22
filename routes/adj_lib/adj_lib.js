// 내주변 도서관 눌렀을 때 라우터
const express = require("express");
const router = express.Router();

router.get("/", function (req, res) {
  res.send("내주변도서관탭이에요");


  console.log("/adj_lib");
});

module.exports = router;

// 로그인 라우터
const express = require("express");
const router = express.Router();

router.get("/", function (req, res) {
  res.send("로그인 창");


  console.log("/login");
});
module.exports = router;

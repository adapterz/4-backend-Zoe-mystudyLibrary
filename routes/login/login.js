// 로그인 라우터
const express = require("express");
const router = express.Router();

router.get("/login", function (req, res) {
  res.get("로그인 창");
});
module.exports = router;

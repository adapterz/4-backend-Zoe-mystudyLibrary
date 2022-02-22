// 회원가입
const express = require("express");
const router = express.Router();

router.get("/new_user", function (req, res) {
  res.get("회원가입");
});
module.exports = router;

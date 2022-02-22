// 회원가입
const express = require("express");
const router = express.Router();

router.get("/", function (req, res) {
  res.send("회원가입");


  console.log("/new_user");
});
module.exports = router;

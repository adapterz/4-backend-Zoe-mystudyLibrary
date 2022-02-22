// 공부인증샷 라우터
const express = require("express");
const router = express.Router();

router.get("/", function (req, res) {
  res.send("공부인증샷");

  console.log("/study_proof_shoot");
});
module.exports = router;

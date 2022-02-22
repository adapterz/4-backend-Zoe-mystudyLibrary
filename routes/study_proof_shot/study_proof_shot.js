// 공부인증샷 라우터
const express = require("express");
const router = express.Router();

router.get("/study_proof_shot", function (req, res) {
  res.get("공부인증샷");
});
module.exports = router;

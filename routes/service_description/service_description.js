// 서비스 설명 라우터
const express = require("express");
const router = express.Router();

router.get("/service_description", function (req, res) {
  res.get("서비스설명");
});
module.exports = router;

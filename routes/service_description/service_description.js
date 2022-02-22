// 서비스 설명 라우터
const express = require("express");
const router = express.Router();

router.get("/", function (req, res) {
  res.send("서비스설명");

  console.log("/service_description");
});
module.exports = router;

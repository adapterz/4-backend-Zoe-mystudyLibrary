// 유효성 체크 메서드
const { validationResult } = require("express-validator");

const is_validate = function (req, res, next) {
  const errors = validationResult(req);
  // 유효하지 않음
  console.log(errors);
  if (!errors.isEmpty()) return res.status(400).json({ state: "유효하지 않은 데이터 입니다." });

  next();
};

module.exports = { is_validate: is_validate };

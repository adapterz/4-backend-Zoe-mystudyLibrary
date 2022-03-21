// 유효성 체크 메서드
const { query, validationResult } = require("express-validator");

// body 유효하지 않을 때
const isValidate = function (req, res, next) {
  const errors = validationResult(req);
  // 유효하지 않음
  console.log(errors);
  if (!errors.isEmpty()) return res.status(400).json({ state: "유효하지 않은 데이터 입니다." });

  next();
};
// req.params, req.query가 유효하지 않을 때
const isExist = function (req, res, next) {
  const errors = validationResult(req);
  // 유효하지 않음
  console.log(errors);
  if (!errors.isEmpty()) return res.status(404).json({ state: "존재하지 않는 정보입니다." });

  next();
};

// params.category가 게시판 카테고리가 아닐때
const isCategory = function (req, res, next) {
  // 유효하지 않은 게시판 카테고리
  if (!(req.params.category === "free-bulletin" || req.params.category === "proof-shot"))
    return res.status(404).json({ state: "존재하지않는카테고리" });

  next();
};
// 글작성시
// body.category가 게시판 카테고리가 아닐때
const isCategoryWhenWrite = function (req, res, next) {
  // 유효하지 않은 게시판 카테고리
  if (!(req.body.category === "자유게시판" || req.params.category === "공부인증샷"))
    return res.status(400).json({ state: "존재하지않는카테고리" });

  next();
};
// 검색기능 옵션이 올바르지 않을 때
const isSearchOption = function (req, res, next) {
  // 검색 옵션이 올바르지 않을 때
  if (
    !(
      req.query.searchOption === "제목만" ||
      req.query.searchOption === "내용만" ||
      req.query.searchOption === "제목 + 내용" ||
      req.query.searchOption === "닉네임"
    )
  )
    return res.status(400).json({ state: "유효하지않은검색옵션" });
  next();
};
// 페이지 유효성 체크
const checkPageValidation = function (req, res, next) {
  if (req.query.page !== undefined) query("page").isInt();
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(404).json({ state: "존재하지 않는 정보입니다." });
  next();
};

module.exports = {
  isValidate: isValidate,
  isExist: isExist,
  isCategory: isCategory,
  isCategoryWhenWrite: isCategoryWhenWrite,
  isSearchOption: isSearchOption,
  checkPageValidation: checkPageValidation,
};

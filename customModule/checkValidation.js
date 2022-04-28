// 유효성 체크 메서드
// 외장 모듈
import { query, validationResult } from "express-validator";

// body 유효하지 않을 때
export function isValidate(req, res, next) {
  const errors = validationResult(req);
  // 유효하지 않음
  console.log(errors);
  if (!errors.isEmpty()) return res.status(400).json({ state: "invalid_body" });

  next();
}
// req.params, req.query가 유효하지 않을 때
export function isExist(req, res, next) {
  const errors = validationResult(req);
  // 유효하지 않음
  console.log(errors);
  if (!errors.isEmpty()) return res.status(400).json({ state: "invalid_params_or_query" });

  next();
}

// params.category가 게시판 카테고리가 아닐때
export function isCategory(req, res, next) {
  // 유효하지 않은 게시판 카테고리
  if (!(req.params.category === "free-bulletin" || req.params.category === "proof-shot"))
    return res.status(404).json({ state: "non_existent_category" });

  next();
}
// 글작성시
// body.category가 게시판 카테고리가 아닐때
export function isCategoryWhenWrite(req, res, next) {
  // 유효하지 않은 게시판 카테고리
  if (!(req.body.category === "자유게시판" || req.body.category === "공부인증샷"))
    return res.status(400).json({ state: "invalid_category" });

  next();
}
// 검색기능 옵션이 올바르지 않을 때
export function isSearchOption(req, res, next) {
  // 검색 옵션이 올바르지 않을 때
  if (
    !(req.query.searchOption === "제목만" || req.query.searchOption === "내용만" || req.query.searchOption === "닉네임")
  )
    return res.status(400).json({ state: "invalid_search_option" });
  next();
}
// req.query.page가 있을 때 유효성 체크
export function checkPageValidation(req, res, next) {
  if (req.query.page !== undefined) query("page").isInt();
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(404).json({ state: "non_existent_information" });
  next();
}
// 대댓글 달 때 req.query.parentIndex 유효성 체크
export function checkCommentValidation(req, res, next) {
  if (req.query.parentIndex !== undefined) query("parentIndex").isInt();
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(404).json({ state: "non_existent_information" });
  next();
}

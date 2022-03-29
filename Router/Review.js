// 도서관 후기 라우터
// 외장모듈
import express from "express";
const { body, query } = require("express-validator");

// 내장모듈
import { isExist, isValidate } from "../CustomModule/CheckValidation";
import { deleteReview, editReview, getReview, registerReview } from "../Controller/Review";

// 라우터 변수
const router = express.Router();

/*
 * 1. 도서관 후기 등록
 * 2. 수정시 기존 후기 정보 불러오기
 * 3. 후기 수정 요청
 * 4. 후기 삭제 요청
 */

// 후기 등록
router.post(
  "/post",
  query("libraryIndex").isInt(),
  isExist,
  body("reviewContent").isLength({ min: 2, max: 100 }).isString(),
  body("grade").isFloat({ min: 1, max: 5 }),
  isValidate,
  registerReview,
);
// 수정 시 기존 후기 정보 불러오기
router.get("/", query("libraryIndex").isInt(), query("reviewIndex").isInt(), isExist, getReview);
// 후기 수정 요청
router.patch(
  "/patch",
  query("libraryIndex").isInt(),
  query("reviewIndex").isInt(),
  isExist,
  body("reviewContent").isLength({ min: 2, max: 100 }).isString(),
  body("grade").isInt({ min: 1, max: 5 }),
  isValidate,
  editReview,
);
// 후기 삭제
router.delete("/delete", query("libraryIndex").isInt().isLength({ min: 1, max: 4 }), query("reviewIndex").isInt(), isExist, deleteReview);

// 모듈화
export default router;

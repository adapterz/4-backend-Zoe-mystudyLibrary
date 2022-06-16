// 도서관 후기 라우터
// 외장모듈
import express from "express";
import { body, query, param } from "express-validator";

// 내장모듈
import { checkPageValidation, isExist, isValidate } from "../customModule/checkValidation.js";
import {
  deleteReviewController,
  detailReviewController,
  editReviewController,
  getReviewController,
  registerReviewController,
  userReviewController,
} from "../controllers/review.js";
// 라우터 변수
const router = express.Router();

/*
 * 1. 도서관 후기 등록
 * 2. 도서관의 후기 정보
 * 3. 수정시 기존 후기 정보 불러오기
 * 4. 후기 수정 요청
 * 5. 후기 삭제 요청
 */

// 유저가 작성한 도서관 후기 목록 가져오기
router.get("/user", checkPageValidation, userReviewController);
// 후기 등록
router.post(
  "/",
  query("libraryIndex").isInt(),
  isExist,
  body("reviewContent").isLength({ min: 2, max: 100 }).isString(),
  body("grade").isFloat({ min: 1, max: 5 }),
  isValidate,
  registerReviewController
);
// 도서관 후기 상세 조회
router.get("/", query("libraryIndex").isInt().trim(), isExist, checkPageValidation, detailReviewController);
// 수정 시 기존 후기 정보 불러오기
router.get("/:reviewIndex", query("libraryIndex").isInt(), param("reviewIndex").isInt(), isExist, getReviewController);
// 후기 수정 요청
router.patch(
  "/:reviewIndex",
  query("libraryIndex").isInt(),
  param("reviewIndex").isInt(),
  isExist,
  body("reviewContent").isLength({ min: 2, max: 100 }).isString(),
  body("grade").isInt({ min: 1, max: 5 }),
  isValidate,
  editReviewController
);
// 후기 삭제
router.delete(
  "/:reviewIndex",
  query("libraryIndex").isInt().isLength({ min: 1, max: 4 }),
  param("reviewIndex").isInt(),
  isExist,
  deleteReviewController
);

// 모듈화
export default router;

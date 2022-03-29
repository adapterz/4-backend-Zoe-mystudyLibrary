// 댓글 라우터
// 외장모듈
import express from "express";
import { body, query } from "express-validator";

// 내장모듈
import { isExist, isValidate } from "../CustomModule/CheckValidation";
import { deleteCommentController, editCommentController, getCommentController, writeCommentController } from "../Controller/Comment";

/*
 * 1. 댓글 작성
 * 2. 수정시 기존댓글 불러오는 모듈
 * 3. 댓글 수정
 * 4. 댓글 삭제
 */

// 라우터 변수
const router = express.Router();

// 댓글 작성
router.post(
  "/post",
  query("boardIndex").isInt().trim(),
  isExist,
  body("content").isLength({ min: 2, max: 500 }).isString(),
  isValidate,
  writeCommentController,
);
// 기존 댓글 정보 불러오기
router.get("/", query("boardIndex").isInt().trim(), query("commentIndex").isInt().trim(), isExist, getCommentController);
// 댓글 수정 요청
router.patch(
  "/patch",
  query("boardIndex").isInt().trim(),
  query("commentIndex").isInt().trim(),
  isExist,
  body("content").isLength({ min: 2, max: 500 }).isString(),
  isValidate,
  editCommentController,
);
// 댓글 삭제
router.delete("/delete", query("boardIndex").isInt().trim(), query("commentIndex").isInt().trim(), isExist, deleteCommentController);

// 모듈화
export default router;

// 댓글 라우터
// 외장모듈
import express from "express";
import { body, query } from "express-validator";

// 내장모듈
import { checkCommentValidation, checkPageValidation, isExist, isValidate } from "../customModule/checkValidation.js";
import {
  deleteCommentController,
  detailCommentController,
  editCommentController,
  getCommentController,
  writeCommentController,
  userCommentController,
} from "../controllers/comment.js";

/*
 * 1. 댓글 작성
 * 2. 게시글의 댓글정보
 * 3. 수정시 기존댓글 불러오는 모듈
 * 4. 댓글 수정
 * 5. 댓글 삭제
 * 6. 유저가 작성한 댓글 조회
 */
// 라우터 변수
const router = express.Router();

// 댓글 작성
router.post(
  "/post",
  query("boardIndex").isInt().trim(),
  isExist,
  checkCommentValidation,
  body("content").isLength({ min: 2, max: 500 }).isString(),
  isValidate,
  writeCommentController
);
// 게시글에서 댓글 상세 조회
router.get("/", query("boardIndex").isInt().trim(), isExist, checkPageValidation, detailCommentController);
// 기존 댓글 정보 불러오기
router.get(
  "/edit",
  query("boardIndex").isInt().trim(),
  query("commentIndex").isInt().trim(),
  isExist,
  getCommentController
);
// 댓글 수정 요청
router.patch(
  "/edit",
  query("boardIndex").isInt().trim(),
  query("commentIndex").isInt().trim(),
  isExist,
  body("content").isLength({ min: 2, max: 500 }).isString(),
  isValidate,
  editCommentController
);
// 댓글 삭제
router.delete(
  "/delete",
  query("boardIndex").isInt().trim(),
  query("commentIndex").isInt().trim(),
  isExist,
  deleteCommentController
);
// 유저가 작성한 댓글 목록 조회
router.get("/user", checkPageValidation, userCommentController);

// 모듈화
export default router;

// 게시판 라우터
// 외장모듈
import express from "express";
import { body, query, param } from "express-validator";

// 내장모듈
import {
  editBoardController,
  deleteBoardController,
  detailBoardController,
  entireBoardController,
  favoriteBoardController,
  getRecentBoardController,
  searchBoardController,
  writeBoardController,
  getWriteController,
  userBoardController,
} from "../controllers/board.js";
import {
  checkPageValidation,
  isCategory,
  isCategoryWhenWrite,
  isExist,
  isSearchOption,
  isValidate,
} from "../customModule/checkValidation.js";

// 라우터 변수
const router = express.Router();

/*
 * 1. 유저가 작성한 글 목록 조회
 * 2. 좋아요/검색 기능
 * 3. 게시글 조회
 * 4. 게시글 작성/수정/삭제
 */

// 유효성 검사를 위한 모듈

// 1. 유저가 쓴 글 목록 가져오기
router.get("/user", checkPageValidation, userBoardController);
// 2. 좋아요/검색기능
// 2-1. 좋아요 기능
router.patch("/:boardIndex/favorite-count", param("boardIndex").isInt(), isExist, favoriteBoardController);
// 2-2. 검색관련 기능
router.get(
  "/:category/result",
  isCategory,
  isSearchOption,
  query("searchContent").isLength({ min: 1 }).isString(),
  isValidate,
  checkPageValidation,
  searchBoardController
);
// 3. 게시글 조회
// 3-1. 최신글 자유게시판 5개, 공부인증샷 4개 정보
router.get("/recent-post", isExist, getRecentBoardController);
// 3-2. 전체 게시물 목록보기
router.get("/:category", isCategory, checkPageValidation, entireBoardController);
// 3-3. 각 게시물 상세보기
router.get("/:category/:boardIndex", param("boardIndex").isInt(), isCategory, isExist, detailBoardController);
// 4. 게시글 작성/수정/삭제
// 4-1. 최초 게시글 작성 요청
router.post(
  "/",
  body("postTitle").isLength({ min: 2, max: 50 }).isString(),
  body("postContent").isLength({ min: 2, max: 5000 }).isString(),
  body("tags").isArray({ max: 5 }),
  body("tags.*.content")
    .isLength({ min: 2, max: 8 })
    .trim()
    .isString()
    .matches(/^[가-힣]+$/),
  isValidate,
  isCategoryWhenWrite,
  writeBoardController
);
// 4-2. 수정시 기존 게시글 정보 가져오기
router.get("/", query("boardIndex").isInt(), isExist, getWriteController);
// 4-3. 게시글 수정 요청
router.patch(
  "/:boardIndex",
  param("boardIndex").isInt(),
  isExist,
  body("postTitle").isLength({ min: 2, max: 50 }).isString(),
  body("postContent").isLength({ min: 2, max: 5000 }).isString(),
  body("tags").isArray({ max: 5 }),
  body("tags.*.content")
    .isLength({ min: 2, max: 8 })
    .trim()
    .isString()
    .matches(/^[가-힣]+$/),
  isValidate,
  isCategoryWhenWrite,
  editBoardController
);
// 4-4. 게시물 삭제 요청
router.delete("/:boardIndex", param("boardIndex").isInt(), isExist, deleteBoardController);

// 모듈화
export default router;

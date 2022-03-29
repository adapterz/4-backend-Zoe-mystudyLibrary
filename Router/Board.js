// 게시판 라우터
// 외장모듈
import express from "express";
const { body, query, param } = require("express-validator");

// 내장모듈
import {
  editBoard,
  deleteBoard,
  detailBoard,
  entireBoard,
  favoriteBoard,
  getRecentBoard,
  searchBoard,
  writeBoard,
  getWrite,
} from "../Controller/Board";
import { checkPageValidation, isCategory, isCategoryWhenWrite, isExist, isSearchOption, isValidate } from "../CustomModule/CheckValidation";

// 라우터 변수
const router = express.Router();

/*
 * 1. 게시글 조회
 * 2. 게시글 작성/수정/삭제
 * 3. 좋아요/검색 기능
 */

// 유효성 검사를 위한 모듈
// 1. 게시글 조회
// 1-1. 최신글 자유게시판 5개, 공부인증샷 4개 정보
router.get("/board", isExist, getRecentBoard);
// 1-2. 전체 게시물 목록보기
router.get("/board/:category", isCategory, checkPageValidation, entireBoard);
// 1-3. 각 게시물 상세보기
router.get("/board/:category/:boardIndex", param("boardIndex").isInt(), isCategory, isExist, checkPageValidation, detailBoard);
// 2. 게시글 작성/수정/삭제
// 2-1. 최초 게시글 작성 요청
router.post(
  "/write",
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
  writeBoard,
);
// 2-2. 수정시 기존 게시글 정보 가져오기
router.get("/write", query("boardIndex").isInt(), isExist, getWrite);
// 2-3. 게시글 수정 요청
router.patch(
  "/write",
  query("boardIndex").isInt(),
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
  editBoard,
);
// 2-4. 게시물 삭제 요청
router.delete("/delete", query("boardIndex").isInt(), isExist, deleteBoard);
// 3. 좋아요/검색기능
// 3-1. 좋아요 기능
router.patch("/like", query("boardIndex").isInt(), isExist, favoriteBoard);
// 3-2. 검색관련 기능
router.get(
  "/search/:category",
  isCategory,
  isSearchOption,
  query("searchContent").isString(),
  isValidate,
  checkPageValidation,
  searchBoard,
);

// 모듈화
export default router;

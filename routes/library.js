// 도서관 라우터
// 외장모듈
import express from "express";
import { query, param } from "express-validator";

// 내장모듈
import { isExist, isValidate } from "../customModule/checkValidation.js";
import { allLibraryController, detailLibraryController, localLibraryController } from "../controllers/library.js";

// 라우터 변수
const router = express.Router();

/*
 * 1. 전체도서관 정보
 * 2. 입력한 지역의 도서관 정보
 * 3. 특정 인덱스의 도서관 정보
 */

// 전체도서관 정보
router.get("/", allLibraryController);
// 내 지역의 도서관 정보(시도명, 시군구명 body 로 보내기)
router.get(
  "/search",
  query("nameOfCity")
    .isString()
    .trim()
    .isLength({ min: 1, max: 8 })
    .matches(/^[가-힣]+$/), // 한글만
  query("districts")
    .isString()
    .trim()
    .isLength({ min: 1, max: 15 })
    .matches(/^[가-힣]+$/),
  isValidate,
  localLibraryController
);

// 특정 도서관 자세히 보기
router.get("/librarys/:libraryIndex", param("libraryIndex").isInt(), isExist, detailLibraryController);

// 모듈화
export default router;

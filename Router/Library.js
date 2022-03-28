// 도서관 라우터
// 외장모듈
import express from "express";
const { query, param } = require("express-validator");

// 내장모듈
import { isExist, isValidate } from "../CustomModule/CheckValidation";
import { allLibrary, detailLibrary, localLibrary } from "../Controller/Library";

// 라우터 변수
const router = express.Router();

// 전체도서관 정보
router.get("/", allLibrary);
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
  localLibrary,
);
// 특정 도서관 자세히 보기
router.get("/detail/:libraryIndex", param("libraryIndex").isInt(), isExist, detailLibrary);

// 모듈화
export default router;

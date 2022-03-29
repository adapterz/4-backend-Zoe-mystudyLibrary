// 유저 라우터
// 외장모듈
import express from "express";
const { body, query } = require("express-validator");

// 내장모듈
import { checkPageValidation, isExist, isValidate } from "../CustomModule/CheckValidation";
import {
  deleteUserLibraryController,
  dropOutController,
  editPhoneNumberController,
  editProfileController,
  editPwController,
  loginController,
  logoutController,
  registerUserLibraryController,
  signUpController,
  signUpGuideController,
  signUpGuideConfirm,
  userBoardController,
  userCommentController,
  userLibraryController,
  userReviewController,
} from "../Controller/User";

// 라우터 변수
const router = express.Router();
/*
 * 1. 회원가입/탈퇴
 * 2. 로그인/(로그아웃 - 모델x)
 * 3. 관심도서관 조회/등록/탈퇴
 * 4. 유저가 작성한 글/댓글/후기 조회
 * 5. 유저 정보 수정
 */
// 1. 회원가입/탈퇴
// 회원가입 약관확인
router.get("/sign-up/guide", signUpGuideController);

// 회원가입 약관확인
router.post("/sign-up/guide", body("checkBox").isBoolean(), isValidate, signUpGuideConfirm);

// 회원가입 요청
router.post(
  "/sign-up",
  body("id")
    .isString()
    .trim()
    .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{5,20}$/), // 5 ~ 20글자 사이의 하나 이상의 문자와 하나의 숫자 정규식
  body("pw")
    .isString()
    .trim()
    .matches(/^(?=.*[a-zA-z])(?=.*[0-9])(?=.*[$`~!@$!%*#^?&\\(\\)\-_=+]).{8,16}$/), // 8~16자리 하나 이상의 문자,숫자,특수문자가 포함되도록 하는 정규식
  body("name")
    .isString()
    .trim()
    .isLength({ min: 1, max: 30 })
    .matches(/^[가-힣]+$/), // 한글만
  body("phoneNumber").matches(/^01([0|1|6|7|8|9])?([0-9]{3,4})?([0-9]{4})$/), // 휴대전화 정규식
  body("nickName")
    .isString()
    .trim()
    .isLength({ min: 2, max: 8 })
    .matches(/^[가-힣|a-z|A-Z|0-9]+$/), // 한글, 숫자, 영어만 입력 가능한 정규 표현식
  body("gender")
    .isString()
    .trim()
    .isLength({ min: 1, max: 1 })
    .matches(/^[여|남]+$/), // 여,남만 입력 가능한 정규표현식
  isValidate,
  signUpController,
);

// 회원탈퇴 요청
router.delete("/drop-out", body("checkBox").isBoolean(), isValidate, dropOutController);

// 2. 로그인/로그아웃
// 로그인 요청
router.post("/login", body("id").isString().trim(), body("pw").isString().trim(), isValidate, loginController);
// 로그아웃 요청
router.post("/logout", logoutController);

// 3. 관심도서관 조회/등록/삭제
// 관심도서관 조회
router.get("/user-lib", userLibraryController);
// 관심도서관 등록
router.patch("/user-lib", query("libraryIndex").isInt().isLength({ min: 1, max: 4 }), isExist, registerUserLibraryController);
// 관심도서관 삭제
router.delete("/user-lib", query("libraryIndex").isInt().isLength({ min: 1, max: 4 }), isExist, deleteUserLibraryController);

// 4. 유저가 작성한 글/댓글/후기
// 유저가 쓴 글 목록 가져오기
router.get("/post", checkPageValidation, userBoardController);
// 유저가 쓴 댓글 목록 가져오기
router.get("/comment", checkPageValidation, userCommentController);
// 유저가 작성한 도서관 후기 목록 가져오기
router.get("/review", checkPageValidation, userReviewController);

// 5. 유저 정보 수정
// 내프로필 변경
router.patch(
  "/profile",
  body("profileShot").isDataURI(),
  body("nickName")
    .isString()
    .trim()
    .isLength({ min: 2, max: 8 })
    .matches(/^[가-힣|a-z|A-Z|0-9]+$/), // 한글, 숫자, 영어만 입력 가능한 정규 표현식
  isValidate,
  editProfileController,
);
// 연락처변경 요청
router.patch(
  "/new-contact",
  body("phoneNumber")
    .matches(/^01([0|1|6|7|8|9])([0-9]{3,4})([0-9]{4})$/) // 휴대전화 정규식
    .notEmpty(),
  isValidate,
  editPhoneNumberController,
);
// 비밀번호변경 요청
router.patch(
  "/new-pw",
  body("newPw")
    .isString()
    .trim()
    .matches(/^(?=.*[a-zA-z])(?=.*[0-9])(?=.*[$`~!@$!%*#^?&\\(\\)\-_=+]).{8,16}$/), // 하나 이상의 문자(영문),숫자,특수문자가 포함되도록 하는 정규식(8~16)
  isValidate,
  editPwController,
);

// 모듈화
export default router;

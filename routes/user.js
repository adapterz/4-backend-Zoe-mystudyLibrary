// 유저 라우터
// 외장모듈
import express from "express";
import { body, query } from "express-validator";

// 내장모듈
import { isExist, isValidate } from "../customModule/checkValidation.js";
import {
  deleteUserLibraryController,
  dropOutController,
  editPhoneNumberController,
  editProfileNicknameController,
  editPwController,
  loginController,
  logoutController,
  registerUserLibraryController,
  signUpController,
  signUpGuideController,
  userLibraryController,
  editProfileImageController,
  getUserController,
} from "../controllers/user.js";
import { uploadImage, checkLoginToken } from "../customModule/uploadImage.js";

// 라우터 변수
const router = express.Router();
/*
 * 1. 회원가입/탈퇴
 * 2. 로그인/(로그아웃 - 모델x)
 * 3. 관심도서관 조회/등록/탈퇴
 * 4. 유저 정보 수정
 * 5. 유저 정보 조회
 */
// 1. 회원가입/탈퇴
// 회원가입 약관확인
router.get("/guide", signUpGuideController);

// 회원가입 요청
router.post(
  "/",
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
  body("nickname")
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
  signUpController
);

// 회원탈퇴 요청
router.delete("/", dropOutController);

// 2. 로그인/로그아웃
// 로그인 요청
router.post("/token", body("id").isString().trim(), body("pw").isString().trim(), isValidate, loginController);
// 로그아웃 요청
router.delete("/token", logoutController);

// 3. 관심도서관 조회/등록/삭제
// 관심도서관 조회
router.get("/library", userLibraryController);
// 관심도서관 등록
router.patch(
  "/library",
  query("libraryIndex").isInt().isLength({ min: 1, max: 4 }),
  isExist,
  registerUserLibraryController
);
// 관심도서관 삭제
router.delete(
  "/library",
  query("libraryIndex").isInt().isLength({ min: 1, max: 4 }),
  isExist,
  deleteUserLibraryController
);
// 4. 유저 정보 수정
// 내 닉네임 변경
router.patch(
  "/info/nickname",
  body("nickname")
    .isString()
    .trim()
    .isLength({ min: 2, max: 8 })
    .matches(/^[가-힣|a-z|A-Z|0-9]+$/), // 한글, 숫자, 영어만 입력 가능한 정규 표현식
  isValidate,
  editProfileNicknameController
);
// 프로필 이미지 변경
router.patch("/info/profile-image", checkLoginToken, uploadImage, editProfileImageController);
// 연락처변경 요청
router.patch(
  "/info/contact",
  body("phoneNumber")
    .matches(/^01([0|1|6|7|8|9])([0-9]{3,4})([0-9]{4})$/) // 휴대전화 정규식
    .notEmpty(),
  isValidate,
  editPhoneNumberController
);
// 비밀번호변경 요청
router.patch(
  "/info/pw",
  body("newPw")
    .isString()
    .trim()
    .matches(/^(?=.*[a-zA-z])(?=.*[0-9])(?=.*[$`~!@$!%*#^?&\\(\\)\-_=+]).{8,16}$/), // 하나 이상의 문자(영문),숫자,특수문자가 포함되도록 하는 정규식(8~16)
  isValidate,
  editPwController
);
// 5. 유저 정보 가져오기
router.get("/info", getUserController);

// 모듈화
export default router;

// 로그인 후 내 정보창 눌렀을 때 탭 라우터
const express = require("express");
const router = express.Router();
const controller = require("../controller/user");

// 유효성 검사 모듈
const { body } = require("express-validator");
const check = require("../my_module/check_validation");

// 회원가입 약관확인
router.post(
  "/guide",
  body("checkBox1").isBoolean(),
  body("checkBox2").isBoolean(),
  body("checkBox3").isBoolean(),
  check.is_validate,
  controller.signUpGuide,
);

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
  body("phoneNumber").matches(/^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/), // 휴대전화 정규식
  body("nickName")
    .isString()
    .trim()
    .isLength({ min: 2, max: 8 })
    .matches(/^[가-힣|a-z|A-Z|0-9]+$/), // 한글, 숫자, 영어만 입력 가능한 정규 표현식
  check.is_validate,
  controller.signUp,
);

// 로그인 요청
router.post("/login", body("id").isString().trim(), body("pw").isString().trim(), check.is_validate, controller.login);
// 로그아웃 요청
router.post("/logout", controller.logout);

// 내가 관심도서관으로 등록한 도서관 정보
router.get("/my-lib", controller.myLib);

// 내 정보의 '관심 도서관'에 특정도서관 데이터 추가
router.patch("/my-lib", controller.registerMyLib);
// 특정 도서관 관심도서관에서 삭제
router.delete("/my-lib", controller.deleteMyLib);
// 내가 쓴 글 목록 가져오기
router.get("/post", controller.myPost);
// 내가 쓴 댓글 목록 가져오기
router.get("/comment", controller.myComment);
// 도서관 후기 목록 가져오기
router.get("/review", controller.myReview);

// 내프로필 변경
router.patch(
  "/profile",
  body("profileShot").isDataURI(),
  body("nickName")
    .isString()
    .trim()
    .isLength({ min: 2, max: 8 })
    .matches(/^[가-힣|a-z|A-Z|0-9]+$/), // 한글, 숫자, 영어만 입력 가능한 정규 표현식
  check.is_validate,
  controller.reviseProfile,
);
// 연락처변경 요청
router.patch(
  "/new-contact",
  body("phoneNumber")
    .matches(/^01([0|1|6|7|8|9])([0-9]{3,4})([0-9]{4})$/) // 휴대전화 정규식
    .notEmpty(),
  check.is_validate,
  controller.revisePhoneNumber,
);
// 비밀번호변경 요청
router.patch(
  "/new-pw",
  body("newPw")
    .isString()
    .trim()
    .matches(/^(?=.*[a-zA-z])(?=.*[0-9])(?=.*[$`~!@$!%*#^?&\\(\\)\-_=+]).{8,16}$/), // 하나 이상의 문자(영문),숫자,특수문자가 포함되도록 하는 정규식(8~16)
  check.is_validate,
  controller.revisePw,
);

// 회원탈퇴 요청
router.delete("/drop-out", controller.dropOut);
// 모듈화
module.exports = router;

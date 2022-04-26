// 유저 컨트롤러
// 외장모듈
import path from "path";
import jwt from "jsonwebtoken";
import { fileURLToPath } from "url";
import { dirname } from "path";

// 내장모듈
import {
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
  CREATED,
  FORBIDDEN,
  UNAUTHORIZED,
  NOT_FOUND,
  NO_CONTENT,
  CONFLICT,
  OK,
} from "../customModule/statusCode.js";
import {
  deleteUserLibraryModel,
  dropOutModel,
  editPhoneNumberModel,
  editProfileImageModel,
  editProfileNicknameModel,
  editPwModel,
  getUserModel,
  loginModel,
  registerUserLibraryModel,
  signUpModel,
  userLibraryModel,
} from "../model/user.js";
import { checkUserLibraryMethod } from "../customModule/checkDataOrAuthority.js";
/*
 * 1. 회원가입/탈퇴
 * 2. 로그인/로그아웃
 * 3. 관심도서관 조회/등록/탈퇴
 * 4. 유저 정보 수정
 * 5. 유저 정보 가져오기
 *
 * 참고: model 메서드에 인자로 보낸 요청한 유저의 ip 정보는 model 수행 로그 남기는데 이용
 */
// 1. 회원가입/탈퇴
// 1-1. 회원가입 약관 확인
export async function signUpGuideController(req, res) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  return res.status(OK).sendFile(path.join(__dirname, "..", "terms/signUpGuide.html"));
}

// 1-2. 회원가입 요청
export async function signUpController(req, res) {
  /*
   * req.body
   *   id: 아이디
   *   pw: 비밀번호
   *   confimPw: 비밀번호확인
   *   name: 이름
   *   phoneNumber: 전화번호
   *   nickname: 닉네임
   *   gender : 성별(여 or 남)
   */
  // 회원가입 요청 모델 실행 결과
  const modelResult = await signUpModel(req.body, req.ip);
  // 모델 실행결과에 따른 분기처리
  // sequelize query 메서드 실패
  if (modelResult.state === "fail_sequelize") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
  // 이미 존재하는 id라 회원가입 불가능
  else if (modelResult.state === "already_exist_id") return res.status(BAD_REQUEST).json(modelResult);
  // 이미 존재하는 닉네임이라 회원가입 불가능
  else if (modelResult.state === "already_exist_nickname") return res.status(BAD_REQUEST).json(modelResult);
  // 비밀번호와 비밀번호확인이 일치하지 않을 때
  else if (modelResult.state === "pw/pw_confirm_mismatched") return res.status(BAD_REQUEST).json(modelResult);
  // 성공적으로 회원가입
  else if (modelResult.state === "sign_up") return res.status(CREATED).json(modelResult);
}

// 1-3. 회원탈퇴 요청
export async function dropOutController(req, res) {
  /*
   * req.body
   *  checkBox: 회원탈퇴 동의 체크박스에 체크했는지 여부 - boolean값
   */
  try {
    //  필요 변수 선언
    const loginToken = req.signedCookies.token;
    // 로그인 토큰이 없을 때
    if (loginToken === undefined) return res.status(UNAUTHORIZED).json({ state: "login_required" });
    // 로그인했을 때 토큰의 유저인덱스 불러오기
    const loginIndex = await jwt.verify(loginToken, process.env.TOKEN_SECRET).idx;
    const payloadIndex = await jwt.decode(loginToken).idx;
    // payload의 유저인덱스와 signature의 유저인덱스 비교 (조작여부 확인)
    if (loginIndex !== payloadIndex) return res.status(FORBIDDEN).json({ state: "not_authorization" });
    // 회원탈퇴 안내조항에 체크 했는지
    const isAgreed = req.body.checkBox;
    // 안내조항에 체크하지 않았을 때 회원탈퇴 실패
    if (!isAgreed) return res.status(BAD_REQUEST).end();
    // 회원탈퇴 모델 실행결과
    const modelResult = await dropOutModel(req.ip, loginIndex);
    // 실행결과에 따라 분기처리
    // sequelize query 메서드 실패
    if (modelResult.state === "fail_sequelize") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
    // 성공적으로 회원탈퇴 요청
    else if (modelResult.state === "user_withdrawal") {
      // 로그인 토큰 삭제
      res.clearCookie("token");
      return res.status(NO_CONTENT).json(modelResult);
    }
  } catch (err) {
    // 만료된 토큰
    if (err.message === "jwt expired") {
      return res.status(UNAUTHORIZED).json({ state: "expired_token" });
    }
    // 유효하지 않은 토큰일 때
    if (err.message === "invalid signature") {
      return res.status(FORBIDDEN).json({ state: "incorrect_access" });
    }
    return res.status(FORBIDDEN).json({ state: "not_authorization" });
  }
}

// 2. 로그인/로그아웃
// 2-1. 로그인
export async function loginController(req, res) {
  /*
   * req.body
   *  id: 아이디
   *  pw: 비밀번호
   */
  // 기존에 로그인 돼있을 때
  const loginToken = req.signedCookies.token;
  if (loginToken !== undefined) return res.status(CONFLICT).json({ state: "already_login" });

  // 로그인 모델 실행 결과
  const modelResult = await loginModel(req.body, req.ip);
  // 로그인 모델 실행 결과에 따라 분기처리
  // sequelize query 메서드 실패
  if (modelResult.state === "fail_sequelize") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
  // DB에 해당 사용자가 로그인 요청한 id가 없을 때
  if (modelResult.state === "no_matching_id") return res.status(NOT_FOUND).json(modelResult);
  // 존재하는 id는 있으나 id에 대한 요청 pw가 일치하지 않을 때
  else if (modelResult.state === "pw_mismatched") return res.status(BAD_REQUEST).json(modelResult);
  // 성공적으로 로그인 요청 수행
  else if (modelResult.state === "login") {
    // 30분 유효기간의 로그인 토큰 발급
    const tempToken = jwt.sign({ idx: modelResult.userIndex }, process.env.TOKEN_SECRET, {
      algorithm: "HS256",
      expiresIn: "30m",
      issuer: "Zoe",
    });
    // 쿠키로 토큰 전달
    res.cookie("token", tempToken, {
      maxAge: 30 * 60 * 1000,
      httpOnly: true,
      signed: true,
    });
    return res.status(OK).json({ state: "login" });
  }
}
// 2-2. 로그아웃
export async function logoutController(req, res) {
  const loginToken = req.signedCookies.token;
  // 기존에 로그인 돼있을 때 성공적으로 로그아웃 요청 수행
  if (loginToken !== undefined) {
    res.clearCookie("token");
    return res.status(OK).json({ state: "logout" });
  }
  // 기존에 로그인이 돼있지 않을 때 로그아웃 요청은 올바르지 않은 요청
  else {
    return res.status(UNAUTHORIZED).json({ state: "not_previously_logged_in" });
  }
}

// 3. 관심도서관 조회/등록/삭제
// 3-1. 관심도서관 조회
export async function userLibraryController(req, res) {
  try {
    //  필요 변수 선언
    const loginToken = req.signedCookies.token;
    // 로그인 토큰이 없을 때
    if (loginToken === undefined) return res.status(UNAUTHORIZED).json({ state: "login_required" });
    // 로그인했을 때 토큰의 유저인덱스 불러오기
    const loginIndex = await jwt.verify(loginToken, process.env.TOKEN_SECRET).idx;
    const payloadIndex = await jwt.decode(loginToken).idx;
    // payload의 유저인덱스와 signature의 유저인덱스 비교 (조작여부 확인)
    if (loginIndex !== payloadIndex) return res.status(FORBIDDEN).json({ state: "not_authorization" });
    // 해당 유저가 관심도서관으로 등록한 도서관 정보 가져오는 모델 실행결과
    const modelResult = await userLibraryModel(loginIndex, req.ip);
    // 모델 실행 결과에 따라 분기처리
    // sequelize query 메서드 실패
    if (modelResult.state === "fail_sequelize") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
    // 등록된 도서관 정보가 없을 때
    else if (modelResult.state === "no_registered_information") return res.status(OK).json(modelResult);
    // 해당 유저가 지금까지 등록한 관심도서관 정보 응답
    else if (modelResult.state === "user_library_information") return res.status(OK).json(modelResult.dataOfLibrary);
  } catch (err) {
    // 만료된 토큰
    if (err.message === "jwt expired") {
      return res.status(UNAUTHORIZED).json({ state: "expired_token" });
    }
    // 유효하지 않은 토큰일 때
    if (err.message === "invalid signature") {
      return res.status(FORBIDDEN).json({ state: "incorrect_access" });
    }
    return res.status(FORBIDDEN).json({ state: "not_authorization" });
  }
}

// 3-2. 관심도서관 등록
export async function registerUserLibraryController(req, res) {
  /*
   * req.query
   *  libraryIndex
   */
  try {
    //  필요 변수 선언
    const loginToken = req.signedCookies.token;
    // 로그인 토큰이 없을 때
    if (loginToken === undefined) return res.status(UNAUTHORIZED).json({ state: "login_required" });
    // 로그인했을 때 토큰의 유저인덱스 불러오기
    const loginIndex = await jwt.verify(loginToken, process.env.TOKEN_SECRET).idx;
    const payloadIndex = await jwt.decode(loginToken).idx;
    // payload의 유저인덱스와 signature의 유저인덱스 비교 (조작여부 확인)
    if (loginIndex !== payloadIndex) return res.status(FORBIDDEN).json({ state: "not_authorization" });
    // 관심도서관 항목 추가 모델 실행 결과
    const modelResult = await registerUserLibraryModel(req.query.libraryIndex, loginIndex, req.ip);
    // sequelize query 메서드 실패
    if (modelResult.state === "fail_sequelize") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
    // 기존에 관심도서관으로 등록된 정보
    else if (modelResult.state === "duplicated_registration_request") return res.status(BAD_REQUEST).json(modelResult);
    // 성공적으로 관심도서관 추가 요청 수행
    else if (modelResult.state === "additional_user_library") return res.status(OK).end();
  } catch (err) {
    // 만료된 토큰
    if (err.message === "jwt expired") {
      return res.status(UNAUTHORIZED).json({ state: "expired_token" });
    }
    // 유효하지 않은 토큰일 때
    if (err.message === "invalid signature") {
      return res.status(FORBIDDEN).json({ state: "incorrect_access" });
    }
    return res.status(FORBIDDEN).json({ state: "not_authorization" });
  }
}

// 3-3. 관심도서관 삭제
export async function deleteUserLibraryController(req, res) {
  try {
    //  필요 변수 선언
    const loginToken = req.signedCookies.token;
    // 로그인 토큰이 없을 때
    if (loginToken === undefined) return res.status(UNAUTHORIZED).json({ state: "login_required" });
    // 로그인했을 때 토큰의 유저인덱스 불러오기
    const loginIndex = await jwt.verify(loginToken, process.env.TOKEN_SECRET).idx;
    const payloadIndex = await jwt.decode(loginToken).idx;
    // payload의 유저인덱스와 signature의 유저인덱스 비교 (조작여부 확인)
    if (loginIndex !== payloadIndex) return res.status(FORBIDDEN).json({ state: "not_authorization" });
    // 해당 도서관 정보가 있는지, 해당 도서관이 관심도서관으로 등록돼있는지 확인해주는 메서드
    const checkMyLib = await checkUserLibraryMethod(req.query.libraryIndex, loginIndex, req.ip);
    // 존재하지않는 도서관 정보
    if (checkMyLib.state === "non_existent_library") return res.status(NOT_FOUND).json(checkMyLib);
    // 관심도서관으로 등록되지 않은 도서관(도서관 정보는 있지만 해당 유저가 구독하지 않음)
    else if (checkMyLib.state === "no_registered_information") return res.status(BAD_REQUEST).json(checkMyLib);
    // sequelize query 메서드 사용실패
    else if (checkMyLib.state === "fail_sequelize") return res.status(INTERNAL_SERVER_ERROR).json(checkMyLib);
    // 접근성공
    else if (checkMyLib.state === "success_access") {
      // 해당 유저가 관심도서관으로 등록한 도서관 정보 삭제하는모델 실행결과
      const modelResult = await deleteUserLibraryModel(req.query.libraryIndex, loginIndex, req.ip);
      // 실행결과에 따라 분기처리
      // sequelize query 메서드 실패
      if (modelResult.state === "fail_sequelize") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
      // 해당 유저인덱스에 해당 도서관이 관심도서관으로 등록돼있지 않을 때
      if (modelResult.state === "no_registered_information") return res.status(NOT_FOUND).json(modelResult);
      // 해당 관심도서관 정보가 삭제됐을 때
      if (modelResult.state === "delete_user_library") return res.status(NO_CONTENT).json(modelResult);
    }
  } catch (err) {
    // 만료된 토큰
    if (err.message === "jwt expired") {
      return res.status(UNAUTHORIZED).json({ state: "expired_token" });
    }
    // 유효하지 않은 토큰일 때
    if (err.message === "invalid signature") {
      return res.status(FORBIDDEN).json({ state: "incorrect_access" });
    }
    return res.status(FORBIDDEN).json({ state: "not_authorization" });
  }
}

// 4. 유저 정보 수정
// 4-1. 유저 프로필 - 닉네임 수정
export async function editProfileNicknameController(req, res) {
  /*
   * req.body
   *  nickname: 닉네임
   */
  try {
    //  필요 변수 선언
    const loginToken = req.signedCookies.token;
    // 로그인 토큰이 없을 때
    if (loginToken === undefined) return res.status(UNAUTHORIZED).json({ state: "login_required" });
    // 로그인했을 때 토큰의 유저인덱스 불러오기
    const loginIndex = await jwt.verify(loginToken, process.env.TOKEN_SECRET).idx;
    const payloadIndex = await jwt.decode(loginToken).idx;
    // payload의 유저인덱스와 signature의 유저인덱스 비교 (조작여부 확인)
    if (loginIndex !== payloadIndex) return res.status(FORBIDDEN).json({ state: "not_authorization" });

    // 프로필 닉네임 수정 요청 모델 실행결과
    const modelResult = await editProfileNicknameModel(req.body, req.ip, loginIndex);

    // 실행결과에 따라 분기처리
    // sequelize query 메서드 실패
    if (modelResult.state === "fail_sequelize") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
    // 수정요청한 닉네임이 기존에 존재할 때
    else if (modelResult.state === "duplicated_nickname") return res.status(BAD_REQUEST).json(modelResult);
    // 성공적으로 닉네임 변경
    else if (modelResult.state === "edit_nickname") return res.status(OK).end();
  } catch (err) {
    // 만료된 토큰
    if (err.message === "jwt expired") {
      return res.status(UNAUTHORIZED).json({ state: "expired_token" });
    }
    // 유효하지 않은 토큰일 때
    if (err.message === "invalid signature") {
      return res.status(FORBIDDEN).json({ state: "incorrect_access" });
    }
    return res.status(FORBIDDEN).json({ state: "not_authorization" });
  }
}

// 4-2. 유저 프로필 - 이미지 수정
export async function editProfileImageController(req, res) {
  /*
   * req.body
   *  profileImage: 프로필로 지정할 사진 파일 -> multer 모듈로 인해 req.file 에 image 정보 들어감
   */
  try {
    //  필요 변수 선언
    const loginToken = req.signedCookies.token;
    const loginIndex = await jwt.verify(loginToken, process.env.TOKEN_SECRET).idx;
    const imagePath = "profileImage/" + req.file.filename;
    // 업로드 요청한 파일이 이미지 형식이 아닐 때
    if (req.body.fileValidation === false)
      return res.status(BAD_REQUEST).json({ state: "only_jpg,jpeg,gjf,png_format_can_be_uploaded" });
    // 프로필 수정 요청 모델 실행결과
    const modelResult = await editProfileImageModel(imagePath, req.ip, loginIndex);

    // 실행결과에 따라 분기처리
    // sequelize query 메서드 실패
    if (modelResult.state === "fail_sequelize") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
    // 성공적으로 프로필 변경
    else if (modelResult.state === "edit_profile_image") return res.status(OK).end();
    // 프로필 사진이 정상적으로 수정
    return res.status(OK).json({ state: "edit_profile_image" });
  } catch (err) {
    // 만료된 토큰
    if (err.message === "jwt expired") {
      return res.status(UNAUTHORIZED).json({ state: "expired_token" });
    }
    // 유효하지 않은 토큰일 때
    if (err.message === "invalid signature") {
      return res.status(FORBIDDEN).json({ state: "incorrect_access" });
    }
    return res.status(FORBIDDEN).json({ state: "not_authorization" });
  }
}

// 4-3. 회원정보 수정(연락처 수정)
export async function editPhoneNumberController(req, res) {
  /*
   * req.body
   *  phoneNumber: 폰 번호
   */
  try {
    //  필요 변수 선언
    const loginToken = req.signedCookies.token;
    // 로그인 토큰이 없을 때
    if (loginToken === undefined) return res.status(UNAUTHORIZED).json({ state: "login_required" });
    // 로그인했을 때 토큰의 유저인덱스 불러오기
    const loginIndex = await jwt.verify(loginToken, process.env.TOKEN_SECRET).idx;
    const payloadIndex = await jwt.decode(loginToken).idx;
    // payload의 유저인덱스와 signature의 유저인덱스 비교 (조작여부 확인)
    if (loginIndex !== payloadIndex) return res.status(FORBIDDEN).json({ state: "not_authorization" });
    // 연락처 수정 요청 모델 실행결과
    const modelResult = await editPhoneNumberModel(req.body, req.ip, loginIndex);
    // 실행결과에 따라 분기처리
    // sequelize query 메서드 실패
    if (modelResult.state === "fail_sequelize") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
    // 성공적으로 연락처 변경요청 수행
    else if (modelResult.state === "edit_contact") return res.status(OK).end();
  } catch (err) {
    // 만료된 토큰
    if (err.message === "jwt expired") {
      return res.status(UNAUTHORIZED).json({ state: "expired_token" });
    }
    // 유효하지 않은 토큰일 때
    if (err.message === "invalid signature") {
      return res.status(FORBIDDEN).json({ state: "incorrect_access" });
    }
    return res.status(FORBIDDEN).json({ state: "not_authorization" });
  }
}

// 4-4. 비밀번호 수정
export async function editPwController(req, res) {
  /*
   * req.body
   *  pw: 기존 비밀번호
   *  newPw: 새 비밀번호
   *  confirmPw: 새 비밀번호 확인
   */
  try {
    //  필요 변수 선언
    const loginToken = req.signedCookies.token;
    // 로그인 토큰이 없을 때
    if (loginToken === undefined) return res.status(UNAUTHORIZED).json({ state: "login_required" });
    // 로그인했을 때 토큰의 유저인덱스 불러오기
    const loginIndex = await jwt.verify(loginToken, process.env.TOKEN_SECRET).idx;
    const payloadIndex = await jwt.decode(loginToken).idx;
    // payload의 유저인덱스와 signature의 유저인덱스 비교 (조작여부 확인)
    if (loginIndex !== payloadIndex) return res.status(FORBIDDEN).json({ state: "not_authorization" });
    // 비밀번호 수정 모델 실행결과
    const modelResult = await editPwModel(req.body, req.ip, loginIndex);
    // 실행결과에 따라 분기처리
    // sequelize query 메서드 실패
    if (modelResult.state === "fail_sequelize") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
    // 현재 비밀번호 입력값이 올바르지 않을 때
    else if (modelResult.state === "pw_mismatched") return res.status(BAD_REQUEST).json(modelResult);
    // 비밀번호와 비밀번호 수정이 올바르지 않을 때
    else if (modelResult.state === "pw/pw_confirm_mismatched") return res.status(BAD_REQUEST).json(modelResult);
    // 성공적으로 비밀번호 변경 요청 수행
    else if (modelResult.state === "edit_pw") return res.status(OK).json(modelResult);
  } catch (err) {
    // 만료된 토큰
    if (err.message === "jwt expired") {
      return res.status(UNAUTHORIZED).json({ state: "expired_token" });
    }
    // 유효하지 않은 토큰일 때
    if (err.message === "invalid signature") {
      return res.status(FORBIDDEN).json({ state: "incorrect_access" });
    }
    return res.status(FORBIDDEN).json({ state: "not_authorization" });
  }
}

// 5. 유저 정보 가져오기
export async function getUserController(req, res) {
  try {
    //  필요 변수 선언
    const loginToken = req.signedCookies.token;
    // 로그인 토큰이 없을 때
    if (loginToken === undefined) return res.status(UNAUTHORIZED).json({ state: "login_required" });
    // 로그인했을 때 토큰의 유저인덱스 불러오기
    const loginIndex = await jwt.verify(loginToken, process.env.TOKEN_SECRET).idx;
    const payloadIndex = await jwt.decode(loginToken).idx;
    // payload의 유저인덱스와 signature의 유저인덱스 비교 (조작여부 확인)
    if (loginIndex !== payloadIndex) return res.status(FORBIDDEN).json({ state: "not_authorization" });
    // 비밀번호 수정 모델 실행결과
    const modelResult = await getUserModel(req.ip, loginIndex);
    // 실행결과에 따라 분기처리
    // sequelize query 메서드 실패
    if (modelResult.state === "fail_sequelize") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
    // 프로필 사진 이름(프로필 사진 등록한 유저인덱스)과 요청 유저 인덱스가 일치하지 않을 때
    else if (modelResult.state === "incorrect_access") return res.status(BAD_REQUEST).json(modelResult);
    // 성공적으로 유저정보 가져옴
    else if (modelResult.state === "user_information") {
      // 등록된 프로필 사진이 없을 때
      if (!modelResult.dataOfUser.isProfileImage) return res.status(OK).json(modelResult.dataOfUser);
      // 등록된 프로필 사진이 있을 때
      return res.status(OK).json(modelResult.dataOfUser);
    }
  } catch (err) {
    // 만료된 토큰
    if (err.message === "jwt expired") {
      return res.status(UNAUTHORIZED).json({ state: "expired_token" });
    }
    // 유효하지 않은 토큰일 때
    if (err.message === "invalid signature") {
      return res.status(FORBIDDEN).json({ state: "incorrect_access" });
    }
    return res.status(FORBIDDEN).json({ state: "not_authorization" });
  }
}

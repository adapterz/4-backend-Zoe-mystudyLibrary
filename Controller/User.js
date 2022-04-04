// 유저 컨트롤러
// 외장모듈
import path from "path";
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
} from "../CustomModule/StatusCode";
import {
	deleteUserLibraryModel,
	dropOutModel,
	editPhoneNumberModel,
	editProfileModel,
	editPwModel,
	loginModel,
	registerUserLibraryModel,
	signUpModel,
	userBoardModel,
	userCommentModel,
	userLibraryModel,
	userReviewModel,
} from "../Model/User";
import { checkUserLibraryMethod } from "../CustomModule/CheckDataOrAuthority";
/*
 * 1. 회원가입/탈퇴
 * 2. 로그인/로그아웃
 * 3. 관심도서관 조회/등록/탈퇴
 * 4. 유저가 작성한 글/댓글/후기 조회
 * 5. 유저 정보 수정
 */
// 1. 회원가입/탈퇴
// 1-1. 회원가입 약관 확인
export async function signUpGuideController(req, res) {
	return res.status(OK).sendFile(path.join(__dirname, "..", "Terms/SignUpGuide.html"));
}
// 1-2. 회원가입 약관 확인 요청
export async function signUpGuideConfirm(req, res) {
	/*
	 * req.body
	 *  checkBox: 약관동의 체크박스에 체크했는지 여부 - boolean값
	 */

	const isAgreed = req.body.checkBox;
	// 약관확인에서 체크박스에 모두 체크를 했을 때
	if (isAgreed) return res.status(OK).end();
	// 체크박스에 체크하지 않았을 때
	return res.status(BAD_REQUEST).json({ state: "안내사항을 읽고 동의해주세요." });
}

// 1-3. 회원가입 요청
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
	// mysql query 메서드 실패
	if (modelResult.state === "mysql 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
	// 이미 존재하는 id라 회원가입 불가능
	else if (modelResult.state === "존재하는 아이디") return res.status(BAD_REQUEST).json(modelResult);
	// 이미 존재하는 닉네임이라 회원가입 불가능
	else if (modelResult.state === "존재하는 닉네임") return res.status(BAD_REQUEST).json(modelResult);
	// 비밀번호와 비밀번호확인이 일치하지 않을 때
	else if (modelResult.state === "비밀번호/비밀번호확인 불일치") return res.status(BAD_REQUEST).json(modelResult);
	// 성공적으로 회원가입
	else if (modelResult.state === "회원가입") return res.status(CREATED).json(modelResult);
}

// 1-4. 회원탈퇴 요청
export async function dropOutController(req, res) {
	/*
	 * req.body
	 *  checkBox: 회원탈퇴 동의 체크박스에 체크했는지 여부 - boolean값
	 */

	// 필요 변수 선언
	const loginCookie = req.signedCookies.user;
	let loginIndex;
	// 로그인 돼있고 세션키와 발급받은 쿠키의 키가 일치할때 유저인덱스 알려줌
	if (req.session.user) {
		if (req.session.user.key === loginCookie) loginIndex = req.session.user.id;
		else return res.status(FORBIDDEN).json({ state: "올바르지않은 접근" });
	} else return res.status(UNAUTHORIZED).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
	// 회원탈퇴 안내조항에 체크 했는지
	const isAgreed = req.body.checkBox;
	// 안내조항에 체크하지 않았을 때 회원탈퇴 실패
	if (!isAgreed) return res.status(BAD_REQUEST).json({ state: "회원탈퇴를 위해서는 안내조항에 동의해주세요." });
	// 회원탈퇴 모델 실행결과
	const modelResult = await dropOutModel(req.ip, loginIndex);
	// 실행결과에 따라 분기처리
	// mysql query 메서드 실패
	if (modelResult.state === "mysql 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
	// 성공적으로 회원탈퇴 요청
	else if (modelResult.state === "회원탈퇴") {
		req.session.destroy(function (err) {
			if (err) console.log(err);
		});
		res.clearCookie("user");
		return res.status(NO_CONTENT).json(modelResult);
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
	if (req.session.user) return res.status(CONFLICT).json({ state: "이미 로그인했습니다." });
	// 로그인 모델 실행 결과
	const modelResult = await loginModel(req.body, req.ip);
	// 로그인 모델 실행 결과에 따라 분기처리
	// mysql query 메서드 실패
	if (modelResult.state === "mysql 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
	// DB에 해당 사용자가 로그인 요청한 id가 없을 때
	if (modelResult.state === "일치하는 id 없음") return res.status(NOT_FOUND).json(modelResult);
	// 존재하는 id는 있으나 id에 대한 요청 pw가 일치하지 않을 때
	else if (modelResult.state === "비밀번호 불일치") return res.status(BAD_REQUEST).json(modelResult);
	// 성공적으로 로그인 요청 수행
	else if (modelResult.state === "로그인성공") {
		// 로그인세션, 쿠키
		req.session.user = {
			id: modelResult.userIndex,
			authorized: true,
			key: Math.random().toString(36),
		};
		req.session.save();
		res.cookie("user", req.session.user.key, {
			maxAge: 60 * 60 * 1000,
			httpOnly: true,
			signed: true,
		});
		return res.status(OK).json({ login: true });
	}
}
// 2-2. 로그아웃
export async function logoutController(req, res) {
	// 기존에 로그인 돼있을 때 성공적으로 로그아웃 요청 수행
	if (req.session.user) {
		req.session.destroy(function (err) {
			console.log(err);
		});
		res.clearCookie("user");
		return res.status(OK).json({ state: "로그아웃" });
	}
	// 기존에 로그인이 돼있지 않을 때 로그아웃 요청은 올바르지 않은 요청
	else {
		return res.status(UNAUTHORIZED).json({ state: "기존에 로그인 되어있지 않습니다." });
	}
}

// 3. 관심도서관 조회/등록/삭제
// 3-1. 관심도서관 조회
export async function userLibraryController(req, res) {
	//  필요 변수 선언
	const loginCookie = req.signedCookies.user;
	let loginIndex;
	// 로그인 돼있고 세션키와 발급받은 쿠키의 키가 일치할때 유저인덱스 알려줌
	if (req.session.user) {
		if (req.session.user.key === loginCookie) loginIndex = req.session.user.id;
		else return res.status(FORBIDDEN).json({ state: "올바르지않은 접근" });
	} else return res.status(UNAUTHORIZED).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
	// 해당 유저가 관심도서관으로 등록한 도서관 정보 가져오는 모델 실행결과
	const modelResult = await userLibraryModel(loginIndex, req.ip);
	// 모델 실행 결과에 따라 분기처리
	// mysql query 메서드 실패
	if (modelResult.state === "mysql 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
	// 등록된 도서관 정보가 없을 때
	else if (modelResult.state === "등록된정보없음") return res.status(OK).json(modelResult);
	// 해당 유저가 지금까지 등록한 관심도서관 정보 응답
	else if (modelResult.state === "유저의관심도서관") return res.status(OK).json(modelResult.dataOfLibrary);
}

// 3-2. 관심도서관 등록
export async function registerUserLibraryController(req, res) {
	/*
	 * req.query
	 *  libraryIndex
	 */
	// 필요 변수 선언
	const loginCookie = req.signedCookies.user;
	let loginIndex;
	// 로그인 돼있고 세션키와 발급받은 쿠키의 키가 일치할때 유저인덱스 알려줌
	if (req.session.user) {
		if (req.session.user.key === loginCookie) loginIndex = req.session.user.id;
		else return res.status(FORBIDDEN).json({ state: "올바르지않은 접근" });
	} else return res.status(UNAUTHORIZED).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
	// 관심도서관 항목 추가 모델 실행 결과
	const modelResult = await registerUserLibraryModel(req.query.libraryIndex, loginIndex, req.ip);
	// mysql query 메서드 실패
	if (modelResult.state === "mysql 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
	// 기존에 관심도서관으로 등록된 정보
	else if (modelResult.state === "중복된등록요청") return res.status(BAD_REQUEST).json(modelResult);
	// 성공적으로 관심도서관 추가 요청 수행
	else if (modelResult.state === "관심도서관추가") return res.status(OK).end();
}

// 3-3. 관심도서관 삭제
export async function deleteUserLibraryController(req, res) {
	// 로그인 돼있고 세션키와 발급받은 쿠키의 키가 일치할때 유저인덱스 알려줌
	const loginCookie = req.signedCookies.user;
	let loginIndex;
	if (req.session.user) {
		if (req.session.user.key === loginCookie) loginIndex = req.session.user.id;
		else return res.status(FORBIDDEN).json({ state: "올바르지않은 접근" });
	} else return res.status(UNAUTHORIZED).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
	// 해당 도서관 정보가 있는지, 해당 도서관이 관심도서관으로 등록돼있는지 확인해주는 메서드
	const checkMyLib = await checkUserLibraryMethod(req.query.libraryIndex, loginIndex, req.ip);
	// 존재하지않는 도서관 정보
	if (checkMyLib.state === "존재하지않는도서관") return res.status(NOT_FOUND).json(checkMyLib);
	// 관심도서관으로 등록되지 않은 도서관(도서관 정보는 있지만 해당 유저가 구독하지 않음)
	else if (checkMyLib.state === "등록되지않은관심도서관") return res.status(BAD_REQUEST).json(checkMyLib);
	// mysql query 메서드 사용실패
	else if (checkMyLib.state === "mysql 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(checkMyLib);
	// 접근성공
	else if (checkMyLib.state === "접근성공") {
		// 해당 유저가 관심도서관으로 등록한 도서관 정보 삭제하는모델 실행결과
		const modelResult = await deleteUserLibraryModel(req.query.libraryIndex, loginIndex, req.ip);
		// 실행결과에 따라 분기처리
		// mysql query 메서드 실패
		if (modelResult.state === "mysql 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
		// 해당 유저인덱스에 해당 도서관이 관심도서관으로 등록돼있지 않을 때
		if (modelResult.state === "존재하지않는정보") return res.status(NOT_FOUND).json(modelResult);
		// 해당 관심도서관 정보가 삭제됐을 때
		if (modelResult.state === "관심도서관삭제") return res.status(NO_CONTENT).json(modelResult);
	}
}
// 4. 유저가 작성한 글/댓글/후기 조회
// 4-1. 유저가 작성한 글 조회
export async function userBoardController(req, res) {
	// 필요 변수 선언
	const loginCookie = req.signedCookies.user;
	let loginIndex;
	let page;
	// 로그인 돼있고 세션키와 발급받은 쿠키의 키가 일치할때 유저인덱스 알려줌
	if (req.session.user) {
		if (req.session.user.key === loginCookie) loginIndex = req.session.user.id;
		else return res.status(FORBIDDEN).json({ state: "올바르지않은 접근" });
	} else return res.status(UNAUTHORIZED).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
	// page 값
	if (req.query.page !== undefined) page = req.query.page;
	else page = 1;
	// 해당 유저가 작성한 글 목록 가져올 모델 실행결과
	const modelResult = await userBoardModel(loginIndex, page, req.ip);
	// 모델 실행결과에 따른 분기처리
	// mysql query 메서드 실패
	if (modelResult.state === "mysql 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(modelResult.state);
	// 유저가 작성한 글이 없을 때 (요청은 올바르지만 안타깝게도 응답해줄 DB 정보가 없을 때)
	else if (modelResult.state === "등록된글이없음") return res.status(OK).json(modelResult.state);
	// 성공적으로 유저가 작성한 게시글 정보 응답
	else if (modelResult.state === "내작성글조회") return res.status(OK).json(modelResult.dataOfBoard);
}
// 4-2. 유저가 작성한 댓글 조회
export async function userCommentController(req, res) {
	// 필요 변수 선언
	const loginCookie = req.signedCookies.user;
	let loginIndex;
	let page;
	// 로그인 돼있고 세션키와 발급받은 쿠키의 키가 일치할때 유저인덱스 알려줌
	if (req.session.user) {
		if (req.session.user.key === loginCookie) loginIndex = req.session.user.id;
		else return res.status(FORBIDDEN).json({ state: "올바르지않은 접근" });
	} else return res.status(UNAUTHORIZED).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
	// page 값
	if (req.query.page !== undefined) page = req.query.page;
	else page = 1;
	// 해당 유저가 작성한 댓글 정보 가져올 모델 실행 결과
	const modelResult = await userCommentModel(loginIndex, page, req.ip);
	// 모델 실행결과에 따른 분기처리
	// mysql query 메서드 실패
	if (modelResult.state === "mysql 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
	// 유저가 작성한 댓글이 없을 때 (요청은 올바르지만 안타깝게도 응답해줄 DB 정보가 없을 때)
	else if (modelResult.state === "등록된댓글없음") return res.status(OK).json(modelResult);
	// 성공적으로 유저가 작성한 댓글 정보 응답
	else if (modelResult.state === "성공적조회") return res.status(OK).json(modelResult.dataOfComment);
}
// 4-3. 유저가 작성한 도서관 이용 후기 조회
export async function userReviewController(req, res) {
	// 필요 변수 선언
	const loginCookie = req.signedCookies.user;
	let loginIndex;
	let page;
	// 로그인 돼있고 세션키와 발급받은 쿠키의 키가 일치할때 유저인덱스 알려줌
	if (req.session.user) {
		if (req.session.user.key === loginCookie) loginIndex = req.session.user.id;
		else return res.status(FORBIDDEN).json({ state: "올바르지않은 접근" });
	} else return res.status(UNAUTHORIZED).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
	// page 값
	if (req.query.page !== undefined) page = req.query.page;
	else page = 1;
	// 해당 유저가 작성한 후기 정보 가져오는 모델 실행 결과
	const modelResult = await userReviewModel(loginIndex, page, req.ip);
	// 모델 실행결과에 따른 분기처리
	// mysql query 메서드 실패
	if (modelResult.state === "mysql 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
	// 유저가 작성한 후기가 없을 때 (요청은 올바르지만 안타깝게도 응답해줄 DB 정보가 없을 때)
	else if (modelResult.state === "등록된후기없음") return res.status(OK).json(modelResult);
	// 성공적으로 유저가 작성한 후기 정보 응답
	else if (modelResult.state === "성공적조회") return res.status(OK).json(modelResult.dataOfReview);
}

// 5. 유저 정보 수정
// 5-1. 유저 프로필 수정
export async function editProfileController(req, res) {
	/*
	 * req.body
	 *  profileImage: 프로필 사진 uri
	 *  nickname: 닉네임
	 */
	// 필요 변수 선언
	const loginCookie = req.signedCookies.user;
	let loginIndex;
	// 로그인 돼있고 세션키와 발급받은 쿠키의 키가 일치할때 유저인덱스 알려줌
	if (req.session.user) {
		if (req.session.user.key === loginCookie) loginIndex = req.session.user.id;
		else return res.status(FORBIDDEN).json({ state: "올바르지않은 접근" });
	} else return res.status(UNAUTHORIZED).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });

	// 프로필 수정 요청 모델 실행결과
	const modelResult = await editProfileModel(req.body, req.ip, loginIndex);

	// 실행결과에 따라 분기처리
	// mysql query 메서드 실패
	if (modelResult.state === "mysql 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
	// 수정요청한 닉네임이 기존에 존재할 때
	else if (modelResult.state === "중복닉네임") return res.status(BAD_REQUEST).json(modelResult);
	// 성공적으로 프로필 변경
	else if (modelResult.state === "프로필변경성공") return res.status(OK).end();
}

// 5-2. 회원정보 수정(연락처 수정)
export async function editPhoneNumberController(req, res) {
	/*
	 * req.body
	 *  phoneNumber: 폰 번호
	 */
	// 필요 변수 선언
	const loginCookie = req.signedCookies.user;
	let loginIndex;
	// 로그인 돼있고 세션키와 발급받은 쿠키의 키가 일치할때 유저인덱스 알려줌
	if (req.session.user) {
		if (req.session.user.key === loginCookie) loginIndex = req.session.user.id;
		else return res.status(FORBIDDEN).json({ state: "올바르지않은 접근" });
	} else return res.status(UNAUTHORIZED).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
	// 연락처 수정 요청 모델 실행결과
	const modelResult = await editPhoneNumberModel(req.body, req.ip, loginIndex);
	// 실행결과에 따라 분기처리
	// mysql query 메서드 실패
	if (modelResult.state === "mysql 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
	// 성공적으로 연락처 변경요청 수행
	else if (modelResult.state === "연락처변경성공") return res.status(OK).end();
}

// 5-3. 비밀번호 수정
export async function editPwController(req, res) {
	/*
	 * req.body
	 *  pw: 기존 비밀번호
	 *  newPw: 새 비밀번호
	 *  confirmPw: 새 비밀번호 확인
	 */
	// 필요 변수 선언
	const loginCookie = req.signedCookies.user;
	let loginIndex;
	// 로그인 돼있고 세션키와 발급받은 쿠키의 키가 일치할때 유저인덱스 알려줌
	if (req.session.user) {
		if (req.session.user.key === loginCookie) loginIndex = req.session.user.id;
		else return res.status(FORBIDDEN).json({ state: "올바르지않은 접근" });
	} else return res.status(UNAUTHORIZED).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
	// 비밀번호 수정 모델 실행결과
	const modelResult = await editPwModel(req.body, req.ip, loginIndex);
	// 실행결과에 따라 분기처리
	// mysql query 메서드 실패
	if (modelResult.state === "mysql 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
	// 현재 비밀번호 입력값이 올바르지 않을 때
	else if (modelResult.state === "기존비밀번호 불일치") return res.status(BAD_REQUEST).json(modelResult);
	// 비밀번호와 비밀번호 수정이 올바르지 않을 때
	else if (modelResult.state === "비밀번호/비밀번호확인 불일치") return res.status(BAD_REQUEST).json(modelResult);
	// 성공적으로 비밀번호 변경 요청 수행
	else if (modelResult.state === "비밀번호변경성공") return res.status(OK).json(modelResult);
}

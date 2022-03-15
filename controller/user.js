// 내 정보 라우터의 컨트롤러
const user_model = require("../model/user");
const library_model = require("../model/library");

// 내 관심도서관
const myLib = function (req, res) {
  // 로그인 여부 검사
  const login_cookie = req.signedCookies.user;
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 해당 유저가 관심도서관으로 등록한 도서관 정보 가져오는 모델 실행결과
  const model_results = library_model.userLibModel(login_cookie);
  /* TODO 비동기 공부 후 다시 작성
  // 실행결과에 따라 분기처리
  // mysql query 메서드 실패
  if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results.state);
  // 해당 유저가 지금까지 등록한 관심도서관 정보 응답
  else if(model_results.state==="유저의관심도서관") return res.state(200).json(model_results.data);
   */
};
// 내 관심도서관 삭제
const deleteMyLib = function (req, res) {
  // 로그인 여부 검사
  const login_cookie = req.signedCookies.user;
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 해당 유저가 관심도서관으로 등록한 도서관 정보 삭제하는모델 실행결과
  const model_results = library_model.userLibModel(req.query.libraryIndex, login_cookie, req.ip);
  /* TODO 비동기 공부 후 다시 작성
  // 실행결과에 따라 분기처리
  // mysql query 메서드 실패
  if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results.state);
  // 해당 유저인덱스에 해당 도서관이 관심도서관으로 등록돼있지 않을 때
  if(model_results.state === "존재하지않는정보") return res.stauts(404).json(model_results.state);
  // 해당 관심도서관 정보가 삭제됐을 때
  if(model_results.state === "관심도서관삭제") return res.status(204).json(model_results.state);
   */
};
// 내 프로필 수정
const reviseProfile = function (req, res) {
  /*
  req.body
    profileShot: 프로필 사진 uri
    nickName: 닉네임
   */
  // 로그인 여부 검사
  const login_cookie = req.signedCookies.user;
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });

  // 프로필 수정 요청 모델 실행결과
  let model_results = user_model.reviseProfileModel(req.body, req.ip, login_cookie);
  /* TODO 비동기 배운 후 적용
  // 실행결과에 따라 분기처리
  // mysql query 메서드 실패
  if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
  // 수정요청한 닉네임이 기존에 존재할 때
  else if (model_results.state === "중복닉네임") return res.status(400).json(model_results);
  // 성공적으로 프로필 변경
  else if (model_results.state === "프로필변경성공") return res.status(200).end(model_results);
   */
};

// 회원정보 수정(연락처 수정)
const revisePhoneNumber = function (req, res) {
  /*
  req.body
    phoneNumber: 폰 번호
   */
  // 로그인 여부 검사
  const login_cookie = req.signedCookies.user;
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 연락처 수정 요청 모델 실행결과
  const model_results = user_model.revisePhoneNumberModel(req.body, req.ip, login_cookie);
  // TODO 비동기 배운후 적용
  // 실행결과에 따라 분기처리
  // mysql query 메서드 실패
  // if(model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
  // 성공적으로 연락처 변경요청 수행
  // if(model_results.state === "연락처변경성공") return res.status(400).json(model_results);
};

// 비밀번호 수정(patch)
const revisePw = function (req, res) {
  /*
  req.body
    pw: 기존 비밀번호
    newPw: 새 비밀번호
    confirmPw: 새 비밀번호 확인
   */
  // 로그인 여부 검사
  const login_cookie = req.signedCookies.user;
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 비밀번호 수정 모델 실행결과
  const model_results = user_model.revisePwModel(req.body, req.ip, login_cookie);
  // TODO 비동기 배운 후 적용
  // 실행결과에 따라 분기처리
  // mysql query 메서드 실패
  // if (model_results.state === "mysql 사용실패") return res.status(500).json( model_results );
  // 현재 비밀번호 입력값이 올바르지 않을 때
  // else if (model_results.state === "기존비밀번호 불일치") return res.status(400).json(model_results );
  // 비밀번호와 비밀번호 수정이 올바르지 않을 때
  // else if (model_results.state === "비밀번호/비밀번호확인 불일치") return res.status(400).json(model_results);
  // 성공적으로 비밀번호 변경 요청 수행
  // else if (model_results.state === "비밀번호변경성공") return res.status(200).json( model_results );
};

// TODO 체크박스 체크여부 갖고올 수 있을 때 다시 작성
// 회원탈퇴 요청
const dropOut = function (req, res) {
  // 예시 바디
  const example_body = {
    checkBox1: false,
  };
  // 로그인 여부 검사
  const login_cookie = req.signedCookies.user;
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 회원탈퇴 안내조항에 체크 했는지
  const is_agreed = req.body;
  // 안내조항에 체크하지 않았을 때 회원탈퇴 실패
  if (!is_agreed) return res.status(400).json({ state: "회원탈퇴를 위해서는 안내조항에 동의해주세요." });
  // 회원탈퇴 모델 실행결과
  const model_results = user_model.dropOutModel(req.ip, login_cookie);
  // TODO 비동기 배운후 적용
  // 실행결과에 따라 분기처리
  // mysql query 메서드 실패
  //if(model_results.state ==="mysql 사용실패") return res.status(500).json(model_results);
  // 성공적으로 회원탈퇴 요청
  //else if(model_results.state === "회원탈퇴") return res.status(204).json(model_results);
};

// 모듈화
module.exports = {
  myLib: myLib,
  deleteMyLib: deleteMyLib,
  reviseProfile: reviseProfile,
  revisePhoneNumber: revisePhoneNumber,
  revisePw: revisePw,
  dropOut: dropOut,
};

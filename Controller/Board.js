// 게시판 컨트롤러
// 내장 모듈
import { checkBoardMethod } from "../CustomModule/CheckDataOrAuthority";
import {
  deleteBoardModel,
  detailBoardModelController,
  editBoardModel,
  entireBoardModel,
  favoriteBoardModel,
  getRecentBoardModel,
  getWriteModel,
  searchBoardModel,
  writeBoardModel,
} from "../Model/Board";
import {
  OK,
  INTERNAL_SERVER_ERROR,
  FORBIDDEN,
  NOT_FOUND,
  CREATED,
  UNAUTHORIZED,
  NO_CONTENT,
  BAD_REQUEST,
} from "../CustomModule/StatusCode";

/*
 * 1. 게시글 조회
 * 2. 게시글 작성/수정/삭제
 * 3. 좋아요/검색 기능
 */

// 1. 게시글 조회
// 1-1. 최신 자유게시판 글 5개/공부인증샷 글 4개 불러오기
export async function getRecentBoardController(req, res) {
  // 최신글 자유게시판 글 5개/공부인증샷 글 4개 불러오는 모델 실행결과
  const modelResult = await getRecentBoardModel(req.ip);
  // mysql query 메서드 실패
  if (modelResult.state === "mysql 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
  // 성공적으로 최신글 정보 가져왔을 때
  else if (modelResult.state === "최신글정보") return res.status(OK).json(modelResult.data);
}

// 1-2. 전체 게시물 보기
export async function entireBoardController(req, res) {
  // req.params: category
  // 필요 변수 선언
  let reqCategory;
  let page;
  // 요청 category 값이 자유게시판이면 자유게시판의 글 정보만, 공부인증샷면 공부인증샷 게시판의 글 정보만 가져오기
  if (req.params.category === "free-bulletin") reqCategory = "자유게시판";
  if (req.params.category === "proof-shot") reqCategory = "공부인증샷";
  // 게시판 page 값
  if (req.query.page !== undefined) page = req.query.page;
  else page = 1;
  // 카테고리에 따른 게시글 전체 정보 가져오는 모듈
  const modelResult = await entireBoardModel(reqCategory, page, req.ip);
  // 모델 실행결과에 따른 분기처리
  // mysql query 메서드 실패
  if (modelResult.state === "mysql 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
  // return 해줄 게시글이 없을 때
  else if (modelResult.state === "존재하지않는정보") return res.status(OK).json(modelResult);
  // 성공적으로 게시판 정보 가져오기 수행
  else if (modelResult.state === "전체게시글") return res.status(OK).json(modelResult.data);
}

// 1-3. 게시물 상세보기
export async function detailBoardController(req, res) {
  // req.params: category,boardIndex
  // 필요 변수 선언
  const loginCookie = req.signedCookies.user;
  let loginIndex;
  let reqCategory;
  let page;
  // 로그인 여부 검사
  // 로그인 돼있고 세션키와 발급받은 쿠키의 키가 일치할때 유저인덱스 알려줌
  if (req.session.user) {
    if (req.session.user.key === loginCookie) loginIndex = req.session.user.id;
    else return res.status(FORBIDDEN).json({ state: "올바르지않은 접근" });
  } else loginIndex = null;
  // 요청 category 값이 자유게시판이면 자유게시판의 글 정보, 공부인증샷면 공부인증샷 게시판의 글 정보 가져오기
  if (req.params.category === "free-bulletin") reqCategory = "자유게시판";
  if (req.params.category === "proof-shot") reqCategory = "공부인증샷";
  // 댓글 page 값
  if (req.query.page !== undefined) page = req.query.page;
  else page = 1;

  // 모델 결과 변수
  const modelResult = await detailBoardModelController(reqCategory, req.params.boardIndex, page, req.ip, loginIndex);

  // 모델 실행 결과에 따른 분기처리
  // mysql query 메서드 실패
  if (modelResult.state === "mysql 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
  // 해당 게시글 정보가 없을 때
  else if (modelResult.state === "존재하지않는게시글") return res.status(NOT_FOUND).json(modelResult);
  // 해당 게시글 정보 가져오기
  else if (modelResult.state === "게시글상세보기") return res.status(OK).json(modelResult.data);
}
// 2. 게시글 작성/수정/삭제
// 2-1. 게시글 쓰기
export async function writeBoardController(req, res) {
  /*
   *  req.body
   *  category: 게시판 카테고리
   *  postTitle: 글제목
   *  postContent: 글내용
   *  tags: 태그배열 [{content : 태그내용},{content: 태그내용}]
   */
  // 필요 변수 선언
  const loginCookie = req.signedCookies.user;
  let loginIndex;
  // 로그인 돼있고 세션키와 발급받은 쿠키의 키가 일치할때 유저인덱스 알려줌
  if (req.session.user) {
    if (req.session.user.key === loginCookie) loginIndex = req.session.user.id;
    else return res.status(FORBIDDEN).json({ state: "올바르지않은 접근" });
  } else return res.status(UNAUTHORIZED).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 게시글 작성 모델 실행 결과 변수
  const modelResult = await writeBoardModel(req.body.category, req.body, loginIndex, req.ip);
  // 모델 실행결과에 따른 분기처리
  // mysql query 메서드 실패
  if (modelResult.state === "mysql 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
  // 게시글 작성 요청 성공
  else if (modelResult.state === "게시글작성완료") return res.status(CREATED).end();
}

// 2-2. 게시글 수정을 위해 기존 게시글 정보 불러오기
export async function getWriteController(req, res) {
  // req.query : boardIndex
  // 필요 변수 선언
  const loginCookie = req.signedCookies.user;
  let loginIndex;
  // 로그인 돼있고 세션키와 발급받은 쿠키의 키가 일치할때 유저인덱스 알려줌
  if (req.session.user) {
    if (req.session.user.key === loginCookie) loginIndex = req.session.user.id;
    else return res.status(FORBIDDEN).json({ state: "올바르지않은 접근" });
  } else return res.status(UNAUTHORIZED).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 1. 글 새로 작성하는 경우
  if (req.query.boardIndex === "") return res.status(OK).end();
  // 2. 기존의 글 수정하는 경우
  // 해당 게시글이 존재하는지 확인하고 게시글에 대한 유저의 권한 체크
  const checkPost = await checkBoardMethod(req.query.boardIndex, loginIndex, req.ip);
  // mysql query 메서드 실패
  if (checkPost.state === "mysql 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(checkPost);
  // 해당 게시글 정보가 없을 때
  else if (checkPost.state === "존재하지않는게시글") return res.status(NOT_FOUND).json(checkPost);
  // 로그인돼있는 유저와 해당 게시물 작성 유저가 일치하지 않을 때
  else if (checkPost.state === "접근권한없음") return res.status(FORBIDDEN).json(checkPost);
  // 해당 게시물 작성한 유저와 로그인한 유저가 일치할 때
  else if (checkPost.state === "접근성공") {
    // 해당 인덱스의 게시글 정보 가져오는 모델
    const modelResult = await getWriteModel(req.query.boardIndex, loginIndex, req.ip);
    // 모델 실행결과에 따른 분기처리
    // mysql query 메서드 실패
    if (modelResult.state === "mysql 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
    // 해당 게시글 정보가 없을 때
    else if (modelResult.state === "존재하지않는게시글") return res.status(NOT_FOUND).json(modelResult);
    // 성공적으로 게시글 정보 가져왔을 때
    else if (modelResult.state === "게시글정보로딩") return res.status(OK).json(modelResult.data);
  }
}
// 2-3. 게시글 수정요청
export async function editBoardController(req, res) {
  /*
   *  req.body
   *  category: 카테고리(자유게시판/공부인증샷)
   *  postTitle: 글제목
   *  postContent: 글내용
   *  tags: 태그배열
   */
  // 필요 변수 선언
  const loginCookie = req.signedCookies.user;
  let loginIndex;
  // 로그인 돼있고 세션키와 발급받은 쿠키의 키가 일치할때 유저인덱스 알려줌
  if (req.session.user) {
    if (req.session.user.key === loginCookie) loginIndex = req.session.user.id;
    else return res.status(FORBIDDEN).json({ state: "올바르지않은 접근" });
  } else return res.status(UNAUTHORIZED).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });

  // 해당 게시글이 존재하는지 확인하고 게시글에 대한 유저의 권한 체크
  const checkPost = await checkBoardMethod(req.query.boardIndex, loginIndex, req.ip);
  // mysql query 메서드 실패
  if (checkPost.state === "mysql 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(checkPost);
  // 해당 게시글 정보가 없을 때
  else if (checkPost.state === "존재하지않는게시글") return res.status(NOT_FOUND).json(checkPost);
  // 로그인돼있는 유저와 해당 게시물 작성 유저가 일치하지 않을 때
  else if (checkPost.state === "접근권한없음") return res.status(FORBIDDEN).json(checkPost);
  // 해당 게시물 작성한 유저와 로그인한 유저가 일치할 때
  else if (checkPost.state === "접근성공") {
    // 게시글 수정 모델 실행 결과
    const modelResults = await editBoardModel(req.body, req.query.boardIndex, loginIndex, req.ip);
    // mysql query 메서드 실패
    if (modelResults.state === "mysql 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(modelResults);
    // 성공적으로 게시글 수정 요청 수행
    else if (modelResults.state === "게시글수정") return res.status(OK).end();
  }
}

// 2-4. 게시글 삭제하기
export async function deleteBoardController(req, res) {
  // req.query: boardIndex
  // 필요 변수 선언
  const loginCookie = req.signedCookies.user;
  let loginIndex;
  // 로그인 돼있고 세션키와 발급받은 쿠키의 키가 일치할때 유저인덱스 알려줌
  if (req.session.user) {
    if (req.session.user.key === loginCookie) loginIndex = req.session.user.id;
    else return res.status(FORBIDDEN).json({ state: "올바르지않은 접근" });
  } else return res.status(UNAUTHORIZED).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 해당 게시글이 존재하는지 확인하고 게시글에 대한 유저의 권한 체크
  const checkPost = await checkBoardMethod(req.query.boardIndex, loginIndex, req.ip);
  // mysql query 메서드 실패
  if (checkPost.state === "mysql 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(checkPost);
  // 해당 게시글 정보가 없을 때
  else if (checkPost.state === "존재하지않는게시글") return res.status(NOT_FOUND).json(checkPost);
  // 로그인돼있는 유저와 해당 게시물 작성 유저가 일치하지 않을 때
  else if (checkPost.state === "접근권한없음") return res.status(FORBIDDEN).json(checkPost);
  // 해당 게시물 작성한 유저와 로그인한 유저가 일치할 때
  else if (checkPost.state === "접근성공") {
    // 해당 인덱스 게시글 삭제
    const modelResult = await deleteBoardModel(req.query.boardIndex, loginIndex, req.ip);
    // mysql query 메서드 실패
    if (modelResult.state === "mysql 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
    // 성공적으로 게시글 삭제 요청 수행
    else if (modelResult.state === "게시글삭제") return res.status(NO_CONTENT).end();
  }
}
// 3. 좋아요/검색기능
// 3-1. 게시글 좋아요 요청
export async function favoriteBoardController(req, res) {
  // req.query: boardIndex
  // 필요 변수 선언
  const loginCookie = req.signedCookies.user;
  let loginIndex;
  // 로그인 돼있고 세션키와 발급받은 쿠키의 키가 일치할때 유저인덱스 알려줌
  if (req.session.user) {
    if (req.session.user.key === loginCookie) loginIndex = req.session.user.id;
    else return res.status(FORBIDDEN).json({ state: "올바르지않은 접근" });
  } else return res.status(UNAUTHORIZED).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 좋아요 모델 실행 결과
  const modelResult = await favoriteBoardModel(req.query.boardIndex, loginIndex, req.ip);
  // mysql query 메서드 실패
  if (modelResult.state === "mysql 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
  // 좋아요를 이미 누른적이 있을 때
  else if (modelResult.state === "좋아요 중복요청") return res.status(BAD_REQUEST).json(modelResult);
  // 성공적으로 좋아요 요청 수행
  else if (modelResult.state === "좋아요+1") return res.status(OK).json(modelResult);
}
// 3-2. 게시글 검색기능
export async function searchBoardController(req, res) {
  /*
   *  req.query
   *  searchOption (ex. 제목만, 내용만, 닉네임, 제목 + 내용)
   *  searchContent (검색내용)
   *  req.params
   *  category (자유게시판/공부인증샷)
   */

  // 필요 변수 선언
  let reqCategory;
  let page;
  // req.category에 따라 DB 값과 비교할 값으로 변경해주기
  if (req.params.category === "free-bulletin") reqCategory = "자유게시판";
  else if (req.params.category === "proof-shoot") reqCategory = "공부인증샷"; // 댓글 page 값
  if (req.query.page !== undefined) page = req.query.page;
  else page = 1;
  // 검색 모델 실행 결과
  const modelResult = await searchBoardModel(req.query.searchOption, req.query.searchContent, reqCategory, page, req.ip);
  // mysql query 메서드 실패
  if (modelResult.state === "mysql 사용실패") return res.status(INTERNAL_SERVER_ERROR).json(modelResult);
  // 검색결과가 없을 때
  else if (modelResult.state === "검색결과없음") return res.status(OK).json(modelResult);
  // 검색결과가 있을 때
  else if (modelResult.state === "검색글정보") return res.status(OK).json(modelResult);
}

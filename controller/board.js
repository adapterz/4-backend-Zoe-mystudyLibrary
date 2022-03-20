// 게시판 컨트롤러
const post_model = require("../model/board");
const check_data_or_authority_model = require("../my_module/check_data_or_authority");
/*
1. 게시글 조회
2. 게시글 작성/수정/삭제
3. 좋아요/검색 기능
 */
// 1. 게시글 조회
// 1-1. 최신 자유게시판 글 5개/공부인증샷 글 4개 불러오기
const getRecentPost = async function (req, res) {
  // 최신글 자유게시판 글 5개/공부인증샷 글 4개 불러오는 모델 실행결과
  const model_results = await post_model.getRecentPostModel(req.ip);
  // mysql query 메서드 실패
  if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
  // 성공적으로 최신글 정보 가져왔을 때
  else if (model_results.state === "최신글정보") return res.status(200).json(model_results.data);
};

// TODO 페이징
// 1-2. 전체 게시물 보기
const entireBoard = async function (req, res) {
  // req.params: category
  // req.params 에 따라서 DB BOARDS 테이블 category 컬럼의 값 설정
  // 요청 category 값이 자유게시판이면 자유게시판의 글 정보만, 공부인증샷면 공부인증샷 게시판의 글 정보만 Select 해오기
  let req_category;
  // req.params.category 에 존재하지않는 카테고리가 들어왔을 때
  if (!(req.params.category === "free-bulletin" || req.params.category === "proof-shot"))
    return res.status(404).json({ state: "존재하지않는카테고리" });
  // params.category에 따라 DB에 저장될 값으로 바꿔주기
  if (req.params.category === "free-bulletin") req_category = "자유게시판";
  if (req.params.category === "proof-shot") req_category = "공부인증샷";
  // 카테고리에 따른 게시글 전체 정보 가져오는 모듈
  const model_results = await post_model.entireBoardModel(req_category, req.ip);
  // 모델 실행결과에 따른 분기처리
  // mysql query 메서드 실패
  if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
  // 성공적으로 게시판 정보 가져오기 수행
  else if (model_results.state === "전체게시글") return res.status(200).json(model_results.data);
};

// 1-3. 게시물 상세보기
const detailBoard = async function (req, res) {
  // req.params: category,boardIndex
  let req_category;
  if (!(req.params.category === "free-bulletin" || req.params.category === "proof-shot"))
    return res.status(404).json({ state: "존재하지않는카테고리" });
  if (req.params.category === "free-bulletin") req_category = "자유게시판";
  if (req.params.category === "proof-shot") req_category = "공부인증샷";
  // 특정 게시글인덱스에 따른 데이터 가져오는 모듈
  // 로그인 여부 검사
  const login_cookie = req.signedCookies.user;
  // 모델 결과 변수
  let model_results;
  // 로그인을 하지 않았을 때
  if (!login_cookie) {
    model_results = await post_model.detailBoardModel(req_category, req.params.boardIndex, req.ip, null);
  }
  // 로그인을 했을 때
  if (login_cookie) {
    model_results = await post_model.detailBoardModel(req_category, req.params.boardIndex, req.ip, login_cookie);
  }
  // 모델 실행 결과에 따른 분기처리
  // mysql query 메서드 실패
  if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
  // 해당 게시글 정보가 없을 때
  else if (model_results.state === "존재하지않는게시글") return res.status(404).json(model_results);
  // 해당 게시글 정보 가져오기
  else if (model_results.state === "게시글상세보기") return res.status(200).json(model_results.data);
};
// 2. 게시글 작성/수정/삭제
// 2-1. 게시글 쓰기
const writePost = async function (req, res) {
  /*
  req.body
    category: 게시판 카테고리
    postTitle: 글제목
    postContent: 글내용
    tags: 태그배열 [{content : 태그내용},{content: 태그내용}]
   */
  // 쿠키의 유저인덱스 정보
  const login_cookie = req.signedCookies.user;
  // 로그인 여부 검사
  if (!login_cookie) return res.status(401).json({ state: "글을 작성하기 위해서는 로그인을 해야합니다." });

  if (!(req.body.category === "자유게시판" || req.body.category === "공부인증샷"))
    return res.status(400).json({ state: "존재하지않는카테고리" });

  // 게시글 작성 모델 실행 결과 변수
  const model_results = await post_model.writePostModel(req.body.category, req.body, login_cookie, req.ip);
  // 모델 실행결과에 따른 분기처리
  // mysql query 메서드 실패
  if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
  // 게시글 작성 요청 성공
  else if (model_results.state === "게시글작성완료") return res.status(201).end();
};

// 2-2. 게시글 수정을 위해 기존 게시글 정보 불러오기
const getWrite = async function (req, res) {
  // req.query : boardIndex
  const login_cookie = req.signedCookies.user;
  // 유저의 로그인 여부 검사
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 1. 글 새로 작성하는 경우
  if (req.query.boardIndex === "") return res.status(200).end();
  // 2. 기존의 글 수정하는 경우
  // 해당 게시글이 존재하는지 확인하고 게시글에 대한 유저의 권한 체크
  const check_post = await check_data_or_authority_model.checkPostModel(req.query.boardIndex, login_cookie, req.ip);
  // mysql query 메서드 실패
  if (check_post.state === "mysql 사용실패") return res.status(500).json(check_post);
  // 해당 게시글 정보가 없을 때
  else if (check_post.state === "존재하지않는게시글") return res.status(404).json(check_post);
  // 로그인돼있는 유저와 해당 게시물 작성 유저가 일치하지 않을 때
  else if (check_post.state === "접근권한없음") return res.status(403).json(check_post);
  // 해당 게시물 작성한 유저와 로그인한 유저가 일치할 때
  else if (check_post.state === "접근성공") {
    // 해당 인덱스의 게시글 정보 가져오는 모델
    const model_results = await post_model.getWriteModel(req.query.boardIndex, login_cookie, req.ip);
    // 모델 실행결과에 따른 분기처리
    // mysql query 메서드 실패
    if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
    // 해당 게시글 정보가 없을 때
    else if (model_results.state === "존재하지않는게시글") return res.status(404).json(model_results);
    // 성공적으로 게시글 정보 가져왔을 때
    else if (model_results.state === "게시글정보로딩") return res.status(200).json(model_results.data);
  }
};
// 2-3. 게시글 수정요청
const revisePost = async function (req, res) {
  /*
req.body
  category: 카테고리(자유게시판/공부인증샷)
  postTitle: 글제목
  postContent: 글내용
  tags: 태그배열
 */
  // 로그인 여부 검사
  const login_cookie = req.signedCookies.user;
  if (!login_cookie) return res.status(401).json({ state: "글을 수정하기 위해서는 로그인을 해야합니다." });

  // 해당 게시글이 존재하는지 확인하고 게시글에 대한 유저의 권한 체크
  const check_post = await check_data_or_authority_model.checkPostModel(req.query.boardIndex, login_cookie, req.ip);
  // mysql query 메서드 실패
  if (check_post.state === "mysql 사용실패") return res.status(500).json(check_post);
  // 해당 게시글 정보가 없을 때
  else if (check_post.state === "존재하지않는게시글") return res.status(404).json(check_post);
  // 로그인돼있는 유저와 해당 게시물 작성 유저가 일치하지 않을 때
  else if (check_post.state === "접근권한없음") return res.status(403).json(check_post);
  // 해당 게시물 작성한 유저와 로그인한 유저가 일치할 때
  else if (check_post.state === "접근성공") {
    if (!(req.body.category === "자유게시판" || req.body.category === "공부인증샷"))
      return res.status(404).json({ state: "존재하지않는카테고리" });
    // 게시글 수정 모델 실행 결과
    const model_results = await post_model.revisePost(req.body, req.query.boardIndex, login_cookie, req.ip);
    // mysql query 메서드 실패
    if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
    // 성공적으로 게시글 수정 요청 수행
    else if (model_results.state === "게시글수정") return res.status(200).end();
  }
};

// 2-4. 게시글 삭제하기
const deletePost = async function (req, res) {
  // req.query: boardIndex

  // 로그인 여부 검사
  const login_cookie = req.signedCookies.user;
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 해당 게시글이 존재하는지 확인하고 게시글에 대한 유저의 권한 체크
  const check_post = await check_data_or_authority_model.checkPostModel(req.query.boardIndex, login_cookie, req.ip);
  // mysql query 메서드 실패
  if (check_post.state === "mysql 사용실패") return res.status(500).json(check_post);
  // 해당 게시글 정보가 없을 때
  else if (check_post.state === "존재하지않는게시글") return res.status(404).json(check_post);
  // 로그인돼있는 유저와 해당 게시물 작성 유저가 일치하지 않을 때
  else if (check_post.state === "접근권한없음") return res.status(403).json(check_post);
  // 해당 게시물 작성한 유저와 로그인한 유저가 일치할 때
  else if (check_post.state === "접근성공") {
    // 해당 인덱스 게시글 삭제
    const model_results = await post_model.deletePostModel(req.query.boardIndex, login_cookie, req.ip);
    // mysql query 메서드 실패
    if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
    // 성공적으로 게시글 삭제 요청 수행
    else if (model_results.state === "게시글삭제") return res.status(204).end();
  }
};
// 3. 좋아요/검색기능
// 3-1. 게시글 좋아요 요청
const likePost = async function (req, res) {
  // req.query: boardIndex
  // 로그인 여부 검사
  const login_cookie = req.signedCookies.user;
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 좋아요 모델 실행 결과
  const model_results = await post_model.likePostModel(req.query.boardIndex, login_cookie, req.ip);
  // mysql query 메서드 실패
  if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
  // 좋아요를 이미 누른적이 있을 때
  else if (model_results.state === "좋아요 중복요청") return res.status(400).json(model_results);
  // 성공적으로 좋아요 요청 수행
  else if (model_results.state === "좋아요+1") return res.status(200).json(model_results);
};
// 3-2. 게시글 검색기능
const searchPost = async function (req, res) {
  /*
  req.body
    searchOption (ex. 제목만, 내용만, 닉네임, 제목 + 내용)
    searchContent (검색내용)
  req.params
    category (자유게시판/공부인증샷)
   */
  // 유효성 검사
  // params.category 잘못 입력했을 때
  if (!(req.params.category === "free-bulletin" || req.params.category === "proof-shot"))
    return res.status(404).json({ state: "존재하지않는카테고리" });
  // 검색 옵션이 올바르지 않을 때
  if (
    !(
      req.body.searchOption === "제목만" ||
      req.body.searchOption === "내용만" ||
      req.body.searchOption === "제목 + 내용" ||
      req.body.searchOption === "닉네임"
    )
  )
    return res.status(400).json({ state: "유효하지않은정보" });

  // req.category에 따라 DB 값과 비교할 값으로 변경해주기
  let req_category;
  if (req.params.category === "free-bulletin") req_category = "자유게시판";
  else if (req.params.category === "proof-shoot") req_category = "공부인증샷";
  // 검색 모델 실행 결과
  const model_results = await post_model.searchModel(req.body.searchOption, req.body.searchContent, req_category, req.ip);
  // mysql query 메서드 실패
  if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
  // 검색결과가 없을 때
  else if (model_results.state === "검색결과없음") return res.status(200).json(model_results);
  // 검색결과가 있을 때
  else if (model_results.state === "검색글정보") return res.status(200).json(model_results);
};

module.exports = {
  getRecentPost: getRecentPost,
  entireBoard: entireBoard,
  detailBoard: detailBoard,
  writePost: writePost,
  getWrite: getWrite,
  revisePost: revisePost,
  deletePost: deletePost,
  likePost: likePost,
  searchPost: searchPost,
};

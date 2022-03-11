// 홈화면의 라우터의 컨트롤러
// 로그인돼있는 예시 회원정보
const db = require("../a_mymodule/db");
const moment = require("../a_mymodule/date_time");
const mysql = require("mysql");
// 모델
const post_model = require("../model/post");
const user = {
  id: "Zoe",
  nickName: "Zoe",
  userIndex: 123123,
};
// 최신글 정보가져오기
const getRecentPost = function (req, res) {
  // 최신글 자유게시판 글 5개/공부인증샷 글 4개 불러오는 모델
  const model_results = post_model.getRecentPostModel(req.ip);
  /* TODO 비동기 공부 후 다시작성
  if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
  else if (model_results.state === "최신글정보") return res.status(200).json(model_results.data);
  
   */
};

// 모듈화
module.exports = {
  getRecentPost: getRecentPost,
};

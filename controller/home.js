// 홈화면의 라우터의 컨트롤러
const post_model = require("../model/post");

// 최신 자유게시판 글 5개/공부인증샷 글 4개 불러오기
const getRecentPost = function (req, res) {
  // 최신글 자유게시판 글 5개/공부인증샷 글 4개 불러오는 모델 실행결과
  const model_results = post_model.getRecentPostModel(req.ip);
  /* TODO 비동기 공부 후 다시작성
    // mysql query 메서드 실패
  if (model_results.state === "mysql 사용실패") return res.status(500).json(model_results);
  // 성공적으로 최신글 정보 가져왔을 때
  else if (model_results.state === "최신글정보") return res.status(200).json(model_results.data);
  
   */
};

// 모듈화
module.exports = {
  getRecentPost: getRecentPost,
};

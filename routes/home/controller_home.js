// 홈화면의 라우터의 컨트롤러

// 최신글 5개 불러오기
const getRecentPost = function (req, res) {
  // 예시 정보
  const maxData = {
    category: "자유게시판",
    maxIndex: 34, // < 자유게시판 카테고리에는 총 34개의 글이 있고 boardIndex가 30~34인 글을 유저에게 보여주면 되기 때문에 이 정보를 받아옴
  };

  const recentData = {
    category: maxData.category,
    post: [
      {
        title: "글제목1",
        category: "자유게시판",
        hits: "23",
        boardIndex: maxData.maxIndex,
      },
      {
        title: "글제목2",
        category: "자유게시판",
        hits: "3만",
        boardIndex: maxData.maxIndex - 1,
      },
      {
        title: "글제목3",
        category: "자유게시판",
        hits: "3천",
        boardIndex: maxData.maxIndex - 2,
      },
      {
        title: "글제목4",
        category: "자유게시판",
        hits: "274",
        boardIndex: maxData.maxIndex - 3,
      },
      {
        title: "글제목5",
        category: "자유게시판",
        hits: "30만",
        boardIndex: maxData.maxIndex - 4,
      },
    ],
  };

  res.status(200).send(recentData);
};
// 모듈화
module.exports = {
  getRecentPost: getRecentPost,
};

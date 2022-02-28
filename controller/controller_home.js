// 홈화면의 라우터의 컨트롤러

// 최신글 5개 불러오기
const getRecentPost = function (req, res) {
  // 예시 정보
  const maxDataFreeBoard = {
    category: "자유게시판",
    maxIndex: 34, // < 자유게시판 카테고리에는 총 34개의 글이 있고 boardIndex가 30~34인 글을 유저에게 보여주면 되기 때문에 이 정보를 받아옴
  };
  const maxDataProofShot = {
    category: "공부인증샷",
    maxIndex: 100, // < 공부인증샷 카테고리에는 총 100개의 글이 있고 boardIndex가 96~100인 글을 유저에게 보여주면 되기 때문에 이 정보를 받아옴
  };
  const recentData = [
    {
      category: maxDataFreeBoard.category,
      post: [
        {
          title: "글제목1",
          hits: "23",
          boardIndex: maxDataFreeBoard.maxIndex,
        },
        {
          title: "글제목2",
          hits: "3만",
          boardIndex: maxDataFreeBoard.maxIndex - 1,
        },
        {
          title: "글제목3",
          hits: "3천",
          boardIndex: maxDataFreeBoard.maxIndex - 2,
        },
        {
          title: "글제목4",
          hits: "274",
          boardIndex: maxDataFreeBoard.maxIndex - 3,
        },
        {
          title: "글제목5",
          hits: "30만",
          boardIndex: maxDataFreeBoard.maxIndex - 4,
        },
      ],
    },
    {
      category: maxDataProofShot.category,
      post: [
        {
          title: "글제목1",
          hits: "23",
          boardIndex: maxDataProofShot.maxIndex,
        },
        {
          title: "글제목2",
          hits: "3만",
          boardIndex: maxDataProofShot.maxIndex - 1,
        },
        {
          title: "글제목3",
          hits: "3천",
          boardIndex: maxDataProofShot.maxIndex - 2,
        },
        {
          title: "글제목4",
          hits: "274",
          boardIndex: maxDataProofShot.maxIndex - 3,
        },
        {
          title: "글제목5",
          hits: "30만",
          boardIndex: maxDataProofShot.maxIndex - 4,
        },
      ],
    },
  ];

  res.status(200).send(recentData);
};
// 모듈화
module.exports = {
  getRecentPost: getRecentPost,
};

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
          boardIndex: maxDataFreeBoard.maxIndex,
        },
        {
          title: "글제목2",
          boardIndex: maxDataFreeBoard.maxIndex - 1,
        },
        {
          title: "글제목3",
          boardIndex: maxDataFreeBoard.maxIndex - 2,
        },
        {
          title: "글제목4",
          boardIndex: maxDataFreeBoard.maxIndex - 3,
        },
        {
          title: "글제목5",
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
      ],
    },
  ];

  res.status(200).json(recentData);
};

// 내가 관심도서관으로 등록한 도서관 정보
const myLibData = function (req, res) {
  /*
  예시 user 정보
  {
  nickName :"Zoe",
  myLib : [{ libIndex : 14213}, {libIndex :3} ] // 등록된 libIndex의 도서관 정보 서버에서 응답해주기
  }
   */
  // 예시 도서관 정보
  const my_lib = [
    {
      libIndex: 14213,
      libName: "늘푸른도서관",
      libType: "작은도서관",
      close: "토요일",
      openHourWeekday: "09:00~21:00",
      openHourSaturday: "00:00~00:00", // 열지 않음
      openHourHoliday: "09:00~18:00",
      grade: "3.7/5",
      address: "광주광역시 남구 독립로 70-1",
      phoneNumber: "0621234567",
    },
    {
      libIndex: 3,
      libName: "일가도서관",
      libType: "공공도서관",
      close: "매주 일요일 및 국가지정 공휴일",
      openHourWeekday: "09:00~21:00",
      openHourSaturday: "09:00~18:00",
      openHourHoliday: "00:00~00:00", // 열지 않음
      grade: "3.7/5",
      address: "하남시 ~구 ~~로 ",
      phoneNumber: "0621234567",
    },
  ];
  res.status(200).json(my_lib);
};

// 모듈화
module.exports = {
  getRecentPost: getRecentPost,
  myLibData: myLibData,
};

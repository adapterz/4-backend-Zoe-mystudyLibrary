// 로그인화면의 라우터의 컨트롤러
// 내가 작성한 정보
// 내가 작성한 포스팅 데이터
const myPost = function (req, res) {
  // 닉네임을 연결고리로 데이터 찾아오기 ->예시 데이터
  const my_post = [
    {
      boardIndex: 12312,
      title: "글제목",
      category: "자유게시판",
      hits: "1억",
      favorite: "2300만",
      created: "2022-02-28",
    },
    {
      boardIndex: 1241254,
      title: "글제목",
      category: "공부인증샷",
      hits: "1억",
      favorite: "2300만",
      created: "2022-02-28",
    },
  ];

  res.status(200).json(my_post);
};
// 내가 작성한 댓글 데이터
const myComment = function (req, res) {
  // 닉네임을 연결고리로 데이터 찾아오기 ->예시 데이터
  const my_comment = [
    {
      boardIndex: 12312,
      category: "자유게시판",
      title: "글제목",
      created: "2022-02-28",
      commentIndex: 15,
      comments: "댓글내용입니다.",
    },
    {
      boardIndex: 1241254,
      category: "공부인증샷",
      title: "글제목",
      created: "2022-02-28",
      commentIndex: 1,
      comments: "댓글내용입니다.",
    },
  ];

  res.status(200).json(my_comment);
};
// 내가 작성한 후기 데이터
const myEpilogue = function (req, res) {
  // 닉네임을 연결고리로 데이터 찾아오기 ->예시 데이터
  const my_epilogue = [
    {
      libName: "늘푸른도서관",
      nickName: "Zoe",
      created: "2022-02-28",
      commentIndex: 15,
      comments: "후기내용입니다.",
      photo: "사진 url",
    },
    {
      libName: "아주대도서관",
      nickName: "yeji",
      created: "2022-02-28",
      commentIndex: 1,
      comments: "후기내용입니다.",
      photo: "사진 url",
    },
  ];

  res.status(200).json(my_epilogue);
};

// 모듈화
module.exports = {
  myPost: myPost,
  myComment: myComment,
  myEpilogue: myEpilogue,
};

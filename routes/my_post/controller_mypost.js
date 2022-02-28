// 로그인화면의 라우터의 컨트롤러

// 예시 글 목록
const boards = [
  {
    index: 1,
    nickName: "닉네임1",
    category: "자유게시판",
    title: "글제목1",
    content: "글내용1",
    tags: ["태그1-1", "태그1-2"],
    created: "2022-02-24",
    comments: [{ user_id: "댓글1-1" }, { user_id: "댓글1-2" }, { user_id: "댓글1-3" }],
  },
  {
    index: 2,
    nickName: "닉네임2",
    category: "공부인증샷",
    title: "글제목2",
    content: "글내용2",
    tags: ["태그2-1", "태그2-2"],
    created: "2022-02-24",
    comments: [{ user_id: "댓글2-1" }, { user_id: "댓글2-2" }, { user_id: "댓글2-3" }],
  },
  {
    index: 3,
    nickName: "닉네임3",
    category: "자유게시판",
    title: "글제목3",
    content: "글내용3",
    tags: ["태그3-1", "태그3-2"],
    created: "2022-02-24",
    comments: [{ user_id: "댓글3-1" }, { user_id: "댓글3-2" }, { user_id: "댓글3-3" }],
  },
];
// 내가 작성한 글 데이터
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
// 선택 글 삭제
const deletePost = function (req, res) {
  // 체크박스에 체크된 게시물 바디로 보내면 삭제해주기

  //예시 바디
  /*
    const checked_post = [
      {
        category: "자유게시판",
        boardIndex: 12123,
      },
      {
        category: "공부게시판",
        boardIndex: 1425,
      },
    ];
  위의 포스팅 삭제요청
   */

  // const checked_post = req.body;
  // 성공적으로 삭제
  res.status(204).end();
};
// 선택 댓글 삭제
const deleteComment = function (req, res) {
  // 체크박스에 체크된 댓글 정보 배열로 가져와서 삭제해주기

  // 예시바디
  /*

    const checked_comment = [
      {
        category: "자유게시판",
        boardIndex: 123123,
        commentIndex: 12,
      },
      {
        category: "공부게시판",
        boardIndex: 1425,
        commentIndex : 43,
      },
    ];
  위의 댓글 삭제 요청
   */
  // 성공적으로 삭제
  res.status(204).end();
};
// 후기 삭제
const deleteEpilogue = function (req, res) {
  // 예시바디
  /*

    const checked_epilogue = [
      {
        libName: "늘푸른도서관",
        epilogueIndex: 123123,
      },
      {
        libName: "아주대도서관",
        epilogueIndex: 123,
      },
    ];
  위의 후기 삭제 요청
   */
  // 성공적으로 삭제
  res.status(204).end();
};

// 모듈화
module.exports = {
  myPost: myPost,
  myComment: myComment,
  myEpilogue: myEpilogue,
  deletePost: deletePost,
  deleteComment: deleteComment,
  deleteEpilogue: deleteEpilogue,
};

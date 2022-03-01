// 자유게시판 라우터의 컨트롤러
// 유효성 검사 모듈
const { validationResult } = require("express-validator");
// 로그인돼있는 예시 회원정보
const user = {
  nickName: "Zoe",
  userIndex: 123123,
};
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
    comments: [
      { nickName: "Zoe", contents: "댓글1-1" },
      { nickName: "Zoe", contents: "댓글1-2" },
      { nickName: "Zoe", contents: "댓글1-3" },
    ], // TODO DB 설계시 좋아요, likeUser 항목 추가, myLib 항목 추가
  },
  {
    index: 2,
    nickName: "닉네임2",
    category: "공부인증샷",
    title: "글제목2",
    content: "글내용2",
    tags: ["태그2-1", "태그2-2"],
    created: "2022-02-24",
    comments: [
      { nickName: "Zoe", contents: "댓글1-1" },
      { nickName: "Zoe", contents: "댓글1-2" },
      { nickName: "Zoe", contents: "댓글1-3" },
    ],
  },
  {
    index: 3,
    nickName: "닉네임3",
    category: "자유게시판",
    title: "글제목3",
    content: "글내용3",
    tags: ["태그3-1", "태그3-2"],
    created: "2022-02-24",
    comments: [
      { nickName: "Zoe", contents: "댓글1-1" },
      { nickName: "Zoe", contents: "댓글1-2" },
      { nickName: "Zoe", contents: "댓글1-3" },
    ],
  },
];

// 전체 게시물 보기
const entireBoard = function (req, res) {
  // TODO
  // DB 에서 글 정보 가져오기 -> 카테고리(자유게시판인지 공부인증샷인지에 따라 불러오기)
  // const boards = DB 에서 가져오기(전체)
  const example_boards = [
    {
      boardIndex: 1,
      nickName: "Zoe",
      category: "자유게시판",
      title: "글제목",
      hits: "3",
      created: "2022-02-28",
    },
    {
      boardIndex: 2,
      nickName: "Zoe",
      category: "자유게시판",
      title: "글제목",
      hits: "3",
      created: "2022-02-28",
    },
    {
      boardIndex: 3,
      nickName: "Zoe",
      category: "자유게시판",
      title: "글제목",
      hits: "3",
      created: "2022-02-28",
    },
  ];
  res.status(200).json(example_boards);
};
// 게시물 상세보기
const detailBoard = function (req, res) {
  // TODO
  // 게시글인덱스에 따른 정보 가져오기
  const example_board = {
    boardIndex: 1,
    nickName: "Zoe",
    category: "자유게시판",
    title: "게시물 제목",
    created: "2022-02-28",
    hits: 23,
    contents: "게시물 내용",
    tags: ["태그1", "태그2"],
    comments: [
      { commentsIndex: 1, commentsContents: "댓글1 내용" },
      { commentsIndex: 2, commentsContents: "댓글2 내용" },
    ],
  };

  // const boards = DB 에서 가져오기(id 참조)
  res.status(200).json(example_board);
};

// 게시글 쓰기
const writePost = function (req, res) {
  /*
예시 데이터
body: {
  boardIndex: 자동배정되는 게시물인덱스,

  nickName:닉네임

  title:게시물제목,

  category:카테고리,

  content:글내용,

  tags:[태크1,태그2]

  created:글작성날짜

  })

 */
  // 로그인 여부 검사
  if (user.userIndex === null) return res.status(401).json({ state: "좋아요를 누르기 위해서는 로그인을 해야합니다." });

  // 글자 수 제한 등은 html 로 가능
  res.status(201).end();
};

// 게시글 수정하기
const revisePost = function (req, res) {
  // 라우터에서 정의한 유효성 검사결과
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ state: "유효하지 않은 데이터입니다." });
  // 수정된 정보
  const revised_posting = req.body;
  // 로그인 여부 검사
  if (user.userIndex === null) return res.status(401).json({ state: "좋아요를 누르기 위해서는 로그인을 해야합니다." });
  /*
   body: {
    title:바뀐 게시물제목,

    content:바뀐 글내용,

    tags:[태크1,태그2]

    })
  
   */

  res.status(200).json(revised_posting);
};

// 게시글 삭제하기
const deletePost = function (req, res) {
  res.status(204).end();
};

// 댓글 작성
const writeComment = function (req, res) {
  // 라우터에서 정의한 유효성 검사결과
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ state: "유효하지 않은 데이터입니다." });
  /*
  예시 댓글 정보
 const comment_data = {
   nickName: "Zoe",
   comments: "댓글댓글",
   commentsIndex: 1, //"자동으로부여되는 인덱스"
 };

    */
  const comment_data = req.body;
  // 로그인이 안 돼있을 때
  if (user.userIndex === null) return res.status(401).json({ state: "인증되지 않은 사용자입니다. " });

  res.status(201).json(comment_data);
};

// 댓글 삭제
const deleteComment = function (req, res) {
  // 로그인 여부 검사
  if (user.userIndex === null) return res.status(401).json({ state: "좋아요를 누르기 위해서는 로그인을 해야합니다." });
  res.status(204).end();
};

// 좋아요 기능 -> 고민: 유저측에서 관리를 할지, 해당 게시물측에서 관리할지?
// 게시물이 삭제될 경우에 유저 측의 정보를 따로 삭제해주는 기능을 구현해줘야하기 때문에 게시글 측에서 관리하기로 결정.
// 예시 게시글 정보
/*
{
category : "자유게시판",
boardIndex : 134,
likeUser : [{ nickName : "Zoe"}, { nickName : "yeji" }] //< 해당 게시글에 좋아요를 누른 유저 목록

}
 */
const likePost = function (req, res) {
  // 로그인 여부 검사
  if (user.userIndex === null) return res.status(401).json({ state: "좋아요를 누르기 위해서는 로그인을 해야합니다." });
  // 예시 해당 게시글 정보
  const thisPost = {
    category: "자유게시판",
    boardIndex: 134,
    likeUsers: [{ nickName: "Zoe" }, { nickName: "yeji" }], //< 해당 게시글에 좋아요를 누른 유저 목록
    likeCnt: 123, //좋아요 횟수
  };
  // 해당 유저가 해당 게시글의 좋아요를 누른 적 있는지 확인
  for (const likeUser of thisPost.likeUsers) {
    if (user.nickName === likeUser.nickName) return res.status(400).json({ state: "이미 해당 게시글의 '좋아요'를 눌렀습니다" });
  }
  // 좋아요 1 증가.
  ++thisPost.likeCnt;

  res.status(200).end();
};
// TODO
// 검색기능

module.exports = {
  entireBoard: entireBoard,
  detailBoard: detailBoard,
  writePost: writePost,
  revisePost: revisePost,
  deletePost: deletePost,
  writeComment: writeComment,
  deleteComment: deleteComment,
  likePost: likePost,
};

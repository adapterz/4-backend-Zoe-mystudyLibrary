// 자유게시판 라우터의 컨트롤러

// 예시 글 목록
const boards = [
  {
    id: 1,
    name: "닉네임1",
    category: "자유게시판",
    title: "글제목1",
    content: "글내용1",
    tags: ["태그1-1", "태그1-2"],
    created: "2022-02-24",
    comments: [
      { user_id: "댓글1-1" },
      { user_id: "댓글1-2" },
      { user_id: "댓글1-3" },
    ],
  },
  {
    id: 2,
    name: "닉네임2",
    category: "공부인증샷",
    title: "글제목2",
    content: "글내용2",
    tags: ["태그2-1", "태그2-2"],
    created: "2022-02-24",
    comments: [
      { user_id: "댓글2-1" },
      { user_id: "댓글2-2" },
      { user_id: "댓글2-3" },
    ],
  },
  {
    id: 3,
    name: "닉네임3",
    category: "자유게시판",
    title: "글제목3",
    content: "글내용3",
    tags: ["태그3-1", "태그3-2"],
    created: "2022-02-24",
    comments: [
      { user_id: "댓글3-1" },
      { user_id: "댓글3-2" },
      { user_id: "댓글3-3" },
    ],
  },
];

// model 객체
const model_post = require("/model/post");

// 전체 게시물 보기
const get_free_bulletin_board = function (req, res) {
  // TODO
  // DB 에서 글 정보 가져오기(현재는 예시, DB 관련 공부 후 코드 다시 짜기)
  // const boards = DB 에서 가져오기(전체)
  res.status(200).json(boards);
};
// 게시물 상세보기
const get_detail_elements_of_board = function (req, res) {
  // TODO
  // DB 에서 글 정보 가져오기(현재는 예시, DB 관련 공부 후 코드 다시 짜기)
  const boards_id = req.params.id;

  // const boards = DB 에서 가져오기(id 참조)
  res.status(200).json(boards[boards_id - 1]);
};

// 게시글 작성 페이지 보기
const get_write_page = function (req, res) {
  // write page 나중에 바꿔주기
  const write_page = {
    title: "제목을 입력해주세요",
    content: "내용을 입력해주세요",
    tags: "# 태그 달기(최대 5개)",
  };
  res.status(200).json(write_page);
};

// 게시글 쓰기
const write_posting = function (req, res) {
  // 작성한 정보 가져오기
  const new_posting = req.body;
  // 게시글 목록에 추가
  const can_post = model_post.can_post(
    new_posting.title.toString(),
    new_posting.category.toString(),
    new_posting.content.toString(),
    new_posting.id.toString(),
    new_posting.name.toString(),
    new_posting.tags.toString(),
    new_posting.created.toString()
  );
  // 유효성 검사 실패
  if (!can_post) {
    const fail = { state: "유효하지 않은 작성글" };
    res.status(200).json(new_posting + fail);
    // 포스팅 성공
  } else if (can_post) {
    res.status(201).redirect("/free_bulletin_board/" + new_posting.id);
  }
};

// 게시글 수정창 열기
const get_revise = function (req, res) {
  // 게시글 id
  // const posting_id = req.params.id;

  // 기존 게시물 글제목/글내용/태그 등 받아와서 텍스트필드에 넣어주기
  // const post = model_post.revise(posting_id);
  // view(post);
  const revised_page = {
    title: "기존 제목 불러오기",
    content: "기존 내용 불러오기",
    tags: "# 기존 태그 불러오기",
  };

  res.status(200).json(revised_page);
};

// 게시글 수정하기
const revise_posting = function (req, res) {
  // 수정된 정보 가져오기
  const revised_posting = req.body;
  // 기존 게시글 수정
  /*


  model_post.revise_post(
    revised_posting.title.toString(),
    revised_posting.content.toString(),
    revised_posting.id.toString(),
    revised_posting.name.toString(),
    revised_posting.tags.toString()
  );
 */
  res.status(200).json(revised_posting);
};

// 게시글 삭제하기
const delete_posting = function (req, res) {
  // 삭제할 게시글 id 받아오기
  const delete_posting_id = req.params.id;
  // 게시글 삭제
  model_post.delete_post(delete_posting_id.toString());

  res.status(200).redirect("/free_bulletin_board");
};

// 댓글창 불러오기
const get_comment = function (req, res) {
  // 게시글 id
  const post_id = req.params.id;
  // 해당 게시글 정보
  const post = boards[post_id - 1];
  // 댓글 창
  const comments_page = { comments: "댓글" };

  res.status(200).json(post + comments_page);
};
// 댓글 작성
const post_comment = function (req, res) {
  // 게시글 id
  const post_id = req.params.id;
  // 유저 id (DB 배운 후에)
  const user_id = null;
  // 작성한 정보 가져오기
  req.body.comment = null; //임시정의
  const new_comment = req.body.comment;
  // 해당 게시물의 댓글 목록에 추가
  model_post.post_comment(user_id, new_comment, post_id);
  // 해당 게시글 정보
  const post = boards[post_id - 1];
  // 댓글 창
  const comments_page = { comments: new_comment };

  res.status(201).json(post + comments_page);
};

// 댓글 삭제
const delete_comment = function (req, res) {
  // 게시글 id
  const post_id = req.params.id;
  // 유저 아이디 (받아오기)
  const user_id = null;
  // 댓글 삭제
  model_post.delete_post(post_id, user_id);
  // 해당 게시글 정보
  const post = boards[post_id - 1];
  res.status(200).json(post);
};

// TODO
// 검색기능

module.exports = {
  get_free_bulletin_board: get_free_bulletin_board,
  get_detail_elements_of_board: get_detail_elements_of_board,
  get_write_page: get_write_page,
  write_posting: write_posting,
  get_revise: get_revise,
  revise_posting: revise_posting,
  delete_posting: delete_posting,
  get_comment: get_comment,
  post_comment: post_comment,
  delete_comment: delete_comment,
};

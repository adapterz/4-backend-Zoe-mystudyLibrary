// 공부인증샷 창의 라우터의 컨트롤러
// model 객체
const model_post = require("/model/post");

// 예시 글 목록
const boards = [
  {
    id: 3,
    name: "닉네임3",
    title: "글제목3",
    content: "글내용3",
    tags: ["태그3-1", "태그3-2"],
    created: "2022-02-24",
  },
  {
    id: 2,
    name: "닉네임2",
    title: "글제목2",
    content: "글내용2",
    tags: ["태그2-1", "태그2-2"],
    created: "2022-02-24",
  },
  {
    id: 1,
    name: "닉네임1",
    title: "글제목1",
    content: "글내용1",
    tags: ["태그1-1", "태그1-2"],
    created: "2022-02-24",
  },
];
// 전체 게시물 보기
const get_study_proof_shot = function (req, res) {
  // TODO
  // DB에서 글 정보 가져오기(현재는 예시, DB 관련 공부 후 코드 다시 짜기)
  // const boards = DB에서 가져오기(전체)
  res.send(boards);
};
// 상세보기
const get_detail_elements_of_board = function (req, res) {
  // TODO
  // DB에서 글 정보 가져오기(현재는 예시, DB 관련 공부 후 코드 다시 짜기)
  // const id = req.params.id;

  // const boards = DB에서 가져오기(id참조)
  res.status(200).send(boards);
};

// 게시글 작성 페이지 보기
const get_write_page = function (req, res) {
  // TODO
  // write page 나중에 바꿔주기
  const write_page = null;
  res.status(200).send(write_page);
};

// 게시글 쓰기
const write_posting = function (req, res) {
  // 작성한 정보 가져오기
  const new_posting = req.body;
  // 게시글 목록에 추가
  const can_post = model_post.can_post(
    new_posting.title.toString(),
    new_posting.content.toString(),
    new_posting.id.toString(),
    new_posting.name.toString(),
    new_posting.tags.toString(),
    new_posting.created.toString()
  );
  // 유효성 검사 실패
  if (!can_post) {
    res.status(400).send("유효하지 않은 작성 글");
    // 포스팅 성공
  } else if (can_post) {
    res.status(201).redirect("/study_proof_shot");
  }
};

// 게시글 수정하기
const revise_posting = function (req, res) {
  // 수정한 정보 가져오기
  const revised_posting = req.body;
  // 기존 게시글 수정
  model_post.revise_post(
    revised_posting.title.toString(),
    revised_posting.content.toString(),
    revised_posting.id.toString(),
    revised_posting.name.toString(),
    revise_posting.tags.toString()
  );

  res.status(200).send("게시글 수정");
};

// 게시글삭제하기
const delete_posting = function (req, res) {
  // 삭제할 게시글 id 받아오기
  const delete_posting_id = req.params.id;
  // 게시글 삭제
  model_post.delete_post(delete_posting_id.toString());

  res.status(200).send("게시글 삭제");
};
// TODO
// 댓글쓰기, 검색기능

// 모듈화
module.exports = {
  get_study_proof_shot: get_study_proof_shot,
  get_detail_elements_of_board: get_detail_elements_of_board,
  get_write_page: get_write_page,
  write_posting: write_posting,
  revise_posting: revise_posting,
  delete_posting: delete_posting,
};

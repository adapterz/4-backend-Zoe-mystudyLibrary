// 공부인증샷 창의 라우터의 컨트롤러

// 예시 글 목록
const { is_valid_post } = require("../../service/post");
const boards = [
  {
    id: 3,
    name: "닉네임3",
    title: "글제목3",
    content: "글내용3",
    created: "2022-02-24",
  },
  {
    id: 2,
    name: "닉네임2",
    title: "글제목2",
    content: "글내용2",
    created: "2022-02-24",
  },
  {
    id: 1,
    name: "닉네임1",
    title: "글제목1",
    content: "글내용1",
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
// 게시물 상세보기
const get_detail_elements_of_board = function (req, res) {
  // TODO
  // DB에서 글 정보 가져오기(현재는 예시, DB 관련 공부 후 코드 다시 짜기)
  // const id = req.params.id;

  // const boards = DB에서 가져오기(id참조)
  res.send(boards);
};

// 게시글 작성 페이지 보기
const get_write_page = function (req, res) {
  // TODO
  // write page 나중에 바꿔주기
  const write_page = null;
  res.send(write_page);
};

// 게시글 쓰기
const write_posting = function (req, res) {
  // 고민: 게시글 유효성 검사 추가해야하나? (제목/글자 수 0 일 때, 설정 글자 수 넘겼을 때 등)
  // 작성한 정보 가져오기
  const new_posting = req.body;
  // 게시글 목록에 추가
  const case_post = is_valid_post(
    new_posting.title.toString(),
    new_posting.content.toString(),
    new_posting.id.toString(),
    new_posting.name.toString(),
    new_posting.created.toString()
  );
  if (case_post === 0) {
    res.send("제목은 2글자 이상 50글자 이하입니다.");
  } else if (case_post === 1) {
    res.send("글 내용은 2글자 이상 5000글자 이하입니다.");
  } else if (case_post == 2) {
    // 작성 완료 후 게시글 목록으로 가기
    res.redirect("/free_bulletin_board");
  }
};

// TODO
// 댓글쓰기, 검색기능

// 모듈화
module.exports = {
  get_study_proof_shot: get_study_proof_shot,
  get_detail_elements_of_board: get_detail_elements_of_board,
  get_write_page: get_write_page,
  write_posting: write_posting,
};

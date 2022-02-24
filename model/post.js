// 게시글 관련 model

const business_logic = require("/service/post");

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

function can_post(
  input_title,
  input_content,
  input_id,
  input_name,
  input_tags,
  input_created
) {
  if (!business_logic.is_valid_title(input_title)) return false;
  if (!business_logic.is_valid_content(input_content)) return false;

  // 유효성 검사 통과하면 작성한 글을 게시글 목록에 추가
  const new_post = {
    id: input_id,
    name: input_name,
    title: input_title,
    content: input_content,
    tags: input_tags,
    created: input_created,
  };
  boards.push(new_post);
  return true;
}

function revise_post(
  input_title,
  input_content,
  input_id,
  input_name,
  input_tags
) {
  if (!business_logic.is_valid_title(input_title)) return false;
  if (!business_logic.is_valid_content(input_content)) return false;
  let this_index = null;
  // 유효성 검사 통과 시 글 수정 (날짜와 id는 변경x)
  for (const index of boards) {
    if (input_id === boards[index].id) {
      this_index = index;
      break;
    }
  }

  boards[this_index].title = input_title;
  boards[this_index].content = input_content;
  boards[this_index].name = input_name;
  boards[this_index].tags = input_tags;
}

function delete_post(input_id) {
  let this_index = null;
  // 해당 게시글의 index 찾기
  for (const index of boards) {
    if (input_id === boards[index].id) {
      this_index = index;
      break;
    }
  }
  // 게시글 삭제
  boards[this_index].pop();
}
// 모듈화
module.exports = {
  can_post: can_post,
  revise_post: revise_post,
  delete_post: delete_post,
};

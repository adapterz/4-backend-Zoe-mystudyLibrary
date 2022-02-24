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

function is_valid_post(
  input_title,
  input_content,
  input_id,
  input_name,
  input_tags,
  input_created
) {
  if (!business_logic.is_valid_title(input_title)) return 0;
  if (!business_logic.is_valid_content(input_content)) return 1;

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
  return 2;
}
// 모듈화
module.exports = {
  is_valid_post: is_valid_post,
};

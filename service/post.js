// 게시글 관련 비즈니스 로직

// 예시 글 목록
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

// 게시글 유효성 검사
// 1. 제목이 2글자 이상, 50글자 이하인가
// 2. 글 내용이 2글자 이상, 5000글자 이하 인가
function is_valid_title(input_title) {
  // 2글자 미만, 50글자 초과면 유효하지 않은 제목
  const title_len = input_title.length;
  if (title_len < 2 || title_len > 50) return false;
  // 이외의 경우는 유효
  return true;
}

function is_valid_content(input_content) {
  // 2글자 미만, 5000글자 초과면 유효하지 않은 내용
  const content_len = input_content.length;
  if (content_len < 2 || content_len > 5000) return false;
  // 이외 경우는 유효
  return true;
}

export function is_valid_post(
  input_title,
  input_content,
  input_id,
  input_name,
  input_created
) {
  if (!is_valid_title(input_title)) return 0;
  if (!is_valid_content(input_content)) return 1;

  // 유효성 검사 통과하면 작성한 글을 게시글 목록에 추가
  const new_post = {
    id: input_id,
    name: input_name,
    title: input_title,
    content: input_content,
    created: input_created,
  };
  boards.push(new_post);
  return 2;
}

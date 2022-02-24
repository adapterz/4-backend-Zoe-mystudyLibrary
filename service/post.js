// 게시글 관련 비즈니스 로직

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

// 모듈화
module.exports = {
  is_valid_title: is_valid_title,
  is_valid_content: is_valid_content,
};

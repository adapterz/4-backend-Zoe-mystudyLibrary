// 선택 게시글 삭제
const deletePost = function (req, res) {
  // 체크박스에 체크된 게시물 바디로 보내면 삭제해주기
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
   */

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
  res.status(204).end();
};

// 모듈화
module.exports = {
  deletePost: deletePost,
  deleteComment: deleteComment,
  deleteEpilogue: deleteEpilogue,
};

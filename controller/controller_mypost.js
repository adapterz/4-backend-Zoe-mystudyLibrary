// 로그인화면의 라우터의 컨트롤러
// mysql 모듈
const mysql = require("mysql");
// 로그인돼있는 예시 회원정보
const db = require("../a_mymodule/db");
const moment = require("../a_mymodule/date_time");
const user = {
  userIndex: 123123,
  nickName: "Zoe",
  id: "yeji1919",
};
// 내가 작성한 정보
// 내가 작성한 포스팅 데이터
// 이 페이지 전체 TODO 로그인 기능 배운 뒤 다시 작성
const myPost = function (req, res) {
  const login_cookie = req.signedCookies.user;
  // 로그인 여부 검사
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 해당 유저가 작성한 게시글 정보 가져오기
  const query =
    "SELECT boardIndex,postTitle,created,hits,favorite,category FROM BOARDS WHERE deleteDate IS NULL AND userIndex = " +
    mysql.escape(user.userIndex);
  // 쿼리문 실행
  db.db_connect.query(query, function (err, results) {
    if (err) {
      console.log(("myPost 메서드 자유게시판 mysql 모듈사용 실패:" + err).red.bold);
      return res.status(500).json({ state: "myPost 메서드 자유게시판 mysql 모듈사용 실패:" + err });
    }
    console.log(("CLIENT IP: " + req.ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + query).blue.bold);
    // 데이터가 없을 때 보여줄 페이지
    if (results[0] === undefined) return res.status(200).json({ state: "등록된 글이 없습니다." });

    // 성공적으로 데이터 전달
    return res.status(200).json(results);
  });
};
// 내가 작성한 댓글 데이터
const myComment = function (req, res) {
  const login_cookie = req.signedCookies.user;
  // 로그인 여부 검사
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 해당 유저가 작성한 후기 정보 가져오기
  const query =
    "SELECT COMMENTS.commentIndex,COMMENTS.commentContent,COMMENTS.created,BOARDS.postTitle FROM COMMENTS INNER JOIN BOARDS ON COMMENT.boardIndex =BOARDS.boardIndex WHERE BOARDS.deleteDate IS NULL AND COMMENTS.deleteDate IS NULL AND COMMENTS.userIndex=" +
    mysql.escape(user.userIndex);
  // 쿼리문 실행
  db.db_connect.query(query, function (err, results) {
    if (err) {
      console.log(("myComment 메서드 mysql 모듈사용 실패:" + err).red.bold);
      return res.status(500).json({ state: "myComment 메서드 자유게시판 mysql 모듈사용 실패:" + err });
    }
    console.log(("CLIENT IP: " + req.ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + query).blue.bold);
    // 데이터가 없을 때 보여줄 페이지
    if (results[0] === undefined) return res.status(200).json({ state: "등록된 댓글이 없습니다." });

    // 성공적으로 데이터 전달
    return res.status(200).json(results);
  });
};
// 내가 작성한 도서관 이용 후기 데이터
const myReview = function (req, res) {
  const login_cookie = req.signedCookies.user;
  // 로그인 여부 검사
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 해당 유저가 작성한 후기 정보 가져오기
  const query =
    "SELECT REVIEW.reviewContent,REVIEW.created,REVIEW.grade,LIBRARY.libName FROM REVIEW INNER JOIN LIBRARY ON REVIEW.libIndex = LIBRARY.libIndex WHERE REVIEW.deleteDate IS NULL AND LIBRARY.deleteDate IS NULL AND REVIEW.userIndex=" +
    mysql.escape(user.userIndex);
  // 쿼리문 실행
  db.db_connect.query(query, function (err, results) {
    if (err) {
      console.log(("myReview 메서드 mysql 모듈사용 실패:" + err).red.bold);
      return res.status(500).json({ state: "myReview 메서드 자유게시판 mysql 모듈사용 실패:" + err });
    }
    console.log(("CLIENT IP: " + req.ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + query).blue.bold);
    // 데이터가 없을 때 보여줄 페이지
    if (results[0] === undefined) return res.status(200).json({ state: "등록된 후기가 없습니다." });

    // 성공적으로 데이터 전달
    return res.status(200).json(results);
  });
};

// TODO 로그인 배운 후 다시 작성
// 선택 게시글 삭제
const deletePost = function (req, res) {
  const login_cookie = req.signedCookies.user;
  // 로그인 여부 검사
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 해당 인덱스 게시글 삭제
  const query =
    "UPDATE BOARDS SET deleteDate = " +
    mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
    " WHERE boardIndex = " +
    mysql.escape(req.query.boardIndex);
  // 쿼리문 실행
  db.db_connect.query(query, function (err) {
    // 오류 발생
    if (err) {
      console.log(("deletePost 메서드 mysql 모듈사용 실패:" + err).red.bold);
      return res.status(500).json({ state: "deletePost 메서드 mysql 모듈사용 실패:" + err });
    }
    // 정상적으로 쿼리문 실행(게시글 삭제)
    console.log(("CLIENT IP: " + req.ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + query).blue.bold);
    return res.status(204).end();
  });
};
// 선택 댓글 삭제
const deleteComment = function (req, res) {
  const login_cookie = req.signedCookies.user;
  // 로그인 여부 검사
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 댓글 삭제 쿼리문
  const query =
    "UPDATE COMMENTS SET deleteDate = " +
    mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
    " WHERE commentIndex = " +
    mysql.escape(req.query.commentIndex);

  db.db_connect.query(query, function (err) {
    // 오류 발생
    if (err) {
      console.log(("deleteComment 메서드 mysql 모듈사용 실패:" + err).red.bold);
      return res.status(500).json({ state: "deleteComment 메서드 mysql 모듈사용 실패:" + err });
    }
    // 정상적으로 쿼리문 실행(댓글 삭제)
    console.log(("CLIENT IP: " + req.ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + query).blue.bold);
    return res.status(204).end();
  });
};
// 도서관 후기 삭제
const deleteReview = function (req, res) {
  const login_cookie = req.signedCookies.user;
  // 로그인 여부 검사
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  const query =
    "UPDATE REVIEW SET deleteDate=" +
    mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
    "  WHERE reviewIndex = " +
    mysql.escape(req.query.reviewIndex);

  // 오류 발생
  db.db_connect.query(query, function (err) {
    if (err) {
      console.log(("deleteReview 메서드 mysql 모듈사용 실패:" + err).red.bold);
      return res.status(500).json({ state: "deleteReview 메서드 mysql 모듈사용 실패:" + err });
    }
    // 정상적으로 쿼리문 실행(후기 삭제)
    console.log(("CLIENT IP: " + req.ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + query).blue.bold);
    return res.status(204).end();
  });
};

// 모듈화
module.exports = {
  myPost: myPost,
  myComment: myComment,
  myReview: myReview,
  deletePost: deletePost,
  deleteComment: deleteComment,
  deleteReview: deleteReview,
};

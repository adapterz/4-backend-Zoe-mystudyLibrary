// 자유게시판 라우터의 컨트롤러
// 유효성 검사 모듈
const db = require("../a_mymodule/db");
const moment = require("../a_mymodule/date_time");
const mysql = require("mysql");
// 로그인돼있는 예시 회원정보
const user = {
  id: "Zoe",
  nickName: "Zoe",
  userIndex: 123123,
};
// 전체 게시물 보기
const entireBoard = function (req, res) {
  // 게시글 정보 모두 가져오기
  let req_category;
  if (req.params.category === "free-bulletin") req_category = "자유게시판";
  if (req.params.category === "proof-shot") req_category = "공부인증샷";
  const query =
    "SELECT boardIndex,postTitle,created,hits,favorite,category,nickName FROM BOARDS LEFT JOIN USER ON BOARDS.userIndex = User.userIndex WHERE BOARDS.deleteDate IS NULL AND category =" +
    mysql.escape(req_category);
  // 쿼리문 실행
  db.db_connect.query(query, function (err, results) {
    if (err) {
      console.log(("entireBoard 메서드 mysql 모듈사용 실패:" + err).red.bold);
      return res.status(500).json({ state: "entireBoard 메서드 mysql 모듈사용 실패:" + err });
    }
    console.log(("CLIENT IP: " + req.ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + query).blue.bold);
    return res.status(200).json(results);
  });
};

// 게시물 상세보기
const detailBoard = function (req, res) {
  // 해당 인덱스의 게시글/태그 가져오기, 조회수 1증가
  const query =
    "SELECT boardIndex,postTitle,postContent,created,hits,favorite,nickName FROM BOARDS LEFT JOIN USER ON BOARDS.userIndex = USER.userIndex WHERE BOARDS.deleteDate IS NULL AND boardIndex =" +
    mysql.escape(req.params.boardIndex) +
    ";" +
    "SELECT tag FROM tagTable WHERE boardIndex =" +
    mysql.escape(req.params.boardIndex) +
    ";" +
    "SELECT commentContent, created FROM COMMENTS WHERE deleteDate IS NULL AND boardIndex =" +
    mysql.escape(req.params.boardIndex) +
    "UPDATE BOARDS SET hits = hits + 1 WHERE boardIndex = " +
    mysql.escape(req.params.boardIndex) +
    ";" +
    // 쿼리문 실행
    db.db_connect.query(query, function (err, results) {
      if (err) {
        console.log(("detailBoard 메서드 mysql 모듈사용 실패:" + err).red.bold);
        return res.status(500).json({ state: "detailBoard 메서드 mysql 모듈사용 실패:" + err });
      }
      console.log(("CLIENT IP: " + req.ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + query).blue.bold);
      return res.status(200).json(results);
    });
};

// TODO 로그인 배운 뒤 다시 작성
// 게시글 쓰기
const writePost = function (req, res) {
  const login_cookie = req.signedCookies.user;
  // 작성 내용
  const write_post = req.body;
  // 로그인 여부 검사
  if (!login_cookie) return res.status(401).json({ state: "글을 작성하기 위해서는 로그인을 해야합니다." });

  let query;
  let tag_query = "";
  // 게시글 작성 쿼리문
  let req_category;
  if (req.params.category === "free-bulletin") req_category = "자유게시판";
  if (req.params.category === "proof-shot") req_category = "공부인증샷";
  query =
    "INSERT INTO BOARDS(category,userIndex,postTitle,postContent,created,hits,favorite) VALUES (" +
    mysql.escape(req_category) +
    "," +
    mysql.escape(user.userIndex) +
    "," +
    mysql.escape(write_post.postTitle) +
    "," +
    mysql.escape(write_post.postContent) +
    "," +
    mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
    ",0,0);";
  // 쿼리문 실행
  db.db_connect.query(query, function (err, results) {
    // 오류 발생
    if (err) {
      console.log(("writePost 메서드 mysql 모듈사용 실패:" + err).red.bold);
      return res.status(500).json({ state: "writePost 메서드 mysql 모듈사용 실패:" + err });
    }
    // 정상적으로 쿼리문 실행(게시글 등록)
    console.log(("CLIENT IP: " + req.ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + query).blue.bold);
    // 태그 쿼리문 추가
    for (const temp_tag of write_post.tags) {
      tag_query +=
        "INSERT INTO tagTable(boardIndex,tag) VALUES (" + mysql.escape(results.insertId) + "," + mysql.escape(temp_tag.content) + ");";
    }
    // 태그가 없다면 종료
    if (tag_query === "") return res.status(201).end();
    // 태그가 있다면 DB에 태그 정보 추가
    db.db_connect.query(tag_query, function (err) {
      // 오류 발생
      if (err) {
        console.log(("writePost 메서드 mysql 모듈사용 실패:" + err).red.bold);
        return res.status(500).json({ state: "writePost 메서드 mysql 모듈사용 실패:" + err });
      }
      // 정상적으로 쿼리문 실행(태그)
      console.log(("CLIENT IP: " + req.ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + tag_query).blue.bold);
      return res.status(201).end();
    });
  });
};

// 글 새로 작성시 그냥 return/ 수정시 기존 게시글 정보 불러오기
const getWrite = function (req, res) {
  const login_cookie = req.signedCookies.user;
  // 로그인 여부 검사
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 글 새로 작성
  if (req.query.boardIndex === "") return res.status(200).end();
  // 기존의 글 수정하는 경우
  // 해당 인덱스의 게시글 가져오기
  const query =
    "SELECT postTitle,postContent,created,hits,favorite FROM BOARDS WHERE deleteDate IS NULL AND boardIndex = " +
    mysql.escape(req.query.boardIndex);

  // 쿼리문 실행
  db.db_connect.query(query, function (err, results) {
    // 오류 발생
    if (err) {
      console.log(("getRevise 메서드 mysql 모듈사용 실패:" + err).red.bold);
      return res.status(500).json({ state: "getRevise 메서드 mysql 모듈사용 실패:" + err });
    }
    // 정상적으로 쿼리문 실행(기존 게시글 정보 가져오기)
    console.log(("CLIENT IP: " + req.ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + query).blue.bold);
    return res.status(200).json(results);
  });
};
// TODO 로그인 배운 후 다시 작성
// 게시글 수정요청
const revisePost = function (req, res) {
  const login_cookie = req.signedCookies.user;
  // 로그인 여부 검사
  if (!login_cookie) return res.status(401).json({ state: "글을 수정하기 위해서는 로그인을 해야합니다." });
  // 수정한 내용
  const revised_post = req.body;
  // 게시글 수정 쿼리문
  let query =
    "UPDATE BOARDS SET postTitle = " +
    mysql.escape(revised_post.postTitle) +
    ",postContent=" +
    mysql.escape(revised_post.postContent) +
    "WHERE boardIndex = " +
    mysql.escape(req.query.boardIndex) +
    ";";
  // 기존 태그 삭제
  query += "DELETE FROM tagTable WHERE boardIndex = " + mysql.escape(req.query.boardIndex) + ";";
  let tag_query = "";

  // 쿼리문 실행
  db.db_connect.query(query, function (err, results) {
    // 오류 발생
    if (err) {
      console.log(("revisedPost 메서드 mysql 모듈사용 실패:" + err).red.bold);
      return res.status(500).json({ state: "revisePost 메서드 mysql 모듈사용 실패:" + err });
    }
    // 정상적으로 쿼리문 실행(기존 게시글 정보 가져오기)
    console.log(("CLIENT IP: " + req.ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + query).blue.bold);
    // 태그 쿼리문 추가
    for (const temp_tag of revised_post.tags) {
      tag_query +=
        "INSERT INTO tagTable(boardIndex,tag) VALUES (" + mysql.escape(req.query.boardIndex) + "," + mysql.escape(temp_tag.content) + ");";
    }
    // 태그가 없다면 종료
    if (tag_query === "") return res.status(200).end();
    // 태그가 있다면 DB에 태그 정보 추가
    db.db_connect.query(tag_query, function (err) {
      // 오류 발생
      if (err) {
        console.log(("revisedPost 메서드 mysql 모듈사용 실패:" + err).red.bold);
        return res.status(500).json({ state: "revisedPost 메서드 mysql 모듈사용 실패:" + err });
      }
      // 정상적으로 쿼리문 실행(태그)
      console.log(("CLIENT IP: " + req.ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + tag_query).blue.bold);
      return res.status(200).end();
    });
  });
};

// TODO 로그인 배운 후 다시 작성
// 게시글 삭제하기
const deletePost = function (req, res) {
  const login_cookie = req.signedCookies.user;
  // 로그인 여부 검사
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 해당 인덱스 게시글 삭제
  const query =
    "UPDATE BOARDS SET deleteDate = " +
    mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
    " WHERE boardIndex = " +
    mysql.escape(req.params.boardIndex) +
    ";" +
    "UPDATE tagTable SET deleteDate =" +
    mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
    "WHERE boardIndex=" +
    mysql.escape(req.params.boardIndex) +
    ";" +
    "UPDATE favoritePost SET deleteDate = " +
    mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
    ";";
  // 쿼리문 실행
  db.db_connect.query(query, function (err) {
    // 오류 발생
    if (err) {
      console.log(("deletePost 메서드 mysql 모듈사용 실패:" + err).red.bold);
      return res.status(500).json({ state: "deletePost 메서드 mysql 모듈사용 실패:" + err });
    }
    // 정상적으로 쿼리문 실행(기존 게시글 정보 가져오기)
    console.log(("CLIENT IP: " + req.ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + query).blue.bold);
    return res.status(204).end();
  });
};

// TODO 로그인 배운 후 다시 작성
// 댓글 작성
const writeComment = function (req, res) {
  const login_cookie = req.signedCookies.user;
  // 로그인 여부 검사
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });
  // 댓글 내용
  const comment = req.body;

  // 댓글 등록 쿼리문
  const query =
    "INSERT INTO COMMENTS(boardIndex,userIndex,commentContent,created) VALUES (" +
    mysql.escape(req.params.boardIndex) +
    "," +
    mysql.escape(user.userIndex) +
    "," +
    mysql.escape(comment.content) +
    "," +
    mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
    ")";
  // 쿼리문 실행
  db.db_connect.query(query, function (err) {
    // 오류 발생
    if (err) {
      console.log(("writeComment 메서드 mysql 모듈사용 실패:" + err).red.bold);
      return res.status(500).json({ state: "writeComment 메서드 mysql 모듈사용 실패:" + err });
    }
    // 정상적으로 쿼리문 실행(후기 등록)
    console.log(("CLIENT IP: " + req.ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + query).blue.bold);
    return res.status(201).end();
  });
};

// TODO 로그인 배운 뒤 다시 작성
// 댓글 삭제
const deleteComment = function (req, res) {
  const login_cookie = req.signedCookies.user;
  // 로그인 여부 검사
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });

  // 댓글 삭제 쿼리문
  const query =
    "UPDATE COMMENTS SET deleteDate =" +
    mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
    " WHERE commentIndex =" +
    mysql.escape(req.query.commentIndex);

  db.db_connect.query(query, function (err) {
    // 오류 발생
    if (err) {
      console.log(("deleteComment 메서드 mysql 모듈사용 실패:" + err).red.bold);
      return res.status(500).json({ state: "deleteComment 메서드 mysql 모듈사용 실패:" + err });
    }
    // 정상적으로 쿼리문 실행(후기 삭제)
    console.log(("CLIENT IP: " + req.ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + query).blue.bold);
    return res.status(204).end();
  });
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
// TODO 로그인기능 배우고 추가/다시하기
const likePost = function (req, res) {
  const login_cookie = req.signedCookies.user;
  // 로그인 여부 검사
  if (!login_cookie) return res.status(401).json({ state: "해당 서비스 이용을 위해서는 로그인을 해야합니다." });

  let query =
    "SELECT userIndex FROM favoritePost WHERE boardIndex=" +
    mysql.escape(req.params.boardIndex) +
    "AND userIndex = " +
    mysql.escape(user.userIndex);

  // 쿼리문 실행
  db.db_connect.query(query, function (err, results) {
    if (err) {
      console.log(("likePost 메서드 mysql 모듈사용 실패:" + err).red.bold);
      return res.status(500).json({ state: "likePost 메서드 mysql 모듈사용 실패:" + err });
    }
    console.log(("CLIENT IP: " + req.ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + query).blue.bold);
    // 좋아요를 이미 누른 경우
    if (results[0] !== undefined) return res.status(200).json({ state: "좋아요를 이미 눌렀습니다." });

    // 해당 게시글에 좋아요를 한번도 누르지 않은 유저의 경우 좋아요 1 증가, 좋아요 누른 사람 목록에 해당 유저 추가
    query =
      " Update BOARDS SET favorite = favorite + 1 WHERE boardIndex = " +
      mysql.escape(req.params.boardIndex) +
      ";" +
      "INSERT INTO favoritePost(boardIndex,userIndex) VALUES(?,?)";
    // 쿼리문 실행
    db.db_connect.query(query, [req.params.boardIndex, user.userIndex], function (err, results) {
      if (err) {
        console.log(("likePost 메서드 mysql 모듈사용 실패:" + err).red.bold);
        return res.status(500).json({ state: "likePost 메서드 mysql 모듈사용 실패:" + err });
      }
      console.log(("CLIENT IP: " + req.ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + query).blue.bold);
      // 정상적으로 좋아요 수 1증가
      return res.status(200).end();
    });
  });
};
// TODO
// 검색기능

module.exports = {
  entireBoard: entireBoard,
  detailBoard: detailBoard,
  writePost: writePost,
  getWrite: getWrite,
  revisePost: revisePost,
  deletePost: deletePost,
  writeComment: writeComment,
  deleteComment: deleteComment,
  likePost: likePost,
};

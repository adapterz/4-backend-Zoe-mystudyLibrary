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
  // 자유게시판 카테고리 게시글 정보 모두 가져오기
  if (req.params.category === "free-bulletin") {
    const query = "SELECT boardIndex,nickName,postTitle,created,hits,favorite FROM BOARDS WHERE category = ?";
    // 쿼리문 실행
    db.db_connect.query(query, ["자유게시판"], function (err, results) {
      if (err) {
        console.log(("entireBoard 메서드 자유게시판 mysql 모듈사용 실패:" + err).red.bold);
        return res.status(500).json({ state: "entireBoard 메서드 자유게시판 mysql 모듈사용 실패:" + err });
      }
      console.log(("CLIENT IP: " + req.ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + query).blue.bold);
      return res.status(200).json(results);
    });
  } // 공부인증샷 카테고리 게시글 정보 모두 가져오기
  else if (req.params.category === "proof-shot") {
    const query = "SELECT boardIndex,nickName,postTitle,created,hits,favorite FROM BOARDS WHERE category = ?";
    // 쿼리문 실행
    db.db_connect.query(query, ["공부인증샷"], function (err, results) {
      if (err) {
        console.log(("entireBoard 메서드 공부인증샷 mysql 모듈사용 실패:" + err).red.bold);
        return res.status(500).json({ state: "entireBoard 메서드 공부인증샷 mysql 모듈사용 실패:" + err });
      }
      console.log(("CLIENT IP: " + req.ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + query).blue.bold);
      return res.status(200).json(results);
    });
  }
};

// 게시물 상세보기
const detailBoard = function (req, res) {
  // 해당 인덱스의 게시글 가져오기, 조회수 1증가
  const query =
    "SELECT nickName,postTitle,postContent,created,tags,hits,likeUser,favorite FROM BOARDS WHERE boardIndex =" +
    mysql.escape(req.params.boardIndex) +
    ";" +
    "SELECT nickName,commentIndex,commentContent,created FROM COMMENTS WHERE boardIndex =" +
    mysql.escape(req.params.boardIndex) +
    ";" +
    "UPDATE BOARDS SET hits = hits + 1 WHERE boardIndex = " +
    mysql.escape(req.params.boardIndex) +
    ";";
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
  // 작성 내용
  const write_post = req.body;
  // 로그인 여부 검사
  if (user.id === null) return res.status(401).json({ state: "글을 작성하기 위해서는 로그인을 해야합니다." });

  // 태그 배열 한 문자열에 다 넣어주기
  let tag_string = "";
  for (const tag of write_post.tags) {
    tag_string += tag;
  }
  let query;
  // 게시글 작성 쿼리문
  // 자유게시판 글 작성시 쿼리문
  if (req.params.category === "free-bulletin") {
    query = "INSERT INTO BOARDS(category,id,nickName,postTitle,postContent,created,tags,hits,likeUser) VALUES (?,?,?,?,?,?,?,?,?)";
    // 쿼리문 실행
    db.db_connect.query(
      query,
      [
        "자유게시판",
        user.id,
        user.nickName,
        write_post.postTitle,
        write_post.postContent,
        moment().format("YYYY-MM-DD HH:mm:ss"),
        tag_string,
        0,
        "",
      ],
      function (err) {
        // 오류 발생
        if (err) {
          console.log(("writePost 메서드 mysql 모듈사용 실패:" + err).red.bold);
          return res.status(500).json({ state: "writePost 메서드 mysql 모듈사용 실패:" + err });
        }
        // 정상적으로 쿼리문 실행(게시글 등록)
        console.log(("CLIENT IP: " + req.ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + query).blue.bold);
        return res.status(201).end();
      },
    );
    // 공부인증샷 글 작성시 쿼리문
  } else if (req.params.category === "proof-shot") {
    query = "INSERT INTO BOARDS(category,id,nickName,postTitle,postContent,created,tags,hits) VALUES (?,?,?,?,?,?,?,?)";
    // 쿼리문 실행
    db.db_connect.query(
      query,
      [
        "공부인증샷",
        user.id,
        user.nickName,
        write_post.postTitle,
        write_post.postContent,
        moment().format("YYYY-MM-DD HH:mm:ss"),
        tag_string,
        0,
      ],
      function (err) {
        // 오류 발생
        if (err) {
          console.log(("writePost 메서드 mysql 모듈사용 실패:" + err).red.bold);
          return res.status(500).json({ state: "writePost 메서드 mysql 모듈사용 실패:" + err });
        }
        // 정상적으로 쿼리문 실행(게시글 등록)
        console.log(("CLIENT IP: " + req.ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + query).blue.bold);
        return res.status(201).end();
      },
    );
  }
};

// 수정시 기존 게시글 정보 불러오기
const getRevise = function (req, res) {
  // 로그인 여부 검사
  if (user.id === null) return res.status(401).json({ state: "글을 수정하기 위해서는 로그인을 해야합니다." });
  // 해당 인덱스의 게시글 가져오기
  const query = "SELECT nickName,postTitle,postContent,created,tags,hits,likeUser,favorite FROM BOARDS WHERE boardIndex = ?";

  // 쿼리문 실행
  db.db_connect.query(query, [req.params.boardIndex], function (err, results) {
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
  // 로그인 여부 검사
  if (user.id === null) return res.status(401).json({ state: "글을 수정하기 위해서는 로그인을 해야합니다." });
  // 수정한 내용
  const revised_post = req.body;
  // 태그 배열 한 문자열에 다 넣어주기
  let tag_string = "";
  for (const tag of revised_post.tags) {
    tag_string += tag;
  }
  // 게시글 수정 쿼리문
  const query = "UPDATE BOARDS SET postTitle = ?,postContent=?,tags =? WHERE id = ? AND boardIndex = ?";
  // 쿼리문 실행
  db.db_connect.query(
    query,
    [revised_post.postTitle, revised_post.postContent, tag_string, user.id, req.params.boardIndex],
    function (err) {
      // 오류 발생
      if (err) {
        console.log(("revisedPost 메서드 mysql 모듈사용 실패:" + err).red.bold);
        return res.status(500).json({ state: "revisePost 메서드 mysql 모듈사용 실패:" + err });
      }
      // 정상적으로 쿼리문 실행(기존 게시글 정보 가져오기)
      console.log(("CLIENT IP: " + req.ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + query).blue.bold);
      return res.status(200).end();
    },
  );
};

// TODO 로그인 배운 후 다시 작성
// 게시글 삭제하기
const deletePost = function (req, res) {
  // 로그인 여부 검사
  if (user.id === null) return res.status(401).json({ state: "글을 삭제하기 위해서는 로그인을 해야합니다." });
  // 해당 인덱스 게시글 삭제
  const query = "UPDATE BOARDS SET deleteDate = ? WHERE boardIndex = ?";
  // 쿼리문 실행
  db.db_connect.query(query, [moment().format("YYYY-MM-DD HH:mm:ss"), req.params.boardIndex], function (err) {
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
  // 로그인이 안 돼있을 때
  if (user.id === null) return res.status(401).json({ state: "인증되지 않은 사용자입니다. " });
  // 댓글 내용
  const comment = req.body;

  // 댓글 등록 쿼리문
  const query = "INSERT INTO COMMENTS(nickName,boardIndex,commentContent,category,created) VALUES (?,?,?,?,?)";
  let category;
  if (req.params.category === "free-bulletin") category = "자유게시판";
  if (req.params.category === "proof-shot") category = "공부인증샷";
  // 쿼리문 실행
  db.db_connect.query(
    query,
    [user.nickName, req.params.boardIndex, comment.commentContent, category, moment().format("YYYY-MM-DD HH:mm:ss")],
    function (err) {
      // 오류 발생
      if (err) {
        console.log(("writeComment 메서드 mysql 모듈사용 실패:" + err).red.bold);
        return res.status(500).json({ state: "writeComment 메서드 mysql 모듈사용 실패:" + err });
      }
      // 정상적으로 쿼리문 실행(후기 등록)
      console.log(("CLIENT IP: " + req.ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + query).blue.bold);
      return res.status(201).end();
    },
  );
};

// TODO 로그인 배운 뒤 다시 작성
// 댓글 삭제
const deleteComment = function (req, res) {
  // 로그인이 안 돼있을 때
  if (user.id === null) return res.status(401).json({ state: "인증되지 않은 사용자입니다. " });

  const query = "UPDATE COMMENTS SET deleteDate = ? WHERE commentIndex = ?";
  db.db_connect.query(query, [moment().format("YYYY-MM-DD HH:mm:ss"), req.params.commentIndex], function (err) {
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
  // 로그인 여부 검사
  if (user.id === null) return res.status(401).json({ state: "좋아요를 누르기 위해서는 로그인을 해야합니다." });
  // 예시 해당 게시글 정보
  const thisPost = {
    category: "자유게시판",
    boardIndex: 134,
    likeUsers: [{ nickName: "Zoe" }, { nickName: "yeji" }], //< 해당 게시글에 좋아요를 누른 유저 목록
    likeCnt: 123, //좋아요 횟수
  };
  // 좋아요 누른 사람 목록 문자열 가져오기 ex. yeji1234;yeji2345; < 아이디 단위로 쪼개기
  let likeUser_string;
  let query = "SELECT likeUser FROM BOARDS WHERE boardIndex=? ";
  // 쿼리문 실행
  db.db_connect.query(query, [req.params.boardIndex], function (err, results) {
    if (err) {
      console.log(("likePost 메서드 mysql 모듈사용 실패:" + err).red.bold);
      return res.status(500).json({ state: "likePost 메서드 mysql 모듈사용 실패:" + err });
    }
    console.log(("CLIENT IP: " + req.ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + query).blue.bold);
    likeUser_string = results.likeUser;
  });
  console.log(likeUser_string);
  // 좋아요 누른 사람 문자열 쪼개기
  let likeUser_split = likeUser_string.split(";");
  // 좋아요 누른 사람 목록에 해당 유저가 있는지 체크
  const is_pushed_like = likeUser_split.includes(user.id);
  if (is_pushed_like) return res.status(200).json({ state: "좋아요를 이미 눌렀습니다." });

  // 해당 게시글에 좋아요를 한번도 누르지 않은 유저의 경우 좋아요 1 증가, 좋아요 누른 사람 목록에 해당 유저 추가
  query = " Update BOARDS SET like = like + 1, likeUser = concat(likeUser,user.id) WHERE boardIndex = ? ";
  // 쿼리문 실행
  db.db_connect.query(query, [req.params.boardIndex], function (err, results) {
    if (err) {
      console.log(("likePost 메서드 mysql 모듈사용 실패:" + err).red.bold);
      return res.status(500).json({ state: "likePost 메서드 mysql 모듈사용 실패:" + err });
    }
    console.log(("CLIENT IP: " + req.ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + query).blue.bold);
    // 정상적으로 좋아요 수 1증가
    return res.status(200).end();
  });
};
// TODO
// 검색기능

module.exports = {
  entireBoard: entireBoard,
  detailBoard: detailBoard,
  writePost: writePost,
  getRevise: getRevise,
  revisePost: revisePost,
  deletePost: deletePost,
  writeComment: writeComment,
  deleteComment: deleteComment,
  likePost: likePost,
};

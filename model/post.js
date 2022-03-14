// 필요모듈
const mysql = require("mysql");
const db = require("../a_mymodule/db");
const moment = require("../a_mymodule/date_time");
const { queryFail, querySuccessLog } = require("../a_mymodule/const");

// 전체 게시글 정보(글 타이틀)
function entireBoardModel(category, ip) {
  const query =
    "SELECT boardIndex,postTitle,created,hits,favorite,category,nickName FROM BOARDS LEFT JOIN USER ON BOARDS.userIndex = User.userIndex WHERE BOARDS.deleteDate IS NULL AND category =" +
    mysql.escape(category);
  // 쿼리문 실행
  db.db_connect.query(query, function (err, results) {
    queryFail(err);
    querySuccessLog(ip, query);
    return { state: "전체게시글", data: results };
  });
}

// 특정 게시글 상세보기
function detailBoardModel(board_index, ip) {
  // 해당 인덱스의 게시글/태그 가져오기, 조회수 1증가
  const query =
    "SELECT boardIndex,postTitle,postContent,created,hits,favorite,nickName FROM BOARDS LEFT JOIN USER ON BOARDS.userIndex = USER.userIndex WHERE BOARDS.deleteDate IS NULL AND boardIndex =" +
    mysql.escape(board_index) +
    ";" +
    "SELECT tag FROM tagTable WHERE boardIndex =" +
    mysql.escape(board_index) +
    ";" +
    "SELECT commentContent, created FROM COMMENTS WHERE deleteDate IS NULL AND boardIndex =" +
    mysql.escape(board_index) +
    // TODO 조회수 중복 증가 막기, 조회수, 좋아요 수 컬럼명 명확히하기(favoriteCount, viewCount), TAGTABLE - TAG, libIndex x libraryIndex
    "UPDATE BOARDS SET hits = hits + 1 WHERE boardIndex = " +
    mysql.escape(board_index) +
    ";" +
    // 쿼리문 실행
    db.db_connect.query(query, function (err, results) {
      queryFail(err);
      querySuccessLog(ip, query);
      if (results[0] === undefined) return { state: "존재하지않는게시글" };
      return { state: "게시글상세보기", data: results };
    });
}
// 해당 인덱스 유저 글 정보 조회 (글 타이틀)
function userPostModel(user_index, ip) {
  // 해당 유저가 작성한 게시글 정보 가져오기
  const query =
    "SELECT boardIndex,postTitle,created,hits,favorite,category FROM BOARDS WHERE deleteDate IS NULL AND userIndex = " +
    mysql.escape(user_index);
  // 쿼리문 실행
  db.db_connect.query(query, function (err, results) {
    queryFail(err);
    querySuccessLog(ip, query);
    // 데이터가 없을 때 보여줄 페이지
    if (results[0] === undefined) {
      return { state: "등록된글이없음" };
    }

    // 성공적으로 데이터 전달
    return { state: "성공적조회", data: results };
  });
}

// 게시글 쓰기(최초)
function writePostModel(category, input_write, user_index, ip) {
  let query;
  let tag_query = "";
  // 게시글 작성 쿼리문
  query =
    "INSERT INTO BOARDS(category,userIndex,postTitle,postContent,created,hits,favorite) VALUES (" +
    mysql.escape(category) +
    "," +
    mysql.escape(user_index) +
    "," +
    mysql.escape(input_write.postTitle) +
    "," +
    mysql.escape(input_write.postContent) +
    "," +
    mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
    ",0,0);";
  // 쿼리문 실행
  db.db_connect.query(query, function (err, results) {
    queryFail(err);
    querySuccessLog(ip, query);
    // 태그 쿼리문 추가
    for (const temp_tag of input_write.tags) {
      tag_query +=
        "INSERT INTO tagTable(boardIndex,tag) VALUES (" + mysql.escape(results.insertId) + "," + mysql.escape(temp_tag.content) + ");";
    }
    // 태그가 없다면 종료
    if (tag_query === "") return { state: "게시글작성완료" };
    // 태그가 있다면 DB에 태그 정보 추가
    db.db_connect.query(tag_query, function (err) {
      queryFail(err);
      querySuccessLog(ip, query);
      return { state: "게시글작성완료" };
    });
  });
}

// 게시글 수정하기 버튼 눌렀을 때 기존 게시글 정보 불러오기
function getWriteModel(board_index, user_index, ip) {
  // 해당 인덱스의 게시글 가져오기
  const query =
    "SELECT postTitle,postContent,created,hits,favorite FROM BOARDS WHERE deleteDate IS NULL AND boardIndex = " +
    mysql.escape(board_index) +
    "AND userIndex =" +
    mysql.escape(user_index);

  // 쿼리문 실행
  db.db_connect.query(query, function (err, results) {
    queryFail(err);
    querySuccessLog(ip, query);
    if (results[0] === undefined) return { state: "존재하지않는게시글" };
    return { state: "게시글정보로딩", data: results };
  });
}
// 게시글 수정요청
function revisePost(input_post, board_index, user_index, ip) {
  // 게시글 수정 쿼리문
  let query =
    "UPDATE BOARDS SET postTitle = " +
    mysql.escape(input_post.postTitle) +
    ",postContent=" +
    mysql.escape(input_post.postContent) +
    "WHERE boardIndex = " +
    mysql.escape(board_index) +
    "AND userIndex=" +
    mysql.escape(user_index) +
    ";";
  // 기존 태그 삭제
  query += "DELETE FROM tagTable WHERE boardIndex = " + mysql.escape(board_index) + ";";
  let tag_query = "";

  // 쿼리문 실행
  db.db_connect.query(query, function (err, results) {
    queryFail(err);
    querySuccessLog(ip, query);
    // 태그 쿼리문 추가
    for (const temp_tag of input_post.tags) {
      tag_query +=
        "INSERT INTO tagTable(boardIndex,tag) VALUES (" + mysql.escape(board_index) + "," + mysql.escape(temp_tag.content) + ");";
    }
    // 태그가 없다면 종료
    if (tag_query === "") return { state: "게시글수정" };
    // 태그가 있다면 DB에 태그 정보 추가
    db.db_connect.query(tag_query, function (err) {
      queryFail(err);
      querySuccessLog(ip, query);
      return { state: "게시글수정" };
    });
  });
}

// 선택 게시글 삭제
function deletePostModel(board_index, user_index, ip) {
  // 해당 인덱스 게시글 삭제
  const query =
    "UPDATE BOARDS SET deleteDate = " +
    mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
    " WHERE boardIndex = " +
    mysql.escape(board_index) +
    "AND userIndex = " +
    mysql.escape(user_index) +
    ";" +
    "UPDATE tagTable SET deleteDate =" +
    mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
    "WHERE boardIndex=" +
    mysql.escape(board_index) +
    ";" +
    "UPDATE favoritePost SET deleteDate = " +
    mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
    "WHERE boardIndex=" +
    mysql.escape(board_index) +
    ";" +
    "UPDATE COMMENTS SET deleteDate = " +
    mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
    "WHERE boardIndex=" +
    mysql.escape(board_index);
  // 쿼리문 실행
  db.db_connect.query(query, function (err) {
    queryFail(err);
    querySuccessLog(ip, query);
    return { state: "게시글삭제" };
  });
}

// 게시글에 좋아요 누르기
function likePostModel(board_index, user_index, ip) {
  let query =
    "SELECT userIndex FROM favoritePost WHERE boardIndex=" + mysql.escape(board_index) + "AND userIndex = " + mysql.escape(user_index);

  // 쿼리문 실행
  db.db_connect.query(query, function (err, results) {
    queryFail(err);
    querySuccessLog(ip, query);
    // 좋아요를 이미 누른 경우
    if (results[0] !== undefined) return { state: "좋아요 중복요청" };

    // 해당 게시글에 좋아요를 한번도 누르지 않은 유저의 경우 좋아요 1 증가, 좋아요 누른 사람 목록에 해당 유저 추가
    query =
      " Update BOARDS SET favorite = favorite + 1 WHERE boardIndex = " +
      mysql.escape(board_index) +
      ";" +
      "INSERT INTO favoritePost(boardIndex,userIndex) VALUES(?,?)";
    // 쿼리문 실행
    db.db_connect.query(query, [board_index, user_index], function (err, results) {
      queryFail(err);
      querySuccessLog(ip, query);
      // 정상적으로 좋아요 수 1증가
      return { state: "좋아요+1" };
    });
  });
}
// 최신글 정보 가져오기
function getRecentPostModel(ip) {
  // 최신글 자유게시판 글 5개/공부인증샷 글 4개 불러오기
  const query =
    "SELECT postTitle,nickName,hits,favorite FROM BOARDS LEFT JOIN USER ON BOARDS.userIndex=user.userIndex WHERE BOARDS.deleteDate IS NULL AND category = ? order by boardIndex DESC limit 5;" +
    "SELECT postTitle,nickName,hits,favorite FROM BOARDS LEFT JOIN USER ON BOARDS.userIndex=user.userIndex WHERE BOARDS.deleteDate IS NULL AND category = ? order by boardIndex DESC limit 4;";
  db.db_connect.query(query, ["자유게시판", "공부인증샷"], function (err, results) {
    queryFail(err);
    querySuccessLog(ip, query);
    return { state: "최신글정보", date: results };
  });
}

module.exports = {
  entireBoardModel: entireBoardModel,
  detailBoardModel: detailBoardModel,
  userPostModel: userPostModel,
  writePostModel: writePostModel,
  getWriteModel: getWriteModel,
  revisePost: revisePost,
  deletePostModel: deletePostModel,
  likePostModel: likePostModel,
  getRecentPostModel: getRecentPostModel,
};

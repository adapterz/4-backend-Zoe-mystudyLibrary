const mysql = require("mysql");
const db = require("../a_mymodule/db");
const { pool } = require("../a_mymodule/db");
const moment = require("../a_mymodule/date_time");
const { queryFail, querySuccessLog } = require("../a_mymodule/const");
const { db_connect } = require("../a_mymodule/db");

// 전체 게시글 정보 (글제목, 글쓴이(닉네임), 조회수, 좋아요 수, 작성날짜)
async function entireBoardModel(category, ip) {
  //const connection = await pool.getConnection(async (conn) => conn);
  //try {
  // await connection.beginTransaction();
  const query =
    "SELECT boardIndex,postTitle,viewCount,favoriteCount,nickName,createDateTime FROM BOARD LEFT JOIN USER ON BOARD.userIndex = User.userIndex WHERE BOARD.deleteDateTime IS NULL AND BOARD.category =" +
    mysql.escape(category);

  await db.db_connect.query(query, async function (err, results) {
    // 쿼리문 실패 메서드
    const fail = await queryFail(err, ip, query);
    if (fail.state === "mysql 사용실패") {
      //   connection.rollback();
      return { state: "mysql 사용실패" };
    }
    // 쿼리문 성공 메서드
    await querySuccessLog(ip, query);
    // connection.commit();
    return { state: "전체게시글", data: results };
  });
  //} catch (err) {
  //  await connection.rollback();
  return { state: "mysql 사용실패" };
  //} finally {
  //  connection.release();
  //}
}

// 특정 게시글 상세보기
async function detailBoardModel(board_index, ip, user_index) {
  db.db_connect.beginTransaction(async function (error) {
    if (error) throw error;
    // 해당 인덱스의 게시글/태그 정보 가져오는 메서드 + 처음 이 게시글을 조회하는 유저면 조회수 1 증가
    const query =
      "SELECT boardIndex,postTitle,postContent,viewCount,favoriteCount,BOARD.createDateTime,USER.nickName FROM BOARD LEFT JOIN USER ON BOARD.userIndex = USER.userIndex WHERE BOARD.deleteDateTime IS NULL AND boardIndex =" +
      mysql.escape(board_index) +
      ";" +
      "SELECT tag FROM TAG WHERE deleteDateTime IS NULL AND boardIndex =" +
      mysql.escape(board_index) +
      ";" +
      "SELECT commentContent, createDateTime FROM COMMENT WHERE deleteDateTime IS NULL AND boardIndex =" +
      mysql.escape(board_index) +
      ";";
    // 게시글 정보가져오는 쿼리 메서드
    db.db_connect.query(query, async function (err, results) {
      // 쿼리문 실패
      const fail = await queryFail(err, ip, query);
      if (fail.state === "mysql 사용실패") {
        db_connect.rollback();
        return { state: "mysql 사용실패" };
      }
      // 쿼리문 메서드 성공
      await querySuccessLog(ip, query);
      // 요청한 게시글 인덱스의 게시물이 존재하지 않을 때
      if (results[0] === undefined) {
        db_connect.rollback();
        return { state: "존재하지않는게시글" };
      }
      // 조회수 중복증가 여부 체크해서 반영해주는 메서드
      const view_check = await increaseViewCount(board_index, user_index, ip);
      if (view_check.state === "mysql 사용실패") return { state: "mysql 사용실패" };
      // 성공적으로 게시글 정보 조회
      else if (view_check.state === "조회수증복증가여부체크완료") {
        db_connect.commit();
        return { state: "게시글상세보기", data: results };
      }
    });
  });
}
// '내가 작성한 글' 정보 요청한 유저 글 정보 조회 (글제목, 조회수, 좋아요 수, 작성날짜)
async function userPostModel(user_index, ip) {
  db.db_connect.beginTransaction(async function (error) {
    if (error) throw error;
    // 해당 유저가 작성한 게시글 정보 가져오기
    const query =
      "SELECT boardIndex,postTitle,viewCount,favoriteCount FROM BOARD WHERE deleteDateTime IS NULL AND userIndex = " +
      mysql.escape(user_index);
    // 쿼리문 실행
    db.db_connect.query(query, async function (err, results) {
      // 쿼리문 메서드 실패
      const fail = await queryFail(err, ip, query);
      if (fail.state === "mysql 사용실패") {
        db_connect.rollback();
        return { state: "mysql 사용실패" };
      }
      // 쿼리문 메서드 성공
      await querySuccessLog(ip, query);
      // 요청한 데이터가 없을 때
      if (results[0] === undefined) {
        db_connect.rollback();
        return { state: "등록된글이없음" };
      }
      // 요청한 데이터가 있을 때
      db_connect.commit();
      return { state: "성공적조회", data: results };
    });
  });
}

// 게시글 쓰기(최초)
async function writePostModel(category, input_write, user_index, ip) {
  db.db_connect.beginTransaction(async function (error) {
    if (error) throw error;
    let query;
    // 게시글 작성 쿼리문
    query =
      "INSERT INTO BOARD(category,userIndex,postTitle,postContent,createDateTime,viewCount,favoriteCount) VALUES (" +
      mysql.escape(category) +
      "," +
      mysql.escape(user_index) +
      "," +
      mysql.escape(input_write.postTitle) +
      "," +
      mysql.escape(input_write.postContent) +
      "," +
      mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
      ",0,0);"; // 조회수, 좋아하는 유저수는 처음에 0으로 등록

    db.db_connect.query(query, async function (err, results) {
      // 쿼리문 메서드 실패
      const fail = await queryFail(err, ip, query);
      if (fail.state === "mysql 사용실패") {
        db_connect.rollback();
        return { state: "mysql 사용실패" };
      }
      // 쿼리문 성공 메서드
      await querySuccessLog(ip, query);
      // 태그 추가 쿼리문
      const tag_results = await writeTag(results.insertId, input_write, user_index, ip);
      if (tag_results.state === "mysql 사용실패") {
        db_connect.rollback();
        return { state: "mysql 사용실패" };
        // 정상적으로 태그추가 메서드가 실행됐을 때
      } else if (tag_results.state === "태그추가완료") {
        db_connect.commit();
        return { state: "게시글작성완료" };
      }
    });
  });
}
// 게시글 수정하기 버튼 눌렀을 때 기존 게시글 정보 불러오는 모델
async function getWriteModel(board_index, user_index, ip) {
  db.db_connect.beginTransaction(async function (error) {
    if (error) throw error;
    // 해당 인덱스의 게시글 가져오기
    const query =
      "SELECT postTitle,postContent,viewCount,favoriteCount,createDateTime FROM BOARD WHERE deleteDateTime IS NULL AND boardIndex = " +
      mysql.escape(board_index) +
      "AND userIndex =" +
      mysql.escape(user_index) +
      ";" +
      "SELECT tag FROM TAG WHERE deleteDateTime IS NULL;"; // 해당 게시글인덱스의 태그 가져오기

    db.db_connect.query(query, async function (err, results) {
      // 쿼리문 메서드 실패
      const fail = await queryFail(err, ip, query);
      if (fail.state === "mysql 사용실패") {
        db_connect.rollback();
        return { state: "mysql 사용실패" };
      }
      // 쿼리문 메서드 성공
      await querySuccessLog(ip, query);
      // 해당 게시글인덱스의 게시글이 없을 때
      if (results[0] === undefined) {
        db_connect.rollback();
        return { state: "존재하지않는게시글" };
      }
      db_connect.commit();
      return { state: "게시글정보로딩", data: results };
    });
  });
}
// 게시글 수정 요청 모델
async function revisePost(input_post, board_index, user_index, ip) {
  db.db_connect.beginTransaction(async function (error) {
    if (error) throw error;
    // 게시글 수정요청 쿼리문
    let query =
      "UPDATE BOARD SET postTitle = " +
      mysql.escape(input_post.postTitle) +
      ",postContent=" +
      mysql.escape(input_post.postContent) +
      "WHERE boardIndex = " +
      mysql.escape(board_index) +
      "AND userIndex=" +
      mysql.escape(user_index) +
      ";";
    // 기존 태그 삭제
    query += "DELETE FROM TAG WHERE boardIndex = " + mysql.escape(board_index) + ";";

    db.db_connect.query(query, async function (err, results) {
      // 쿼리문 메서드 실패
      const fail = await queryFail(err, ip, query);
      if (fail.state === "mysql 사용실패") {
        db_connect.rollback();
        return { state: "mysql 사용실패" };
      }
      // 쿼리메서드 성공
      await querySuccessLog(ip, query);
      // 태그 추가 메서드
      const tag_results = await writeTag(board_index, input_post, user_index, ip);
      if (tag_results.state === "mysql 사용실패") {
        db_connect.rollback();
        return { state: "mysql 사용실패" };
        // 정상적으로 태그추가 메서드가 실행됐을 때
      } else if (tag_results.state === "태그추가완료") {
        db_connect.commit();
        return { state: "게시글수정" };
      }
    });
  });
}

// 선택 게시글 삭제
async function deletePostModel(board_index, user_index, ip) {
  db.db_connect.beginTransaction(async function (error) {
    if (error) throw error;
    // 해당 인덱스 게시글 삭제
    const query =
      // 게시글 삭제 쿼리문
      "UPDATE BOARD SET deleteDateTime = " +
      mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
      " WHERE boardIndex = " +
      mysql.escape(board_index) +
      "AND userIndex = " +
      mysql.escape(user_index) +
      ";" +
      "UPDATE Tag SET deleteDateTime =" + // 해당 게시글인덱스에 해당하는 태그 삭제 쿼리문
      mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
      "WHERE boardIndex=" +
      mysql.escape(board_index) +
      ";" +
      "UPDATE FAVORITEPOST SET deleteDateTime = " + // 해당 게시글인덱스에 해당하는 좋아요 누른 유저 정보 삭제 쿼리문
      mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
      "WHERE boardIndex=" +
      mysql.escape(board_index) +
      ";" +
      "UPDATE COMMENT SET deleteDateTime = " + // 해당 게시글인덱스에 해당하는 댓글 삭제 쿼리문
      mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
      "WHERE boardIndex=" +
      mysql.escape(board_index) +
      ";" +
      "UPDATE VIEWPOST SET deleteDateTime = " + // 해당 게시글인덱스에 해당하는 조회한 유저 정보 삭제 쿼리문
      mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
      "WHERE boardIndex=" +
      mysql.escape(board_index) +
      ";";

    db.db_connect.query(query, async function (err) {
      // 쿼리문 메서드 실패
      const fail = await queryFail(err, ip, query);
      if (fail.state === "mysql 사용실패") {
        db_connect.rollback();
        return { state: "mysql 사용실패" };
      }
      // 쿼리문 메서드 성공
      await querySuccessLog(ip, query);
      db_connect.commit();
      return { state: "게시글삭제" };
    });
  });
}

// 게시글에 좋아요 누르기 모델
async function likePostModel(board_index, user_index, ip) {
  db.db_connect.beginTransaction(async function (error) {
    if (error) throw error;
    let query =
      "SELECT userIndex FROM FAVORITEPOST WHERE boardIndex=" + mysql.escape(board_index) + "AND userIndex = " + mysql.escape(user_index);

    db.db_connect.query(query, async function (err, results) {
      // 쿼리문 메서드 실패
      const fail = await queryFail(err, ip, query);
      if (fail.state === "mysql 사용실패") {
        db_connect.rollback();
        return { state: "mysql 사용실패" };
      }
      // 쿼리문 메서드 성공
      await querySuccessLog(ip, query);
      // 좋아요를 이미 누른 경우
      if (results[0] !== undefined) {
        db_connect.rollback();
        return { state: "좋아요 중복요청" };
      }
    });

    // 해당 게시글에 좋아요를 한번도 누르지 않은 유저의 경우 좋아요 1 증가, 좋아요 누른 사람 목록에 해당 유저 추가
    query =
      " Update BOARD SET favoriteCount = favoriteCount + 1 WHERE boardIndex = " +
      mysql.escape(board_index) +
      ";" +
      "INSERT INTO favoritePost(boardIndex,userIndex) VALUES(?,?)";
    // 쿼리문 실행
    db.db_connect.query(query, [board_index, user_index], async function (err, results) {
      // 쿼리문 메서드 실패
      const fail = await queryFail(err, ip, query);
      if (fail.state === "mysql 사용실패") {
        db_connect.rollback();
        return { state: "mysql 사용실패" };
      }
      await querySuccessLog(ip, query);
      // 정상적으로 좋아요 수 1증가
      db_connect.commit();
      return { state: "좋아요+1" };
    });
  });
}
// 최신글 정보 가져오기
async function getRecentPostModel(ip) {
  pool.getConnection(function (err, connection) {
    connection.beginTransaction(function (err) {
      if (err) throw err;
      // 최신글 자유게시판 글 5개/공부인증샷 글 4개 불러오기
      const query =
        "SELECT postTitle,nickName,hits,favorite FROM BOARD LEFT JOIN USER ON BOARD.userIndex=USER.userIndex WHERE BOARD.deleteDateTime IS NULL AND category = ? order by boardIndex DESC limit 5;" +
        "SELECT postTitle,nickName,hits,favorite FROM BOARD LEFT JOIN USER ON BOARD.userIndex=USER.userIndex WHERE BOARD.deleteDateTime IS NULL AND category = ? order by boardIndex DESC limit 4;";
      connection.query(query, ["자유게시판", "공부인증샷"], async function (err, results) {
        // 쿼리문 메서드 실패
        const fail = await queryFail(err, ip, query);
        if (fail.state === "mysql 사용실패") {
          await connection.rollback();
          return { state: "mysql 사용실패" };
        }
        await connection.commit();
        await querySuccessLog(ip, query);
        await connection.release();
        return { state: "최신글정보", date: results };
      });
    });
  });
}

// 검색 기능
async function searchModel(search_option, search_content, category, ip) {
  db.db_connect.beginTransaction(async function (error) {
    if (error) throw error;
    let query;
    // 검색 옵션에 맞는 게시글 정보 select 해오는 쿼리문 작성 (글제목, 글쓴이(닉네임), 조회수, 좋아요 수, 작성날짜)
    // 제목만 검색한다고 옵션설정했을 때 검색해주는 쿼리문
    if (search_option === "제목만") {
      query =
        "SELECT boardIndex,postTitle, viewCount,favoriteCount,nickName,createDateTime FROM BOARD LEFT JOIN BOARD.userIndex = USER.userIndex WHERE BOARD.deleteDateTime IS NULL AND postTitle LIKE" +
        mysql.escape("%" + search_content + "%") +
        "AND BOARD.category= " +
        mysql.escape(category);
      // 내용만 검색한다고 옵션설정했을 때 검색해주는 쿼리문
    } else if (search_option === "내용만") {
      query =
        "SELECT boardIndex,postTitle, viewCount,favoriteCount,nickName,createDateTime FROM BOARD LEFT JOIN BOARD.userIndex = USER.userIndex WHERE BOARD.deleteDateTime IS NULL AND postContent LIKE" +
        mysql.escape("%" + search_content + "%") +
        "AND BOARD.category= " +
        mysql.escape(category);
      // 제목+내용 검색한다고 옵션설정했을 때 검색해주는 쿼리문
    } else if (search_option === "제목 + 내용") {
      query =
        "SELECT boardIndex,postTitle, viewCount,favoriteCount,nickName,createDateTime FROM BOARD LEFT JOIN BOARD.userIndex = USER.userIndex WHERE BOARD.deleteDateTime IS NULL AND postTitle LIKE" +
        mysql.escape("%" + search_content + "%") +
        "OR postContent LIKE" +
        mysql.escape("%" + search_content + "%") +
        "AND BOARD.category= " +
        mysql.escape(category);
      // 일치하는 닉네임 검색한다고 옵션설정했을 때 검색해주는 쿼리문
    } else if (search_option === "닉네임") {
      query =
        "SELECT boardIndex,postTitle, viewCount,favoriteCount,nickName,createDateTime FROM BOARD LEFT JOIN BOARD.userIndex = USER.userIndex WHERE BOARD.deleteDateTime IS NULL AND nickName LIKE" +
        mysql.escape(search_content) +
        "AND BOARD.category= " +
        mysql.escape(category);
    }

    db.db_connect.query(query, async function (err, results) {
      // 쿼리문 메서드 실패
      const fail = await queryFail(err, ip, query);
      if (fail.state === "mysql 사용실패") {
        db_connect.rollback();
        return { state: "mysql 사용실패" };
      }
      await querySuccessLog(ip, query);
      // 검색결과가 없을 때
      if (results[0] === undefined) {
        db_connect.rollback();
        return { state: "검색결과없음" };
      }
      // 검색결과가 있을 때
      db_connect.commit();
      return { state: "검색글정보", data: results };
    });
  });
}

// 게시글 작성시 태크 추가해줄 메서드(export x 해당 파일에서만 사용할 메서드)
async function writeTag(board_index, input_write, user_index, ip) {
  // 태그 쿼리문 추가, 태그 배열이 비어있으면 해당 반복문은 작동하지 않음
  let tag_query = "";
  for (const temp_tag of input_write.tags) {
    tag_query +=
      "INSERT INTO TAG(boardIndex,tag,updateDateTime) VALUES (" +
      mysql.escape(board_index) + // 생성될 게시글의 인덱스
      "," +
      mysql.escape(temp_tag.content) +
      "," +
      mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
      ");";
  }
  // 태그가 없다면 종료(위의 반복문이 작동되지 않았을 때)
  if (tag_query === "") return { state: "태그추가완료" };
  // 태그가 있다면 DB에 태그 정보 추가
  db.db_connect.query(tag_query, async function (err) {
    // 쿼리문 메서드 실패
    const fail = await queryFail(err, ip, tag_query);
    if (fail.state === "mysql 사용실패") {
      db_connect.rollback();
      return { state: "mysql 사용실패" };
    }
    await querySuccessLog(ip, tag_query);
    return { state: "태그추가완료" };
  });
}

// 특정 게시글을 봤을 때 조회수 중복증가 여부 체크해서 반영해주는 메서드 (export 할 메서드 x 해당 post model안에서만 사용)
const increaseViewCount = async function (board_index, user_index, ip) {
  // 기존에 요청 유저 ip로 게시글 조회한 기록이 있는지 확인하는 쿼리문
  let view_query;
  // 로그인한 유저가 글 조회했을 때
  if (user_index !== null) {
    // 해당 유저인덱스로 조회 기록이 있는지 확인하는 쿼리문 + 해당 ip로 조회 기록이 있는지 확인하는 쿼리문
    view_query =
      "SELECT userIndex FROM VIEWPOST WHERE deleteDateTime IS NULL AND boardIndex=" +
      mysql.escape(board_index) +
      " AND userIndex =" +
      mysql.escape(user_index) +
      ";" +
      "SELECT ip FROM VIEWPOST WHERE deleteDateTime IS NULL AND boardIndex=" +
      mysql.escape(board_index) +
      "AND ip =" +
      mysql.escape(ip) +
      ";";
  }
  // 로그인 안한 유저가 글 조회했을 때
  else if (user_index === null) {
    // 해당 ip로 조회 기록이 있는지 확인하는 쿼리문
    view_query =
      "SELECT ip FROM VIEWPOST WHERE deleteDateTime IS NULL AND boardIndex=" + mysql.escape(board_index) + "AND ip =" + mysql.escape(ip);
  }

  // 해당 게시글을 조회한 기록이 있는지 확인하는 쿼리 메서드, 조회기록 결과 view_results 변수에 받아오기
  let view_results = db.db_connect.query(view_query, async function (err, view_results) {
    // 쿼리문 메서드 실패
    const fail = await queryFail(err, ip, view_query);
    if (fail.state === "mysql 사용실패") {
      db_connect.rollback();
      return { state: "mysql 사용실패" };
    }
    // 쿼리문 메서드 성공
    await querySuccessLog(ip, view_query);
    return view_results;
  });

  // 해당 ip로 해당 게시글 조회한 기록이 없으면 조회수 1 증가
  if (view_results[0] === undefined) {
    // 로그인한 유저일 경우 쿼리문 - 조회한 ip와 user_index 정보 둘다 추가
    if (user_index !== null) {
      view_query =
        "UPDATE BOARD SET viewCount = viewCount + 1 WHERE boardIndex = " +
        mysql.escape(board_index) +
        ";" +
        "INSERT INTO VIEWPOST(boardIndex,ip,userIndex,updateDateTime) VALUES(" +
        mysql.escape(board_index) +
        "," +
        mysql.escape(ip) +
        "," +
        mysql.escape(user_index) +
        "," +
        mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
        ");";
    }
    // 로그인안한 유저일 경우 쿼리문 - 조회한 ip 정보 추가
    else if (user_index === null) {
      view_query =
        "UPDATE BOARD SET viewCount = viewCount + 1 WHERE boardIndex = " +
        mysql.escape(board_index) +
        ";" +
        "INSERT INTO VIEWPOST(boardIndex,ip,updateDateTime) VALUES(" +
        mysql.escape(board_index) +
        "," +
        mysql.escape(ip) +
        "," +
        mysql.escape(moment().format("YYYY-MM-DD HH:mm:ss")) +
        ");";
    }
    // 해당 게시글 조회수 1 증가하는 쿼리문
    db.db_connect.query(view_query, async function (err) {
      // 쿼리문 메서드 실패
      const fail = await queryFail(err, ip, view_query);
      if (fail.state === "mysql 사용실패") {
        db_connect.rollback();
        return { state: "mysql 사용실패" };
      }
      // 쿼리문 메서드 성공
      db_connect.commit();
      await querySuccessLog(ip, view_query);
      return { state: "조회수증복증가여부체크완료" };
    });
  }
};
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
  searchModel: searchModel,
};

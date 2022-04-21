// 게시판 모델
// 내장모듈
import { db, Op } from "../Orm/models/index";
import { modelFailLog, modelSuccessLog } from "../CustomModule/QueryLog";
import { changeTimestampForm, changeUnit, checkExistUser } from "../CustomModule/ChangeDataForm";
/*
 * 1. 게시글 조회
 * 2. 게시글 작성/수정/삭제
 * 3. 좋아요/검색 기능
 */

// 1. 게시글 조회
// 1-1. 최신글 정보 가져오기
export async function getRecentBoardModel(ip) {
  const freeBoardData = [];
  const studyBoardData = [];
  const results = [];
  // 최신글 자유게시판 글 5개 불러오기
  let query =
    "SELECT postTitle,nickname FROM BOARD LEFT JOIN USER ON BOARD.userIndex=USER.userIndex" +
    " WHERE BOARD.deleteTimestamp IS NULL AND BOARD.boardIndex IS NOT NULL AND category = 0 order by boardIndex DESC limit 5";
  // 성공시
  try {
    let [result, metadata] = await db.sequelize.query(query);
    results.push(result);
    // 최신글 공부인증샷 글 4개 불러오기
    query =
      "SELECT postTitle,nickname,viewCount,favoriteCount FROM BOARD LEFT JOIN USER ON BOARD.userIndex=USER.userIndex " +
      " WHERE BOARD.deleteTimestamp IS NULL AND BOARD.boardIndex IS NOT NULL AND category = 1 order by boardIndex DESC limit 4;";
    [result, metadata] = await db.sequelize.query(query);
    results.push(result);

    // 자유게시판 최신글 파싱
    for (const index in results[0]) {
      // 게시글 제목의 글자수가 15자 이하일 때
      if (results[0][index].postTitle.length <= 15) {
        const tempData = {
          postTitle: results[0][index].postTitle,
          nickname: await checkExistUser(results[0][index].nickname),
        };
        freeBoardData.push(tempData);
      }
      // 게시글 제목의 글자수가 15자 초과일 때
      else if (results[0][index].postTitle.length > 15) {
        const tempData = {
          postTitle: results[0][index].postTitle.substring(0, 15) + "...",
          nickname: await checkExistUser(results[0][index].nickname),
        };
        freeBoardData.push(tempData);
      }
    }
    // 공부인증샷 최신글 파싱
    for (const index in results[1]) {
      // 게시글 제목의 글자수가 10자 이하일 때
      if (results[1][index].postTitle.length <= 10) {
        const tempData = {
          postTitle: results[1][index].postTitle,
          nickname: await checkExistUser(results[1][index].nickname),
          viewCount: await changeUnit(results[1][index].viewCount),
          favoriteCount: await changeUnit(results[1][index].favoriteCount),
        };
        studyBoardData.push(tempData);
        // 게시글 제목의 글자수가 10자 초과일 때
      } else if (results[1][index].postTitle.length > 10) {
        const tempData = {
          postTitle: results[1][index].postTitle.substring(0, 10) + "...",
          nickname: await checkExistUser(results[1][index].nickname),
          viewCount: await changeUnit(results[1][index].viewCount),
          favoriteCount: await changeUnit(results[1][index].favoriteCount),
        };
        studyBoardData.push(tempData);
      }
    }
    // 성공로그
    await modelSuccessLog(ip, "getRecentBoardModel");
    return { state: "최신글정보", dataOfFreeBoard: freeBoardData, dataOfStudyBoard: studyBoardData };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "getRecentBoardModel");
    return { state: "sequelize 사용실패" };
  }
}
// 1-2. 전체 게시글 정보 (글제목, 글쓴이(닉네임), 조회수, 좋아요 수, 작성날짜)
export async function entireBoardModel(category, page, ip) {
  const boardData = [];
  // 카테고리에 맞는 전체 게시글 정보 가져오기
  const query =
    `SELECT postTitle,viewCount,favoriteCount,nickname,BOARD.createTimestamp FROM BOARD LEFT JOIN USER ON BOARD.userIndex = User.userIndex` +
    ` WHERE BOARD.deleteTimestamp IS NULL AND BOARD.category = ? ORDER BY boardIndex DESC LIMIT ${10 * (page - 1)}, 10`;
  // 성공시
  try {
    const [results, metadata] = await db.sequelize.query(query, { replacements: [category] });
    // 게시글 정보가 없을 때
    if (results[0] === undefined) {
      return { state: "존재하지않는정보" };
    }
    // 게시글 정보 파싱
    for (const index in results) {
      // 게시글 제목의 글자수가 25자 미만일 때
      if (results[index].postTitle.length <= 25) {
        const tempData = {
          postTitle: results[index].postTitle,
          nickname: await checkExistUser(results[index].nickname),
          viewCount: await changeUnit(results[index].viewCount),
          favoriteCount: await changeUnit(results[index].favoriteCount),
          createDate: await changeTimestampForm(results[index].createTimestamp),
        };
        boardData.push(tempData);
      }
      // 게시글 제목의 글자수가 25자 이상일 때
      else if (results[index].postTitle.length > 25) {
        const tempData = {
          postTitle: results[index].postTitle.substring(0, 25) + "...",
          nickname: await checkExistUser(results[index].nickname),
          viewCount: await changeUnit(results[index].viewCount),
          favoriteCount: await changeUnit(results[index].favoriteCount),
          createDate: await changeTimestampForm(results[index].createTimestamp),
        };
        boardData.push(tempData);
      }
    }

    // 성공로그
    await modelSuccessLog(ip, "entireBoardModel");
    // 가져온 게시글 정보 return
    return { state: "전체게시글", dataOfBoard: boardData };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "entireBoardModel");
    return { state: "sequelize 사용실패" };
  }
}

// 1-3. 특정 게시글 상세보기
export async function detailBoardModel(category, boardIndex, ip, isViewDuplicated) {
  const tagData = [];
  let boardData;
  const results = [];
  // 해당 인덱스의 게시글/태그 정보 가져오는 쿼리문
  let query =
    "SELECT postTitle,postContent,viewCount,favoriteCount,BOARD.createTimestamp,USER.nickname FROM BOARD LEFT JOIN USER ON BOARD.userIndex = USER.userIndex" +
    " WHERE BOARD.deleteTimestamp IS NULL AND BOARD.category= ? AND boardIndex = ?";
  // 성공시
  try {
    // 게시글 정보가져오는 쿼리 메서드
    let [result, metadata] = await db.sequelize.query(query, {
      replacements: [category, boardIndex],
    });
    // 요청한 게시글 인덱스의 게시물이 존재하지 않을 때
    if (result[0] === undefined) {
      return { state: "존재하지않는게시글" };
    }
    // 게시글 정보 가져오는 쿼리 메서드
    query =
      "SELECT postTitle,USER.nickname,postContent,viewCount,favoriteCount,BOARD.createTimestamp FROM BOARD LEFT JOIN USER ON BOARD.userIndex = USER.userIndex " +
      "WHERE BOARD.deleteTimestamp IS NULL AND BOARD.category= ? AND boardIndex = ?";
    [result, metadata] = await db.sequelize.query(query, {
      replacements: [category, boardIndex],
    });
    results.push(result);

    // 태그 정보 가져오기
    result = await db["tag"].findAll({
      attributes: ["tag"],
      where: {
        deleteTimestamp: { [Op.is]: null },
        tag: { [Op.ne]: null },
        boardIndex: { [Op.eq]: boardIndex },
      },
    });
    results.push(result);

    // 최초 조회시 게시글 조회수 +1
    if (isViewDuplicated === false) {
      await db["board"].increment({ viewCount: 1 }, { where: { boardIndex: { [Op.eq]: boardIndex } } });
    }
    // 해당 게시글의 데이터 파싱
    // 게시글 데이터
    boardData = {
      postTitle: results[0][0].postTitle,
      nickname: await checkExistUser(results[0][0].nickname),
      postContent: results[0][0].postContent,
      viewCount: await changeUnit(results[0][0].viewCount),
      favoriteCount: await changeUnit(results[0][0].favoriteCount),
      createDate: await changeTimestampForm(results[0][0].createTimestamp),
    };
    // 태그 데이터
    for (let tagIndex in results[1]) {
      tagData.push({ tag: results[1][tagIndex].tag });
    }

    // 성공로그
    await modelSuccessLog(ip, "detailBoardModel");
    // 성공적으로 게시글 정보 조회
    return { state: "게시글상세보기", dataOfBoard: boardData, dataOfTag: tagData };

    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "detailBoardModel");
    return { state: "sequelize 사용실패" };
  }
}

// 2. 게시글 작성/수정/삭제
// 2-1. 게시글 최초 작성
export async function writeBoardModel(category, inputWrite, userIndex, ip) {
  const transactionObj = await db.sequelize.transaction();
  let tagSequence = 1;
  // DB에 저장될 형식(TINYINT)으로 변경
  if (category === "자유게시판") category = 0;
  else if (category === "공부인증샷") category = 1;
  // 성공시
  try {
    // 게시글 작성
    const result = await db["board"].create(
      {
        category: category,
        userIndex: userIndex,
        postTitle: inputWrite.postTitle,
        postContent: inputWrite.postContent,
        createTimestamp: db.sequelize.fn("NOW"),
        viewCount: 0,
        favorite: 0,
      },
      { transaction: transactionObj }
    );
    // 입력한 태그 추가
    for (const tagIndex in inputWrite.tags) {
      await db["tag"].create(
        {
          boardIndex: result.boardIndex,
          tag: inputWrite.tags[tagIndex].content,
          tagSequence: tagSequence,
          updateTimestamp: db.sequelize.fn("NOW"),
        },
        { transaction: transactionObj }
      );
      ++tagSequence;
    }
    // (5 - 입력태그 개수)개 만큼 빈 태그 추가
    for (; tagSequence <= 5; ++tagSequence) {
      await db["tag"].create(
        {
          boardIndex: result.boardIndex,
          tagSequence: tagSequence,
          updateTimestamp: db.sequelize.fn("NOW"),
        },
        { transaction: transactionObj }
      );
    }
    // 성공 로그찍기, 커밋하기
    await modelSuccessLog(ip, "writeBoardModel");
    await transactionObj.commit();
    return { state: "게시글작성완료" };
  } catch (err) {
    // 쿼리문 실행시 에러발생
    await modelFailLog(err, ip, "writeBoardModel");
    await transactionObj.rollback();
    return { state: "sequelize 사용실패" };
  }
}
// 2-2. 게시글 수정시 기존 게시글 정보 불러오기
export async function getWriteModel(boardIndex, userIndex, ip) {
  const tagData = [];
  const results = [];
  // 성공시
  try {
    // 기존 게시글 정보 불러오기
    let result = await db["board"].findAll({
      attributes: ["category", "postTitle", "postContent"],
      where: {
        deleteTimestamp: { [Op.is]: null },
        boardIndex: { [Op.eq]: boardIndex },
      },
    });
    results.push(result);
    // 해당 게시글이 없을 때
    if (results[0] === undefined) {
      return { state: "존재하지않는게시글" };
    }
    // 해당 게시글의 태그 정보 불러오기
    result = await db["tag"].findAll({
      attributes: ["tag"],
      where: {
        deleteTimestamp: { [Op.is]: null },
        tag: { [Op.ne]: null },
        boardIndex: { [Op.eq]: boardIndex },
      },
    });
    results.push(result);

    // DB에 TINYINT로 저장된 정보 문자열로 변경
    if (results[0][0].category === 0) results[0][0].category = "자유게시판";
    else if (results[0][0].category === 1) results[0][0].category = "공부인증샷";
    // 게시글 데이터
    const boardData = {
      category: results[0][0].category,
      postTitle: results[0][0].postTitle,
      postContent: results[0][0].postContent,
    };
    // 태그 데이터
    for (let tagIndex in results[1]) {
      tagData.push({ tag: results[1][tagIndex].tag });
    }

    // 성공로그
    await modelSuccessLog(ip, "getWriteModel");
    return { state: "게시글정보로딩", dataOfBoard: boardData, dataOfTag: tagData };
  } catch (err) {
    // 쿼리문 실행시 에러발생
    await modelFailLog(err, ip, "getWriteModel");
    return { state: "sequelize 사용실패" };
  }
}
// 2-3. 게시글 수정 요청
export async function editBoardModel(inputWrite, boardIndex, userIndex, ip) {
  const transactionObj = await db.sequelize.transaction();
  // body.category 의 문자열 DB에 저장될 형식(TINYINT)으로 변경
  if (inputWrite.category === "자유게시판") inputWrite.category = 0;
  else if (inputWrite.category === "공부인증샷") inputWrite.category = 1;
  let tagSequence = 1;
  // 성공시
  try {
    // 게시글 수정
    await db["board"].update(
      {
        postTitle: inputWrite.postTitle,
        postContent: inputWrite.postContent,
        updateTimestamp: db.sequelize.fn("NOW"),
      },
      { where: { boardIndex: boardIndex, userIndex: userIndex, category: inputWrite.category } },
      { transaction: transactionObj }
    );
    // 태그 수정
    // 입력한 태그 수정
    for (const tagIndex in inputWrite.tags) {
      await db["tag"].update(
        {
          tag: inputWrite.tags[tagIndex].content,
          updateTimestamp: db.sequelize.fn("NOW"),
        },
        { where: { boardIndex: boardIndex, tagSequence: tagSequence } },
        { transaction: transactionObj }
      );
      ++tagSequence;
    }
    // ( 5 - 입력한 태그개수)개 tag 값 null로 채우기
    for (; tagSequence <= 5; ++tagSequence) {
      await db["tag"].update(
        {
          tag: null,
          updateTimestamp: db.sequelize.fn("NOW"),
        },
        { where: { boardIndex: boardIndex, tagSequence: tagSequence } },
        { transaction: transactionObj }
      );
    }
    // 성공 로그찍기, 커밋하기
    await modelSuccessLog(ip, "editBoardModel");
    await transactionObj.commit();
    return { state: "게시글수정" };
  } catch (err) {
    await modelFailLog(err, ip, "editBoardModel");
    await transactionObj.rollback();
    return { state: "sequelize 사용실패" };
  }
}

// 2-4. 게시글 삭제 요청
export async function deleteBoardModel(boardIndex, userIndex, ip) {
  const transactionObj = await db.sequelize.transaction();
  // 해당 인덱스 게시글 삭제
  // 성공시
  try {
    // 게시글 삭제(delete 하는 것이 아니라 deleteTimestamp 에 값넣기)
    await db["board"].update(
      {
        deleteTimestamp: db.sequelize.fn("NOW"),
      },
      { where: { boardIndex: boardIndex, userIndex: userIndex } },
      { transaction: transactionObj }
    );
    // 해당 게시글의 태그 삭제(delete 하는 것이 아니라 deleteTimestamp 에 값넣기)
    await db["tag"].update(
      {
        deleteTimestamp: db.sequelize.fn("NOW"),
      },
      { where: { boardIndex: boardIndex } },
      { transaction: transactionObj }
    );
    // 해당 게시글 좋아요 누른 유저의 boardDeleteTimestamp 에 값 넣기 (delete 하는 것이 아니라 boardDeleteTimestamp 에 값넣기)
    await db["favoritePost"].update(
      {
        boardDeleteTimestamp: db.sequelize.fn("NOW"),
      },
      { where: { boardIndex: boardIndex } },
      { transaction: transactionObj }
    );
    // 해당 게시글의 댓글의 boardDeleteTimestamp 에 값 넣기
    await db["comment"].update(
      {
        boardDeleteTimestamp: db.sequelize.fn("NOW"),
      },
      { where: { boardIndex: boardIndex } },
      { transaction: transactionObj }
    );
    // 로그찍기
    await modelSuccessLog(ip, "deleteBoardModel");
    await transactionObj.commit();
    return { state: "게시글삭제" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await transactionObj.rollback();
    await modelFailLog(err, ip, "deleteBoardModel");
    return { state: "sequelize 사용실패" };
  }
}

// 3. 좋아요 요청/검색기능
// 3-1. 게시글 좋아요 요청
export async function favoriteBoardModel(boardIndex, userIndex, ip) {
  const transactionObj = await db.sequelize.transaction();
  // 성공시
  try {
    // 게시글 존재여부 체크
    let result = await db["board"].findAll({
      attributes: ["postTitle"],
      where: {
        deleteTimestamp: { [Op.is]: null },
        boardIndex: { [Op.eq]: boardIndex },
      },
    });
    if (result[0] === undefined) return { state: "존재하지않는게시글" };

    // favoritePost 테이블에 해당 게시글에 해당 유저가 좋아요 누른 정보 있나 체크
    result = await db["favoritePost"].findAll({
      attributes: ["favoriteFlag"],
      where: {
        boardIndex: { [Op.eq]: boardIndex },
        userIndex: { [Op.eq]: userIndex },
      },
    });
    // 좋아요 최초 요청
    if (result[0] === undefined) {
      // 해당 게시글에 좋아요를 한번도 누르지 않은 유저의 경우 좋아요 1 증가, 좋아요 누른 사람 목록에 해당 유저 추가
      await db["board"].increment(
        { favoriteCount: 1 },
        { where: { boardIndex: { [Op.eq]: boardIndex } } },
        { transaction: transactionObj }
      );
      await db["favoritePost"].create(
        {
          boardIndex: boardIndex,
          userIndex: userIndex,
          favoriteFlag: 0,
          updateTimestamp: db.sequelize.fn("NOW"),
        },
        { transaction: transactionObj }
      );

      await modelSuccessLog(ip, "favoriteBoardModel");
      await transactionObj.commit();
      // 정상적으로 좋아요 수 1증가
      return { state: "좋아요+1" };
      // 좋아요를 이미 누른 적이 있고 favoriteFlag 컬럼값이 TRUE 일 때, favoriteFlag 컬럼값 FALSE 로 바꿔주기
      // (게시글 조회시 favoriteFlag 의 값이 TRUE 로 돼있는 수만큼만 좋아요 수 집계, 0: FALSE, 1: TRUE)
    } else if (result[0] !== undefined) {
      if (result[0].favoriteFlag === true) {
        await db["board"].decrement(
          { favoriteCount: 1 },
          { where: { boardIndex: { [Op.eq]: boardIndex } } },
          { transaction: transactionObj }
        );
        await db["favoritePost"].update(
          {
            favoriteFlag: 0,
            updateTimestamp: db.sequelize.fn("NOW"),
          },
          {
            where: { boardIndex: { [Op.eq]: boardIndex }, userIndex: { [Op.eq]: userIndex } },
          },
          { transaction: transactionObj }
        );

        await modelSuccessLog(ip, "favoriteBoardModel");
        await transactionObj.commit();
        // 좋아요 취소
        return { state: "좋아요 취소" };
        // 좋아요를 이미 누른 적이 있고 favoriteFlag 컬럼값이 FALSE 일 때, favoriteFlag 컬럼값 TRUE 로 바꿔주기
        // (게시글 조회시 favoriteFlag 의 값이 TRUE 로 돼있는 수만큼만 좋아요 수 집계, 0: FALSE, 1: TRUE)
      } else if (result[0].favoriteFlag === false) {
        await db["board"].increment(
          { favoriteCount: 1 },
          { where: { boardIndex: { [Op.eq]: boardIndex } } },
          { transaction: transactionObj }
        );
        await db["favoritePost"].update(
          { favoriteFlag: 1, updateTimestamp: db.sequelize.fn("NOW") },
          {
            where: { boardIndex: { [Op.eq]: boardIndex }, userIndex: { [Op.eq]: userIndex } },
          },
          { transaction: transactionObj }
        );
        // 로그찍기
        await transactionObj.commit();
        await modelSuccessLog(ip, "favoriteBoardModel");
        // 좋아요 +1
        return { state: "좋아요+1" };
      }
    }
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await transactionObj.rollback();
    await modelFailLog(err, ip, "favoriteBoardModel");
    return { state: "sequelize 사용실패" };
  }
}

// 3-2. 게시글 검색 기능
export async function searchBoardModel(searchOption, searchContent, category, page, ip) {
  const boardData = [];
  // 검색 옵션에 맞는 게시글 정보 select 해오는 쿼리문 작성 (글제목, 글쓴이(닉네임), 조회수, 좋아요 수, 작성날짜)
  let query;
  // 제목만 검색한다고 옵션설정했을 때 검색해주는 쿼리문
  if (searchOption === "제목만") {
    query =
      `SELECT postTitle,viewCount,favoriteCount,nickname,createTimestamp FROM BOARD LEFT JOIN USER ON BOARD.userIndex = User.userIndex ` +
      `WHERE BOARD.deleteTimestamp IS NULL AND BOARD.category = ? AND postTitle LIKE % ${searchContent} % ORDER BY boardIndex DESC LIMIT ${
        10 * (page - 1)
      } , 10`;
    // 내용만 검색한다고 옵션설정했을 때 검색해주는 쿼리문
  } else if (searchOption === "내용만") {
    query =
      "SELECT postTitle,viewCount,favoriteCount,nickname,createTimestamp FROM BOARD LEFT JOIN USER ON BOARD.userIndex = User.userIndex WHERE BOARD.deleteTimestamp IS NULL AND BOARD.category =" +
      mysql.escape(category) +
      " AND postContent LIKE " +
      mysql.escape("%" + searchContent + "%") +
      "ORDER BY boardIndex DESC LIMIT " +
      10 * (page - 1) +
      ", 10";

    // 제목+내용 검색한다고 옵션설정했을 때 검색해주는 쿼리문
  } else if (searchOption === "제목 + 내용") {
    query =
      "SELECT postTitle,viewCount,favoriteCount,nickname,createTimestamp FROM BOARD LEFT JOIN USER ON BOARD.userIndex = User.userIndex WHERE BOARD.deleteTimestamp IS NULL AND BOARD.category =" +
      mysql.escape(category) +
      " AND postContent LIKE " +
      mysql.escape("%" + searchContent + "%") +
      "OR postContent LIKE" +
      mysql.escape("%" + searchContent + "%") +
      "ORDER BY boardIndex DESC LIMIT " +
      10 * (page - 1) +
      ", 10";
    // 일치하는 닉네임 검색한다고 옵션설정했을 때 검색해주는 쿼리문
  } else if (searchOption === "닉네임") {
    query =
      "SELECT postTitle,viewCount,favoriteCount,nickname,createTimestamp FROM BOARD LEFT JOIN USER ON BOARD.userIndex = User.userIndex WHERE BOARD.deleteTimestamp IS NULL AND BOARD.category =" +
      mysql.escape(category) +
      " AND nickname LIKE " +
      mysql.escape("%" + searchContent + "%") +
      "ORDER BY boardIndex DESC LIMIT " +
      10 * (page - 1) +
      ", 10";
  }
  // 성공시
  try {
    let results = await db.sequelize.query(query, {
      replacements: [category, searchContent],
    });
    console.log("결과" + results);
    console.log("결과" + results[0]);
    // 검색결과가 없을 때
    if (results[0] === undefined) {
      return { state: "검색결과없음" };
    }
    // 게시글 정보 파싱
    for (const index in results) {
      // 게시글 제목의 글자수가 25자 미만일 때
      if (results[index].postTitle.length <= 25) {
        const tempData = {
          postTitle: results[index].postTitle,
          nickname: await checkExistUser(results[index].nickname),
          viewCount: await changeUnit(results[index].viewCount),
          favoriteCount: await changeUnit(results[index].favoriteCount),
          createDate: await changeTimestampForm(results[index].createTimestamp),
        };
        boardData.push(tempData);
      }
      // 게시글 제목의 글자수가 25자 이상일 때
      else if (results[index].postTitle.length > 25) {
        const tempData = {
          postTitle: results[index].postTitle.substring(0, 25) + "...",
          nickname: await checkExistUser(results[index].nickname),
          viewCount: await changeUnit(results[index].viewCount),
          favoriteCount: await changeUnit(results[index].favoriteCount),
          createDate: await changeTimestampForm(results[index].createTimestamp),
        };
        boardData.push(tempData);
      }
    }
    // 검색결과가 있을 때
    return { state: "검색글정보", dataOfBoard: boardData };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, query);
    return { state: "sequelize 사용실패" };
  }
}

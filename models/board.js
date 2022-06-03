// 게시판 모델
// 내장모듈
import { db, Op } from "../orm/models/index.mjs";
import { modelFailLog, modelSuccessLog } from "../customModule/modelLog.js";
import { changeTimestampForm, changeUnit, checkExistUser } from "../customModule/changeDataForm.js";
import path, { dirname } from "path";
import fs from "fs";
import { fileURLToPath } from "url";
/*
 * 1. 게시글 조회
 * 2. 게시글 작성/수정/삭제
 * 3. 좋아요/검색 기능
 * 4. 유저가 작성한 게시글 조회
 */
// 1. 게시글 조회
// 1-1. 최신글 정보 가져오기
export async function getRecentBoardModel(ip) {
  const freeBoardData = [];
  const studyBoardData = [];
  const results = [];
  // 최신글 자유게시판 글 5개 불러오기
  let query =
    "SELECT boardIndex, postTitle,nickname FROM board LEFT JOIN user ON board.userIndex=user.userIndex" +
    " WHERE board.deleteTimestamp IS NULL AND board.boardIndex IS NOT NULL AND category = 0 order by boardIndex DESC limit 5";
  // 성공시
  try {
    let [result, metadata] = await db.sequelize.query(query);
    results.push(result);
    // 최신글 공부인증샷 글 4개 불러오기
    query =
      "SELECT boardIndex, postTitle,nickname,viewCount,favoriteCount FROM board LEFT JOIN user ON board.userIndex=user.userIndex " +
      " WHERE board.deleteTimestamp IS NULL AND board.boardIndex IS NOT NULL AND category = 1 order by boardIndex DESC limit 4;";
    [result, metadata] = await db.sequelize.query(query);
    results.push(result);
    // 자유게시판 최신글 파싱
    for (const index in results[0]) {
      // 게시글 제목의 글자수가 15자 이하일 때
      if (results[0][index].postTitle.length <= 15) {
        const tempData = {
          boardIndex: results[0][index].boardIndex,
          postTitle: results[0][index].postTitle,
          nickname: await checkExistUser(results[0][index].nickname),
        };
        freeBoardData.push(tempData);
      }
      // 게시글 제목의 글자수가 15자 초과일 때
      else if (results[0][index].postTitle.length > 15) {
        const tempData = {
          boardIndex: results[0][index].boardIndex,
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
          boardIndex: results[1][index].boardIndex,
          postTitle: results[1][index].postTitle,
          nickname: await checkExistUser(results[1][index].nickname),
          viewCount: await changeUnit(results[1][index].viewCount),
          favoriteCount: await changeUnit(results[1][index].favoriteCount),
        };
        studyBoardData.push(tempData);
        // 게시글 제목의 글자수가 10자 초과일 때
      } else if (results[1][index].postTitle.length > 10) {
        const tempData = {
          boardIndex: results[1][index].boardIndex,
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
    return { state: "recent_board_information", dataOfFreeBoard: freeBoardData, dataOfStudyBoard: studyBoardData };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "getRecentBoardModel");
    return { state: "fail_sequelize" };
  }
}
// 1-2. 전체 게시글 정보 (글제목, 글쓴이(닉네임), 조회수, 좋아요 수, 작성날짜)
export async function entireBoardModel(category, page, ip) {
  const boardData = [];
  // 카테고리에 맞는 전체 게시글 정보 가져오기
  const query =
    `SELECT boardIndex, postTitle,viewCount,favoriteCount,nickname,board.createTimestamp FROM board LEFT JOIN user ON board.userIndex = user.userIndex` +
    ` WHERE board.deleteTimestamp IS NULL AND board.category = ? ORDER BY boardIndex DESC LIMIT ${10 * (page - 1)}, 10`;
  // 성공시
  try {
    const [results, metadata] = await db.sequelize.query(query, { replacements: [category] });
    // 게시글 정보가 없을 때
    if (results[0] === undefined) {
      return { state: "not_exist" };
    }
    // 게시글 정보 파싱
    for (const index in results) {
      // 게시글 제목의 글자수가 25자 미만일 때
      if (results[index].postTitle.length <= 25) {
        const tempData = {
          boardIndex: results[index].boardIndex,
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
          boardIndex: results[index].boardIndex,
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
    return { state: "entire_board_information", dataOfBoard: boardData };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "entireBoardModel");
    return { state: "fail_sequelize" };
  }
}

// 1-3. 특정 게시글 상세보기
export async function detailBoardModel(category, boardIndex, ip, isViewDuplicated) {
  const tagData = [];
  const results = [];
  let userData;
  // 해당 인덱스의 게시글/태그 정보 가져오는 쿼리문
  let query =
    "SELECT boardIndex,postTitle,postContent,viewCount,favoriteCount,board.createTimestamp,user.nickname FROM board LEFT JOIN user ON board.userIndex = user.userIndex" +
    " WHERE board.deleteTimestamp IS NULL AND board.category= ? AND boardIndex = ?";
  // 성공시
  try {
    // 게시글 정보가져오는 쿼리 메서드
    let [result, metadata] = await db.sequelize.query(query, {
      replacements: [category, boardIndex],
    });
    // 요청한 게시글 인덱스의 게시물이 존재하지 않을 때
    if (result[0] === undefined) {
      return { state: "not_exist" };
    }
    // 게시글 정보 가져오는 쿼리 메서드
    query =
      "SELECT boardIndex, user.userIndex,postTitle,user.nickname,user.profileImage,postContent,viewCount,favoriteCount,board.createTimestamp FROM board LEFT JOIN user ON " +
      "board.userIndex = user.userIndex WHERE board.deleteTimestamp IS NULL AND board.category= ? AND boardIndex = ?";
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
    const boardData = {
      boardIndex: results[0][0].boardIndex,
      postTitle: results[0][0].postTitle,
      postContent: results[0][0].postContent,
      viewCount: await changeUnit(results[0][0].viewCount),
      favoriteCount: await changeUnit(results[0][0].favoriteCount),
      createDate: await changeTimestampForm(results[0][0].createTimestamp),
    };
    // 태그 데이터
    for (let tagIndex in results[1]) {
      tagData.push({ tag: results[1][tagIndex].tag });
    }
    // 유저 데이터
    // 등록된 프로필 이미지가 없을 때
    if (results[0][0].profileImage === null) {
      userData = {
        isProfileImage: false,
        nickname: await checkExistUser(results[0][0].nickname),
        userIndex: results[0][0].userIndex,
      };
    }
    // 등록된 프로필 이미지가 있을 때
    else {
      // 프로필 사진 파일 이름은 유저인덱스이므로 파일 이름과 요청 유저의 인덱스가 일치하지 않은 경우 분기처리
      const checkUserIndex = results[0][0].profileImage.split(".");
      if (checkUserIndex[0] !== "profileImage/" + results[0][0].userIndex) return { state: "incorrect_access" };
      // 프로필 사진 이름과 요청 유저의 인덱스가 일치할 때
      // es6 버전에서 __filename, __dirname 사용할 수 있게하기
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      // 경로 명에 맞는 프로필사진 base64로 인코딩해서 전달
      const profileImage = fs.readFileSync(path.join(__dirname, "..", results[0][0].profileImage));
      const encodingImage = new Buffer.from(profileImage).toString("base64");
      userData = {
        isProfileImage: true,
        nickname: await checkExistUser(results[0][0].nickname),
        profileImage: encodingImage,
        mime: `image/${checkUserIndex[1]}`,
        userIndex: results[0][0].userIndex,
      };
    }
    // 성공로그
    await modelSuccessLog(ip, "detailBoardModel");
    // 성공적으로 게시글 정보 조회
    return { state: "detail_board_information", dataOfBoard: boardData, dataOfTag: tagData, dataOfUser: userData };

    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "detailBoardModel");
    return { state: "fail_sequelize" };
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
    return { state: "write_complete" };
  } catch (err) {
    // 쿼리문 실행시 에러발생
    await modelFailLog(err, ip, "writeBoardModel");
    await transactionObj.rollback();
    return { state: "fail_sequelize" };
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
      return { state: "not_exist" };
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
    return { state: "board_information", dataOfBoard: boardData, dataOfTag: tagData };
  } catch (err) {
    // 쿼리문 실행시 에러발생
    await modelFailLog(err, ip, "getWriteModel");
    return { state: "fail_sequelize" };
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
    return { state: "edit_board" };
  } catch (err) {
    await modelFailLog(err, ip, "editBoardModel");
    await transactionObj.rollback();
    return { state: "fail_sequelize" };
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
    return { state: "delete_board" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await transactionObj.rollback();
    await modelFailLog(err, ip, "deleteBoardModel");
    return { state: "fail_sequelize" };
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
    if (result[0] === undefined) return { state: "not_exist" };

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
          favoriteFlag: 1,
          updateTimestamp: db.sequelize.fn("NOW"),
        },
        { transaction: transactionObj }
      );

      await modelSuccessLog(ip, "favoriteBoardModel");
      await transactionObj.commit();
      // 정상적으로 좋아요 수 1증가
      return { state: "favorite +1" };
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
        return { state: "cancel_favorite" };
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
        return { state: "favorite +1" };
      }
    }
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await transactionObj.rollback();
    await modelFailLog(err, ip, "favoriteBoardModel");
    return { state: "fail_sequelize" };
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
      `SELECT postTitle,viewCount,favoriteCount,nickname,board.createTimestamp FROM board LEFT JOIN user ON board.userIndex = user.userIndex ` +
      `WHERE board.deleteTimestamp IS NULL AND board.category = ? AND postTitle LIKE ? ORDER BY boardIndex DESC LIMIT ${
        10 * (page - 1)
      } , 10`;
    // 내용만 검색한다고 옵션설정했을 때 검색해주는 쿼리문
  } else if (searchOption === "내용만") {
    query =
      `SELECT postTitle,viewCount,favoriteCount,nickname,board.createTimestamp FROM board LEFT JOIN user ON board.userIndex = user.userIndex ` +
      `WHERE board.deleteTimestamp IS NULL AND board.category = ? AND postContent LIKE ? ORDER BY boardIndex DESC LIMIT ${
        10 * (page - 1)
      }
      , 10`;
    // 일치하는 닉네임 검색한다고 옵션설정했을 때 검색해주는 쿼리문
  } else if (searchOption === "닉네임") {
    query =
      `SELECT postTitle,viewCount,favoriteCount,nickname,board.createTimestamp FROM board LEFT JOIN user ON board.userIndex = user.userIndex ` +
      `WHERE board.deleteTimestamp IS NULL AND board.category = ? AND nickname LIKE ? ORDER BY boardIndex DESC LIMIT ${
        10 * (page - 1)
      }
      , 10`;
  }
  // 성공시
  try {
    let results = await db.sequelize.query(query, {
      replacements: [category, "%" + searchContent + "%"],
    });
    // 검색결과가 없을 때
    if (results[0][0] === undefined) {
      return { state: "not_exist" };
    }
    // 게시글 정보 파싱
    for (const index in results[0]) {
      // 게시글 제목의 글자수가 25자 미만일 때
      if (results[0][index].postTitle.length <= 25) {
        const tempData = {
          postTitle: results[0][index].postTitle,
          nickname: await checkExistUser(results[0][index].nickname),
          viewCount: await changeUnit(results[0][index].viewCount),
          favoriteCount: await changeUnit(results[0][index].favoriteCount),
          createDate: await changeTimestampForm(results[0][index].createTimestamp),
        };
        boardData.push(tempData);
      }
      // 게시글 제목의 글자수가 25자 이상일 때
      else if (results[0][index].postTitle.length > 25) {
        const tempData = {
          postTitle: results[0][index].postTitle.substring(0, 25) + "...",
          nickname: await checkExistUser(results[0][index].nickname),
          viewCount: await changeUnit(results[0][index].viewCount),
          favoriteCount: await changeUnit(results[0][index].favoriteCount),
          createDate: await changeTimestampForm(results[0][index].createTimestamp),
        };
        boardData.push(tempData);
      }
    }
    await modelSuccessLog(ip, "searchBoardModel");
    // 검색결과가 있을 때
    return { state: "search_board_information", dataOfBoard: boardData };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, query);
    return { state: "fail_sequelize" };
  }
}

// 4. 유저가 작성한 글 조회
export async function userBoardModel(userIndex, page, ip) {
  const boardData = [];
  // 해당 유저가 작성한 게시글 정보 가져오기
  const query = `SELECT boardIndex,postTitle,viewCount,favoriteCount FROM board WHERE deleteTimestamp IS NULL AND userIndex = ? ORDER BY boardIndex DESC LIMIT ${
    10 * (page - 1)
  }, 10`;
  // 성공시
  try {
    let [results, metadata] = await db.sequelize.query(query, {
      replacements: [userIndex],
    });
    // 요청한 데이터가 없을 때
    if (results[0] === undefined) {
      await modelSuccessLog(ip, "userBoardModel");
      return { state: "no_registered_information" };
    }
    // 게시글 정보 파싱
    for (const index in results) {
      // 게시글 제목의 글자수가 25자 미만일 때
      if (results[index].postTitle.length <= 25) {
        const tempData = {
          boardIndex: results[index].boardIndex,
          postTitle: results[index].postTitle,
          viewCount: await changeUnit(results[index].viewCount),
          favoriteCount: await changeUnit(results[index].favoriteCount),
          createDate: await changeTimestampForm(results[index].createTimestamp),
        };
        boardData.push(tempData);
      }
      // 게시글 제목의 글자수가 25자 이상일 때
      else if (results[index].postTitle.length > 25) {
        const tempData = {
          boardIndex: results[index].boardIndex,
          postTitle: results[index].postTitle.substring(0, 25) + "...",
          viewCount: await changeUnit(results[index].viewCount),
          favoriteCount: await changeUnit(results[index].favoriteCount),
          createDate: await changeTimestampForm(results[index].createTimestamp),
        };
        boardData.push(tempData);
      }
    }
    await modelSuccessLog(ip, "userBoardModel");
    return { state: "user_board", dataOfBoard: boardData };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "userBoardModel");
    return { state: "fail_sequelize" };
  }
}

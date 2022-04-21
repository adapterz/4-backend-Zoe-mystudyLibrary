// 데이터의 유무나 권한 체크하는 모듈
// 내장모듈
import { modelFailLog, modelSuccessLog } from "./QueryLog";
import { db, Op } from "../Orm/models";

// 삭제/수정 요청시 해당 게시글의 존재유무 체크, 해당 게시글의 작성자인지 체크 하는 함수
export async function checkBoardMethod(boardIndex, userIndex, ip) {
  // 성공시
  try {
    // 해당 게시글 존재여부 체크
    let result = await db["board"].findAll({
      attributes: ["userIndex"],
      where: {
        deleteTimestamp: { [Op.is]: null },
        boardIndex: { [Op.eq]: boardIndex },
      },
    });
    // 요청한 게시글이 존재하지 않을 때
    if (result[0] === undefined) {
      await modelSuccessLog(ip, "checkBoardMethod");
      return { state: "존재하지않는게시글" };
    }

    // 해당 게시글이 요청 유저가 작성한 것인지 체크
    result = await db["board"].findAll({
      attributes: ["userIndex"],
      where: {
        deleteTimestamp: { [Op.is]: null },
        boardIndex: { [Op.eq]: boardIndex },
        userIndex: { [Op.eq]: userIndex },
      },
    });
    // 해당 게시글의 작성자와 요청유저가 일치하지 않을 때
    if (result[0] === undefined) {
      await modelSuccessLog(ip, "checkBoardMethod");
      return { state: "접근권한없음" };
    }
    // 해당 게시글이 존재하고 게시글의 작성자와 요청유저가 일치할 때
    await modelSuccessLog(ip, "checkBoardMethod");
    return { state: "접근성공" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "checkBoardMethod");
    return { state: "sequelize 사용실패" };
  }
}

// 삭제/수정 요청시 해당 게시글,댓글의 존재유무 체크, 해당 댓글의 작성자인지 체크 하는 메서드
export async function checkCommentMethod(boardIndex, commentIndex, userIndex, isFirstWrite, ip) {
  // 성공시
  try {
    // 게시글이 존재하는지 확인
    let result = await db["board"].findAll({
      attributes: ["userIndex"],
      where: {
        deleteTimestamp: { [Op.is]: null },
        boardIndex: { [Op.eq]: boardIndex },
      },
    });
    // 게시글이 존재하지 않을 때
    if (result[0] === undefined) {
      await modelSuccessLog(ip, "checkCommentMethod");
      return { state: "존재하지않는게시글" };
    }

    // 해당 댓글이 존재하는지 확인
    if (commentIndex !== "NULL") {
      let result = await db["comment"].findAll({
        attributes: ["userIndex"],
        where: {
          deleteTimestamp: { [Op.is]: null },
          boardDeleteTimestamp: { [Op.is]: null },
          boardIndex: { [Op.eq]: boardIndex },
          commentIndex: { [Op.eq]: commentIndex },
        },
      });
      // 댓글이 존재하지 않을 때
      if (result[0] === undefined) {
        await modelSuccessLog(ip, "checkCommentMethod");
        return { state: "존재하지않는댓글" };
      }
    }
    // 댓글 수정 혹은 삭제 요청일 때 해당 댓글을 요청 유저가 작성한 것인지 확인(댓글 최초 작성시에는 해당 조건문 진입하지 않음)
    if (isFirstWrite === false) {
      let result = await db["comment"].findAll({
        attributes: ["userIndex"],
        where: {
          deleteTimestamp: { [Op.is]: null },
          userIndex: { [Op.eq]: userIndex },
          commentIndex: { [Op.eq]: commentIndex },
        },
      });
      // 해당 댓글의 작성자와 요청유저가 일치하지 않을 때
      if (result[0] === undefined) {
        await modelSuccessLog(ip, "checkCommentMethod");
        return { state: "접근권한없음" };
      }
    }
    // 게시글과 댓글이 존재하고 댓글작성자와 요청유저가 일치할 때
    await modelSuccessLog(ip, "checkCommentMethod");
    return { state: "접근성공" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "checkCommentMethod");
    return { state: "sequelize 사용실패" };
  }
}

// 삭제/수정 요청한 도서관정보가 있는지, 후기 정보가 있는지 유저가 해당 후기의 작성자인지 체크 하는 함수
export async function checkReviewMethod(libraryIndex, reviewIndex, userIndex, ip) {
  // 성공시
  try {
    // 해당 도서관이 존재하는지 확인
    let result = await db["library"].findAll({
      attributes: ["libraryType"],
      where: {
        deleteTimestamp: { [Op.is]: null },
        libraryIndex: { [Op.eq]: libraryIndex },
      },
    });
    // 도서관 정보가 존재하지 않을 때
    if (result[0] === undefined) {
      await modelSuccessLog(ip, "checkReviewMethod");
      return { state: "존재하지않는도서관" };
    }
    // 해당 후기가 존재하는지 확인
    result = await db["review"].findAll({
      attributes: ["userIndex"],
      where: {
        deleteTimestamp: { [Op.is]: null },
        reviewIndex: { [Op.eq]: reviewIndex },
      },
    });
    // 해당 후기가 존재하지 않을 때
    if (result[0] === undefined) {
      await modelSuccessLog(ip, "checkReviewMethod");
      return { state: "존재하지않는후기" };
    }
    // 해당 댓글을 해당 유저가 작성한 것인지 확인
    result = await db["review"].findAll({
      attributes: ["userIndex"],
      where: {
        deleteTimestamp: { [Op.is]: null },
        reviewIndex: { [Op.eq]: reviewIndex },
        userIndex: { [Op.eq]: userIndex },
      },
    });
    // 해당 후기의 작성자와 요청유저가 일치하지 않을 때
    if (result[0] === undefined) {
      await modelSuccessLog(ip, "checkReviewMethod");
      return { state: "접근권한없음" };
    }
    // 도서관과 후기가 존재하고 해당 후기의 작성자와 요청유저가 일치할 때
    await modelSuccessLog(ip, "checkReviewMethod");
    return { state: "접근성공" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "checkReviewMethod");
    return { state: "sequelize 사용실패" };
  }
}

// 삭제할 관심도서관 정보가 있는지 체크 하는 함수
export async function checkUserLibraryMethod(libraryIndex, userIndex, ip) {
  // 성공시
  try {
    // 해당 도서관이 존재하는지 확인
    let result = await db["library"].findAll({
      attributes: ["libraryIndex"],
      where: {
        deleteTimestamp: { [Op.is]: null },
        libraryIndex: { [Op.eq]: libraryIndex },
      },
    });
    // 해당 도서관이 존재하지 않을 때
    if (result[0] === undefined) {
      await modelSuccessLog(ip, "checkUserLibraryMethod");
      return { state: "존재하지않는도서관" };
    }
    // 해당 유저가 관심도서관 등록한 적이 있는지 확인
    result = await db["userLibrary"].findAll({
      attributes: ["libraryIndex"],
      where: {
        deleteTimestamp: { [Op.is]: null },
        libraryIndex: { [Op.eq]: libraryIndex },
        userIndex: { [Op.eq]: userIndex },
      },
    });
    // 기존에 관심도서관으로 등록되지 않았을 때
    if (result[0] === undefined) {
      await modelSuccessLog(ip, "checkUserLibraryMethod");
      return { state: "등록되지않은관심도서관" };
    }
    // 도서관이 존재하고 해당 도서관이 관심도서관으로 등록돼 있을 때
    return { state: "접근성공" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "checkUserLibraryMethod");
    return { state: "sequelize 사용실패" };
  }
}

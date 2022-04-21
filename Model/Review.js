// 후기 모델
// 내장모듈
import { db, Op } from "../Orm/models/index";
import { modelFailLog, modelSuccessLog } from "../CustomModule/QueryLog";
import { changeTimestampForm, checkExistUser } from "../CustomModule/ChangeDataForm";
/*
 * 1. 도서관 후기 등록
 * 2. 도서관의 후기 정보
 * 3. 수정시 기존 후기 정보 불러오기
 * 4. 후기 수정 요청
 * 5. 후기 삭제 요청
 */

// 도서관 후기 등록하는 모델
export async function registerReviewModel(libraryIndex, userIndex, inputComment, ip) {
  // 성공시
  try {
    // 기존에 해당 도서관에 해당 유저가 후기를 작성한적이 있는지 체크
    let result = await db["review"].findAll({
      attributes: ["reviewContent"],
      where: {
        deleteTimestamp: { [Op.is]: null },
        userIndex: { [Op.eq]: userIndex },
        libraryIndex: { [Op.eq]: libraryIndex },
      },
    });

    if (result[0] !== undefined) {
      await modelSuccessLog(ip, "registerReviewModel");
      return { state: "기존에 작성한 후기가 존재합니다." };
    }
    // 후기 등록
    await db["review"].create({
      libraryIndex: libraryIndex,
      userIndex: userIndex,
      reviewContent: inputComment.reviewContent,
      grade: inputComment.grade,
      createTimestamp: db.sequelize.fn("NOW"),
    });
    await modelSuccessLog(ip, "registerReviewModel");
    return { state: "도서관후기등록" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "registerReviewModel");
    return { state: "sequelize 사용실패" };
  }
}

// 도서관 후기 조회
export async function detailReviewModel(libraryIndex, page, ip) {
  let reviewData = [];
  try {
    // 도서관 정보가 있나 체크
    let result = await db["library"].findAll({
      attributes: ["libraryIndex"],
      where: {
        deleteTimestamp: { [Op.is]: null },
        libraryIndex: { [Op.eq]: libraryIndex },
      },
    });
    // 해당 도서관이 존재하지 않을 때
    if (result[0] === undefined) {
      await modelSuccessLog(ip, "detailReviewModel");
      return { state: "존재하지않는도서관" };
    }
    // 해당 도서관의 후기 가져오는 쿼리문
    let query = `SELECT nickname,reviewContent,grade,REVIEW.createTimestamp FROM REVIEW LEFT JOIN USER ON USER.userIndex = REVIEW.userIndex WHERE deleteTimestamp IS NULL AND libraryIndex = ? ORDER BY reviewIndex DESC LIMIT ${
      5 * (page - 1)
    },5`;
    let [results, metadata] = await db.sequelize.query(query, {
      replacements: [libraryIndex],
    });
    // 해당 도서관에 후기가 없을 때
    if (results[0] === undefined) {
      await modelSuccessLog(ip, "detailReviewModel");
      return { state: "후기없음" };
    }
    // 후기 정보 데이터
    for (let index in results) {
      const tempData = {
        nickname: await checkExistUser(results[index].nickname),
        reviewContent: results[index].reviewContent,
        grade: results[index].grade,
        createDate: await changeTimestampForm(results[index].createTimestamp),
      };
      reviewData.push(tempData);
    }

    await modelSuccessLog(ip, "detailReviewModel");
    return { state: "도서관의후기정보", dataOfReview: reviewData };

    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "detailReviewModel");
    return { state: "sequelize 사용실패" };
  }
}
// 수정시 기존 후기 정보 불러오는 모델
export async function getReviewModel(reviewIndex, loginCookie, ip) {
  // 성공시
  try {
    // 해당 reviewIndex 의 기존 리뷰정보 불러오기
    let result = await db["review"].findAll({
      attributes: ["reviewContent", "grade"],
      where: {
        deleteTimestamp: { [Op.is]: null },
        reviewIndex: { [Op.eq]: reviewIndex },
      },
    });
    // DB에 데이터가 없을 때
    if (result[0] === undefined) {
      await modelSuccessLog(ip, "getReviewModel");
      return { state: "존재하지않는후기" };
    }

    // 리뷰 데이터 가공
    const reviewData = {
      reviewContent: result[0].reviewContent,
      grade: Math.round(result[0].grade),
    };

    // DB에 데이터가 있을 때
    await modelSuccessLog(ip, "getReviewModel");
    return { state: "후기정보로딩", dataOfReview: reviewData };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "getReviewModel");
    return { state: "sequelize 사용실패" };
  }
}

// 후기 수정 요청
export async function editReviewModel(reviewIndex, loginCookie, inputReview, ip) {
  // 성공시
  try {
    // 후기 수정
    await db["review"].update(
      {
        reviewContent: inputReview.reviewContent,
        grade: inputReview.grade,
        updateTimestamp: db.sequelize.fn("NOW"),
      },
      { where: { reviewIndex: reviewIndex } }
    );
    // DB에 해당 인덱스의 댓글이 있을 때
    await modelSuccessLog(ip, "editReviewModel");
    return { state: "후기수정" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "editReviewModel");
    return { state: "sequelize 사용실패" };
  }
}

// 후기 삭제 요청
export async function deleteReviewModel(reviewIndex, userIndex, ip) {
  // 성공시
  try {
    // 해당 인덱스의 리뷰 삭제
    await db["review"].update(
      {
        deleteTimestamp: db.sequelize.fn("NOW"),
      },
      { where: { reviewIndex: reviewIndex, userIndex: userIndex } }
    );
    await modelSuccessLog(ip, "deleteReviewModel");
    return { state: "후기삭제" };
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "deleteReviewModel");
    return { state: "sequelize 사용실패" };
  }
}

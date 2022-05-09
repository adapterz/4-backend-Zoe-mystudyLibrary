// 후기 모델
// 내장모듈
import { db, Op } from "../orm/models/index.mjs"
import { modelFailLog, modelSuccessLog } from "../customModule/modelLog.js"
import { changeTimestampForm, checkExistUser } from "../customModule/changeDataForm.js"
/*
 * 1. 도서관 후기 등록
 * 2. 도서관의 후기 정보
 * 3. 수정시 기존 후기 정보 불러오기
 * 4. 후기 수정 요청
 * 5. 후기 삭제 요청
 * 6. 유저가 작성한 후기 조회
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
    })

    if (result[0] !== undefined) {
      await modelSuccessLog(ip, "registerReviewModel")
      return { state: "already_written" }
    }
    // 후기 등록
    await db["review"].create({
      libraryIndex: libraryIndex,
      userIndex: userIndex,
      reviewContent: inputComment.reviewContent,
      grade: inputComment.grade,
      createTimestamp: db.sequelize.fn("NOW"),
    })
    await modelSuccessLog(ip, "registerReviewModel")
    return { state: "register_review" }
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "registerReviewModel")
    return { state: "fail_sequelize" }
  }
}

// 도서관 후기 조회
export async function detailReviewModel(libraryIndex, page, ip) {
  let reviewData = []
  try {
    // 도서관 정보가 있나 체크
    let result = await db["library"].findAll({
      attributes: ["libraryIndex"],
      where: {
        deleteTimestamp: { [Op.is]: null },
        libraryIndex: { [Op.eq]: libraryIndex },
      },
    })
    // 해당 도서관이 존재하지 않을 때
    if (result[0] === undefined) {
      await modelSuccessLog(ip, "detailReviewModel")
      return { state: "non_existent_library" }
    }
    // 해당 도서관의 후기 가져오는 쿼리문
    let query =
      `SELECT nickname,reviewContent,grade,review.createTimestamp FROM review LEFT JOIN user ON user.userIndex = review.userIndex ` +
      `WHERE deleteTimestamp IS NULL AND libraryIndex = ? ORDER BY reviewIndex DESC LIMIT ${5 * (page - 1)},5`
    let [results, metadata] = await db.sequelize.query(query, {
      replacements: [libraryIndex],
    })
    // 해당 도서관에 후기가 없을 때
    if (results[0] === undefined) {
      await modelSuccessLog(ip, "detailReviewModel")
      return { state: "no_review" }
    }
    // 후기 정보 데이터
    for (let index in results) {
      const tempData = {
        nickname: await checkExistUser(results[index].nickname),
        reviewContent: results[index].reviewContent,
        grade: results[index].grade,
        createDate: await changeTimestampForm(results[index].createTimestamp),
      }
      reviewData.push(tempData)
    }

    await modelSuccessLog(ip, "detailReviewModel")
    return { state: "library's_review", dataOfReview: reviewData }

    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "detailReviewModel")
    return { state: "fail_sequelize" }
  }
}
// 수정시 기존 후기 정보 불러오는 모델
export async function getReviewModel(reviewIndex, libraryIndex, loginCookie, ip) {
  // 성공시
  try {
    // 해당 reviewIndex 의 기존 리뷰정보 불러오기
    let result = await db["review"].findAll({
      attributes: ["reviewContent", "grade"],
      where: {
        deleteTimestamp: { [Op.is]: null },
        reviewIndex: { [Op.eq]: reviewIndex },
        libraryIndex: { [Op.eq]: libraryIndex },
      },
    })
    // DB에 데이터가 없을 때
    if (result[0] === undefined) {
      await modelSuccessLog(ip, "getReviewModel")
      return { state: "no_review" }
    }

    // 리뷰 데이터 가공
    const reviewData = {
      reviewContent: result[0].reviewContent,
      grade: Math.round(result[0].grade),
    }

    // DB에 데이터가 있을 때
    await modelSuccessLog(ip, "getReviewModel")
    return { state: "review_information", dataOfReview: reviewData }
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "getReviewModel")
    return { state: "fail_sequelize" }
  }
}

// 후기 수정 요청
export async function editReviewModel(reviewIndex, libraryIndex, loginCookie, inputReview, ip) {
  // 성공시
  try {
    // 후기 수정
    await db["review"].update(
      {
        reviewContent: inputReview.reviewContent,
        grade: inputReview.grade,
        updateTimestamp: db.sequelize.fn("NOW"),
      },
      {
        where: {
          deleteTimestamp: { [Op.is]: null },
          reviewIndex: { [Op.eq]: reviewIndex },
          libraryIndex: { [Op.eq]: libraryIndex },
        },
      }
    )
    // DB에 해당 인덱스의 댓글이 있을 때
    await modelSuccessLog(ip, "editReviewModel")
    return { state: "edit_review" }
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "editReviewModel")
    return { state: "fail_sequelize" }
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
    )
    await modelSuccessLog(ip, "deleteReviewModel")
    return { state: "delete_review" }
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "deleteReviewModel")
    return { state: "fail_sequelize" }
  }
}

// 유저가 작성한 후기 조회
export async function userReviewModel(userIndex, page, ip) {
  const reviewData = []
  // 해당 유저가 작성한 후기 정보 가져오는 쿼리문
  const query =
    `SELECT review.reviewContent,review.grade,review.createTimestamp,library.libraryName FROM review INNER JOIN library ` +
    `ON review.libraryIndex = library.libraryIndex WHERE review.deleteTimestamp IS NULL AND library.deleteTimestamp IS NULL AND review.userIndex= ? ` +
    `ORDER BY reviewIndex DESC LIMIT ${5 * (page - 1)} ,5`

  // 성공시
  try {
    let [results, metadata] = await db.sequelize.query(query, {
      replacements: [userIndex],
    })
    // 데이터가 없을 때
    if (results[0] === undefined) {
      await modelSuccessLog(ip, "userReviewModel")
      return { state: "no_registered_information" }
    }
    // 데이터가 있을 때

    for (const index in results) {
      const tempData = {
        libraryName: results[index].libraryName,
        reviewContent: results[index].reviewContent,
        createDate: await changeTimestampForm(results[index].createTimestamp),
        grade: results[index].grade,
      }
      reviewData.push(tempData)
    }

    await modelSuccessLog(ip, "userReviewModel")
    return { state: "user_review", dataOfReview: reviewData }
    // 쿼리문 실행시 에러발생
  } catch (err) {
    await modelFailLog(err, ip, "userReviewModel")
    return { state: "fail_sequelize" }
  }
}

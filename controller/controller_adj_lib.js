// 내주변도서관 라우터의 컨트롤러
// db 모듈
const db = require("../a_mymodule/db");
// 날짜/시간 관련 모듈
const moment = require("../a_mymodule/date_time");

// 예시 데이터 (전체 도서관)
const user = {
  id: "Zoe",
  userIndex: 132132,
  nickName: "Zoe",
};

// 전체 도서관 정보 (get)
const allLib = function (req, res) {
  // 전체 도서관 정보 가져오는 쿼리문 + 도서관 별 review 평점 평균 가져오는 쿼리문
  const query =
    "SELECT libIndex,libName,libType,closeDay,timeWeekday,timeSaturday,timeHoliday,address,libContact,nameOfCity,districts FROM LIBRARY;" +
    "SELECT AVG(grade) FROM REVIEW GROUP BY libIndex;";

  db.db_connect.query(query, function (err, results) {
    if (err) {
      console.log(("allLib 메서드 mysql 모듈사용 실패:" + err).red.bold);
      return res.status(500).json({ state: "allLib 메서드 mysql 모듈사용 실패:" + err });
    }
    console.log(("CLIENT IP: " + req.ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + query).blue.bold);
    return res.status(200).json(results);
  });
};

// 내가 사는 지역을 입력하면 주변 도서관 정보를 주는 함수(post)
const localLib = function (req, res) {
  // 유저가 요청한 시도명/시군구명에 맞게 데이터 가져오는 쿼리문
  const query =
    "SELECT libIndex, libName,libType,closeDay,timeWeekday,timeSaturday,timeHoliday,address,libContact,nameOfCity,districts FROM LIBRARY WHERE nameOfCity =? AND districts =?";

  db.db_connect.query(query, [req.body.nameOfCity, req.body.districts], function (err, results) {
    if (err) {
      console.log(("localLib 메서드 mysql 모듈사용 실패:" + err).red.bold);
      return res.status(500).json({ state: "localLib 메서드 mysql 모듈사용 실패:" + err });
    }
    console.log(("CLIENT IP: " + req.ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + query).blue.bold);
    return res.status(200).json(results);
  });
};

// 특정 도서관 자세히 보기
const particularLib = function (req, res) {
  // 특정 libIndex의 도서관 정보 자세히 보기
  const query =
    "SELECT libIndex, libName,libType,closeDay,timeWeekday,timeSaturday,timeHoliday,grade,address,libContact,nameOfCity,districts FROM LIBRARY WHERE libIndex = ?";

  // 해당 인덱스의 도서관 정보 응답
  db.db_connect.query(query, [req.params.libIndex], function (err, results) {
    if (err) {
      console.log(("particularLib 메서드 mysql 모듈사용 실패:" + err).red.bold);
      return res.status(500).json({ state: "particularLib 메서드 mysql 모듈사용 실패:" + err });
    }
    console.log(("CLIENT IP: " + req.ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + query).blue.bold);
    return res.status(200).json(results);
  });
};

// TODO 로그인 여부 체크 공부 후 다시 작성
// 내 정보 '관심도서관' 항목에 해당 인덱스의 도서관 데이터 추가
const registerMyLib = function (req, res) {
  // 로그인이 안 돼있을 때
  if (user.id === null) return res.status(401).json({ state: "인증되지 않은 사용자입니다. " });
  const parse_libIndex = req.params.libIndex + ";";
  // 해당 유저의 userLib 컬럼에 관심있는 도서관의 libIndex 추가하기, 추후 ;로 파싱
  const query = "UPDATE USER SET userLib =concat(userLib,parse_libIndex) WHERE id = ?";
  // 해당 인덱스의 도서관 정보 응답
  db.db_connect.query(query, [user.id], function (err) {
    if (err) {
      console.log(("registerLib 메서드 mysql 모듈사용 실패:" + err).red.bold);
      return res.status(500).json({ state: "registerLib 메서드 mysql 모듈사용 실패:" + err });
    }
    console.log(("CLIENT IP: " + req.ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + query).blue.bold);

    return res.status(200).end();
  });
};

// TODO 로그인 배운 뒤 다시 작성
// 특정 도서관 이용 후 후기등록
const registerComment = function (req, res) {
  console.log("0");
  // 로그인이 안 돼있을 때
  if (user.id === null) return res.status(401).json({ state: "인증되지 않은 사용자입니다. " });
  // 후기 등록 쿼리문
  const query = "INSERT INTO REVIEW(nickName, libIndex,reviewContent,grade,created) VALUES (?,?,?,?,?)";
  db.db_connect.query(
    query,
    [user.nickName, req.params.libIndex, req.body.reviewContent, req.body.grade, moment().format("YYYY-MM-DD HH:mm:ss").toString()],
    function (err) {
      // 오류 발생
      if (err) {
        console.log(("registerComment 메서드 mysql 모듈사용 실패:" + err).red.bold);
        return res.status(500).json({ state: "registerComment 메서드 mysql 모듈사용 실패:" + err });
      }
      // 정상적으로 쿼리문 실행(후기 등록)
      console.log(("CLIENT IP: " + req.ip + "\nDATETIME: " + moment().format("YYYY-MM-DD HH:mm:ss") + "\nQUERY: " + query).blue.bold);

      return res.status(201).end();
    },
  );
};

// TODO 로그인 배운 뒤 다시 작성
// 후기 삭제
const deleteReview = function (req, res) {
  // 로그인이 안 돼있을 때
  if (user.id === null) return res.status(401).json({ state: "인증되지 않은 사용자입니다. " });

  const query = "UPDATE REVIEW SET deleteDate = ? WHERE reviewIndex = ?";
  // 오류 발생
  db.db_connect.query(query, [moment().format("YYYY-MM-DD HH:mm:ss"), req.query.reviewIndex], function (err) {
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
  allLib: allLib,
  localLib: localLib,
  particularLib: particularLib,
  registerMyLib: registerMyLib,
  registerComment: registerComment,
  deleteReview: deleteReview,
};

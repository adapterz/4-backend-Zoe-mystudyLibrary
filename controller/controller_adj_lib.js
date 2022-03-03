// 내주변도서관 라우터의 컨트롤러
// db 모듈
const db = require("../db");

// 예시 데이터 (전체 도서관)
const user = {
  userIndex: 132132,
};

// 전체 도서관 정보 (get)
const allLib = function (req, res) {
  // 전체 도서관 정보 가져오는 쿼리문
  const query_string =
    "SELECT libIndex,libName,libType,closeDay,timeWeekday,timeSaturday,timeHoliday,grade,address,libContact,nameOfCity,districts FROM LIBRARY";

  db.db_connect.query(query_string, function (err, results, fields) {
    if (err) return res.status(500).send("allLib mysql 모듈사용 실패:" + err);
    else return res.status(200).json(results);
  });
};

// 내가 사는 지역을 입력하면 주변 도서관 정보를 주는 함수(post)
const localLib = function (req, res) {
  // 유저가 요청한 시도명/시군구명에 맞게 데이터 가져오는 쿼리문
  const query_string =
    "SELECT libIndex, libName,libType,closeDay,timeWeekday,timeSaturday,timeHoliday,grade,address,libContact,nameOfCity,districts FROM LIBRARY WHERE nameOfCity =? AND districts =?";

  db.db_connect.query(query_string, [req.body.nameOfCity, req.body.districts], function (err, results, fields) {
    if (err) return res.status(500).send("localLib mysql 모듈사용 실패:" + err);
    else return res.status(200).json(results);
  });
};

// 특정 도서관 자세히 보기
const particularLib = function (req, res) {
  // 해당 인덱스의 도서관 정보 응답
  res.status(200).json(req.query.libIndex);
};

// TODO
// 내 정보 '관심도서관' 항목에 해당 인덱스의 도서관 데이터 추가
const registerMyLib = function (req, res) {
  /*
  body 예시
  {
  nickName :"Zoe",
  lib_index : req.params.libIndex
  }
   */
  // 로그인이 안 돼있을 때
  if (user.userIndex === null) return res.status(401).json({ state: "인증되지 않은 사용자입니다. " });

  // 성공적으로 user정보의 myLib 키에 도서관 정보 추가
  res.status(200).end();
};

// 특정 도서관 이용 후 후기등록
const registerComment = function (req, res) {
  /*
  body 예시
  const comment_data = {
  nickName:"Zoe",
  created:"2022-02-28",
  libName:"늘푸른도서관",
  commentIndex: 3,
  comment:"너무 조용하고 분위기 좋아요!!",
  photo: "사진url",
  favorite: 124,
  }
   */
  // 로그인이 안 돼있을 때
  if (user.userIndex === null) return res.status(401).json({ state: "인증되지 않은 사용자입니다. " });

  const comment_data = req.body;
  res.status(201).json(comment_data);
};

// 후기 삭제
const deleteComment = function (req, res) {
  // 로그인이 안 돼있을 때
  if (user.userIndex === null) return res.status(401).json({ state: "인증되지 않은 사용자입니다. " });

  res.status(204).end();
};

// 모듈화
module.exports = {
  allLib: allLib,
  localLib: localLib,
  particularLib: particularLib,
  registerMyLib: registerMyLib,
  registerComment: registerComment,
  deleteComment: deleteComment,
};

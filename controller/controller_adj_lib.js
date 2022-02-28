// 내주변도서관 라우터의 컨트롤러
// 예시 데이터 (전체 도서관)
const { validationResult } = require("express-validator");
const all_lib = [
  {
    libIndex: 1,
    libName: "늘푸른도서관",
    libType: "작은도서관",
    close: "토요일",
    openHourWeekday: "09:00~21:00",
    openHourSaturday: "00:00~00:00", // 열지 않음
    openHourHoliday: "09:00~18:00",
    grade: "3.7/5",
    address: "광주광역시 남구 독립로 70-1",
    phoneNumber: "0621234567",
    comments: [{ commentIndex: "후기1" }, { commentIndex: "후기2" }],
  },
  {
    libIndex: 2,
    libName: "하남시일가도서관",
    libType: "공공도서관",
    close: "매주 일요일 및 국가지정 공휴일",
    openHourWeekday: "09:00~21:00",
    openHourSaturday: "09:00~18:00",
    openHourHoliday: "00:00~00:00", // 열지 않음
    grade: "3.7/5",
    address: "하남시 ~구 ~~로 ",
    phoneNumber: "0621234567",
    comments: [{ commentIndex: "후기1" }, { commentIndex: "후기2" }],
  },
];
// 전체 정보 (get)
const allLib = function (req, res) {
  res.status(200).json(all_lib);
};

// 내가 사는 지역을 입력하면 주변 도서관 정보를 주는 함수(post)
const localLib = function (req, res) {
  // 라우터에서 정의한 유효성 검사결과
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ state: "유효하지 않은 데이터입니다." });

  //  요청 예시 데이터(body)
  /*
  const where_live = {
    nameOfCity: "광주광역시", //시도명
    districts: "서구", //시군구명
  };
*/
  const where_live = req.body;
  // 응답 예시 데이터(body)- 일부 데이터
  const local_lib = [
    {
      libIndex: 1,
      libName: "늘푸른도서관",
      libType: "작은도서관",
      close: "토요일",
      openHourWeekday: "09:00~21:00",
      openHourSaturday: "00:00~00:00", // 열지 않음
      openHourHoliday: "09:00~18:00",
      grade: "3.7/5",
      address: "광주광역시 남구 독립로 70-1",
      phoneNumber: "0621234567",
      nameOfCity: where_live.nameOfCity,
      districts: where_live.districts,
      comments: [{ commentIndex: "후기1" }, { commentIndex: "후기2" }],
    },
    {
      libIndex: 2,
      libName: "일가도서관",
      libType: "공공도서관",
      close: "매주 일요일 및 국가지정 공휴일",
      openHourWeekday: "09:00~21:00",
      openHourSaturday: "09:00~18:00",
      openHourHoliday: "00:00~00:00", // 열지 않음
      grade: "3.7/5",
      address: "하남시 ~구 ~~로 ",
      phoneNumber: "0621234567",
      nameOfCity: where_live.nameOfCity,
      districts: where_live.districts,
      comments: [{ commentIndex: "후기1" }, { commentIndex: "후기2" }],
    },
  ];

  res.status(200).json(local_lib);
};

// 특정 도서관 자세히 보기
const particularLib = function (req, res) {
  const lib_index = req.params.libIndex;

  // 해당 인덱스의 도서관 정보 응답
  res.status(200).json(all_lib[lib_index - 1]);
};
// 내 정보 '관심도서관' 항목에 해당 인덱스의 도서관 데이터 추가
const registerMyLib = function (req, res) {
  /*
  body 예시
  {
  nickName :"Zoe",
  lib_index : req.params.libIndex
  }
   */
  const user = req.body;
  // 로그인이 안 돼있을 때
  if (user.nickName === null) {
    return res.status(401).json({ state: "인증되지 않은 사용자입니다. " });
  }
  // 성공적으로 user정보의 myLib 키에 도서관 정보 추가
  res.status(200).end();
};

// 특정 도서관 이용 후 후기등록
const registerComment = function (req, res) {
  // 라우터에서 정의한 유효성 검사결과
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ state: "유효하지 않은 데이터입니다." });
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
  const comment_data = req.body;
  // 로그인이 안 돼있을 때
  if (comment_data.nickName === null) {
    return res.status(401).json({ state: "인증되지 않은 사용자입니다. " });
  }
  res.status(201).json(comment_data);
};

// 후기 삭제
const deleteComment = function (req, res) {
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

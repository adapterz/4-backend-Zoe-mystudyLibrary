// 예시자료
/*
 유저 정보
 게시물 정보
 */

// 예시 유저 정보
const users = [
  {
    ID: "syjg1234",
    Password: "hassing_pw1",
    Name: "Zoe",
    Gender: "Woman",
    Phone_number: "01028400631",
    salt: "1234#",
    nickname: null,
    profile_shot: null,
  },
  {
    ID: "ye1919",
    Password: "hassing_pw2",
    Name: "Yeji",
    Gender: "Woman",
    Phone_number: "01128400631",
    salt: "1234!",
    nickname: null,
    profile_shot: null,
  },
  {
    ID: "hihi123",
    Password: "hassing_pw3",
    Name: "Leehi",
    Gender: "Man",
    Phone_number: "01234567890",
    salt: "12a13",
    nickname: null,
    profile_shot: null,
  },
];
// 회원가입시 입력 정보
const input_user_data = {
  id: "hi1234",
  pw: "ThisPw1234!",
  confirm_pw: "ThisPw1234!",
  name: "김예지",
  gender: "여",
  phone_num: "01028400631",
};

// new_user_data(비밀번호 변경시 필요)
const new_user_data = {
  new_pw: "NewData123!",
  confirm_pw: "NewData123!",
};

// 예시 글 목록
const boards = [
  {
    id: 3,
    name: "닉네임3",
    category: "자유게시판",
    title: "글제목3",
    content: "글내용3",
    tags: ["태그3-1", "태그3-2"],
    created: "2022-02-24",
    comments: [
      { user_id: "댓글1" },
      { user_id: "댓글2" },
      { user_id: "댓글3" },
    ],
  },
  {
    id: 2,
    name: "닉네임2",
    category: "공부인증샷",
    title: "글제목2",
    content: "글내용2",
    tags: ["태그2-1", "태그2-2"],
    created: "2022-02-24",
    comments: [
      { user_id: "댓글1" },
      { user_id: "댓글2" },
      { user_id: "댓글3" },
    ],
  },
  {
    id: 1,
    name: "닉네임1",
    category: "자유게시판",
    title: "글제목1",
    content: "글내용1",
    tags: ["태그1-1", "태그1-2"],
    created: "2022-02-24",
    comments: [
      { user_id: "댓글1" },
      { user_id: "댓글2" },
      { user_id: "댓글3" },
    ],
  },
];

module.exports = {
  users: users,
  input_user_data: input_user_data,
  new_user_data: new_user_data,
  boards: boards,
};

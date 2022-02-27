// 내 정보 라우터의 컨트롤러
// 모델 객체
const model_user = require("../../model/user");
// 예시 유저
const user_data = {
  ID: "syjg1234",
  Password: "hassing_pw1",
  Name: "Zoe",
  Gender: "Woman",
  Phone_number: "01028400631",
  salt: "1234#",
  nickname: null,
  profile_shot: null,
};
// 해당 라우터에서 get 요청을 받았을 때(기본 화면)
const get_user = function (req, res) {
  // 유저정보 받아오기
  const user_page = {
    "내 프로필": [
      user_data.profile_shot,
      { nickname: user_data.nickname },
      "수정 버튼",
    ],
    "연락처 및 회원 정보": [
      { name: user_data.name },
      { Phone_number: user_data.Phone_number },
    ],
    Password: "변경 버튼",
  };
  res.status(200).json(user_page);
};
// 내 프로필(get)
const get_profile = function (req, res) {
  const profile_page = {
    프로필사진: [user_data.profile_shot, "사진변경 버튼", "사진삭제 버튼"],
    닉네임: ["닉네임 입력 텍스트 필드", "닉네임은 2~8글자 이하로 입력해주세요"],
  };

  res.status(200).json(profile_page);
};

// 내 프로필 수정(patch)
const patch_profile = function (req, res) {
  // 기존 유저 정보 가져오기(DB 배우고 수정)
  const user_data = null;

  // 입력된 프로필 정보 가져오기
  const new_user_data = req.body;

  // 프로필 정보 변경
  model_user.revise_profile(
    new_user_data.profile_shot,
    new_user_data.nickname,
    user_data.id
  );

  // 내정보창으로 이동
  res.status(200).redirect("/user");
};

// 연락처 및 회원 정보 창(get)
const get_user_data = function (req, res) {
  const user_info = {
    name: user_data.name,
    Phone_number: [
      user_data.Phone_number,
      { "변경할 휴대전화": { text_field: "번호 입력 텍스트 필드" } },
    ],
    Gender: user_data.Gender,
  };
  res.status(200).json(user_info);
};

// 연락처 및 회원 정보 창(patch)
const patch_user_data = function (req, res) {
  // 기존 유저 정보 가져오기(DB 배우고 수정)
  const user_data = null;

  // 입력된 정보 가져오기
  const new_user_data = req.body;

  // 번호 변경
  model_user.revise_user_data(new_user_data.Phone_number, user_data.id);

  // 내정보창으로이동
  res.status(200).redirect("/user");
};

// 비밀번호 수정(get)
const get_revise_pw = function (req, res) {
  const revise_pw_page = {
    비밀번호변경: [
      {
        text_field1: "현재 비밀번호 텍스트필드",
      },
      { text_field2: "새 비밀번호 텍스트 필드" },
      { text_field3: "새 비밀번호 확인 텍스트 필드" },
    ],
    button1: "확인",
    button2: "취소",
  };
  res.status(200).json(revise_pw_page);
};

// 비밀번호 수정(patch)
// 고민: 자동입력방지 문자는 어떻게하지...?
const patch_revise_pw = function (req, res) {
  // 기존 유저 정보 가져오기(DB 배우고 수정)
  const user_data = null;

  // 입력된 비밀번호 정보 가져오기
  const new_user_data = req.body;

  // 비밀번호 변경
  model_user.revise_pw(
    user_data.pw.toString(),
    new_user_data.new_pw.toString(),
    new_user_data.confirm_pw.toString(),
    user_data.ID.toString()
  );

  // 내정보창으로 이동
  res.send(200).redirect("/user");
};

// 회원탈퇴창(get)
const get_drop_out = function (req, res) {
  const drop_out_page = {
    탈퇴안내: "회원탈퇴를 신청하기 전에 안내사항을 꼭 확인해주세요",
    null: [
      "사용하고 계신 아이디는 탈퇴할 경우 재사용 및 복구가 불가능합니다",
      "탈퇴 후 회원정보 및 개인형 서비스 이용기록은 모두 삭제됩니다.",
      "탈퇴 후에도 게시판형 서비스에 등록한 게시물은 그대로 남아 있습니다",
    ],
    checkbox1: "안내사항을 모두 확인했으며, 이에 동의합니다.",
    button1: "확인",
  };
  res.status(200).json(drop_out_page);
};
// 회원탈퇴요청
const delete_drop_out = function (req, res) {
  // 기존 유저 정보 가져오기(DB 배우고 수정)
  // const user_data = null;

  // 회원탈퇴안내 동의여부 (DB 배우고 나중에 수정)
  const is_agree = null;

  // 회원정보삭제
  if (is_agree) {
    //model_user.delete_user_data(user_data.id);
    // 홈 화면으로 이동
    res.status(204).redirect("/");
  } else if (!is_agree) {
    const drop_out_page = {
      탈퇴안내: "회원탈퇴를 신청하기 전에 안내사항을 꼭 확인해주세요",
      null: [
        "사용하고 계신 아이디는 탈퇴할 경우 재사용 및 복구가 불가능합니다",
        "탈퇴 후 회원정보 및 개인형 서비스 이용기록은 모두 삭제됩니다.",
        "탈퇴 후에도 게시판형 서비스에 등록한 게시물은 그대로 남아 있습니다",
      ],
      checkbox1: "안내사항을 모두 확인했으며, 이에 동의합니다.",
      button1: "확인",
    };
    const fail = { state: "안내사항을 확인한 뒤 동의 버튼에 체크해주세요." };
    res.status(200).json(drop_out_page + fail);
  }
};

// 모듈화
module.exports = {
  get_user: get_user,
  get_profile: get_profile,
  patch_profile: patch_profile,
  get_user_data: get_user_data,
  patch_user_data: patch_user_data,
  get_revise_pw: get_revise_pw,
  patch_revise_pw: patch_revise_pw,
  get_drop_out: get_drop_out,
  delete_drop_out: delete_drop_out,
};

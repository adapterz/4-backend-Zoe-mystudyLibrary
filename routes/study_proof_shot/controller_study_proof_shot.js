// 공부인증샷 창의 라우터의 컨트롤러

// 해당 라우터에서 get 요청을 받았을 때
const get_study_proof_shot = function (req, res) {
  res.send("공부인증샷");

  console.log("/study_proof_shoot");
};

// 모듈화
module.exports = {
  get_study_proof_shot: get_study_proof_shot,
};

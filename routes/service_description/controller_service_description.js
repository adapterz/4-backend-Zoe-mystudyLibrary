// 서비스 설명 화면의 라우터의 컨트롤러

// 해당 라우터에서 get 요청을 받았을 때
const get_service_description = function (req, res) {
  res.status(200).send("서비스설명화면");
};

// 모듈화
module.exports = {
  get_service_description: get_service_description,
};

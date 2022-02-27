// 서비스 설명 화면의 라우터의 컨트롤러

// 해당 라우터에서 get 요청을 받았을 때
const get_service_description = function (req, res) {
  const service_page = {
    "해당 서비스는 어떤 서비스인가요?":
      "지역을 입력하면 해당 지역에 있는 도서관들의 정보와 후기를 모아서 보여주는 서비스입니다.",
    "사이트를 이용하는 법": [
      "1. '내주변도서관' 탭을 누른다.",
      "2. 이용할 도서관의 지역을 정한다.",
      "3. 표로 정리된 도서관의 이름을 누르면 해당 도서관의 후기와 평점을 볼 수 있다.",
      "4.쉬는 날과 운영시간을 확인한 후 도서관에 가기",
      "5.'공부인증샷' 탭에서 사이트 이용자들과 함께 공부인증샷을 공유해보자",
    ],
    example_shot: null,
  };
  res.status(200).send(service_page);
};

// 모듈화
module.exports = {
  get_service_description: get_service_description,
};

// 날짜/시간 관련 모듈 설치 및 표준시간대 서울로 설정
// 외장모듈
import moment from "moment";
import "moment-timezone";

moment.tz.setDefault("Asia/Seoul");

export { moment };

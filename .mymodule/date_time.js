// 날짜/시간 관련 모듈
const moment = require("moment");
require("moment-timezone");
moment.tz.setDefault("Asia/Seoul");

module.exports = moment;

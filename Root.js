// express 모듈 가져오기
const express = require("express");
const app = express();

// req.body 사용에 필요한 'body-parser' 미들웨어
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extends: false }));

// 컨텐츠 보안 정책에 따른 'helmet' 미들웨어 사용
const helmet = require("helmet");
app.use(helmet());
app.disable("x-powered-by");

// dotenv 모듈
require("dotenv").config();

// console 로그 예쁘게 쓰기
const colors = require("colors");

// 날짜/시간 관련 모듈
const moment = require("./my_module/date_time");

// 쿠키&세션 모듈
const cookieParser = require("cookie-parser");
app.use(cookieParser("secret"));
const session = require("express-session");
app.use(
  session({
    secret: process.env.SESSION_PASSWORD,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  }),
);

// 경로별로 라우팅
const board_router = require("./router/board");
const comment_router = require("./router/comment");
const library_router = require("./router/library");
const review_router = require("./router/review");
const user_router = require("./router/user");

app.use("/comment", comment_router);
app.use("/library", library_router);
app.use("/review", review_router);
app.use("/user", user_router);
app.use("/", board_router);

// 404 에러처리
app.get("/not_found", function (req, res) {
  res.status(404).send("not founded page");
});

// 도서관 정보 테이블에 넣기

//const library_request = require("./my_module/open_api");
//library_request.reqOpenData();

//console.log(query);
// 서버 시작
app.listen(process.env.PORT, () => {
  console.log(("Start Lib Server at" + moment().format(" YYYY-MM-DD HH:mm:ss")).rainbow.bold);
});

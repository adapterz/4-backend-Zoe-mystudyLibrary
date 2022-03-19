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
const moment = require("./a_mymodule/date_time");

// 쿠키&세션 모듈
const cookieParser = require("cookie-parser");
app.use(cookieParser("secret"));
const session = require("express-session");
const MemoryStore = require("session-memory-store")(session);
app.use(
  session({
    secret: process.env.SESSION_PASSWORD,
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore(),
  }),
);

// 경로별로 라우팅
const adj_lib_router = require("./router/library");
const board_router = require("./router/board");
const home_router = require("./router/home");
const login_router = require("./router/login");
const new_user_router = require("./router/new_user");
const service_description_router = require("./router/service_description");
const user_router = require("./router/user");
const my_router = require("./router/my");
app.use("/library", adj_lib_router);
app.use("/", board_router);
app.use("/home", home_router);
app.use("/user2", login_router);
app.use("/new-user", new_user_router);
app.use("/description", service_description_router);
app.use("/user", user_router);
app.use("/my", my_router);

// 404 에러처리
app.get("/not_found", function (req, res) {
  res.status(404).send("not founded page");
});

// 도서관 정보 테이블에 넣기

//const library_request = require("./a_mymodule/open_api");
//library_request.reqOpenData();

//console.log(query);
//  서버 시작
app.listen(process.env.PORT, () => {
  console.log(("Start Lib Server at" + moment().format(" YYYY-MM-DD HH:mm:ss")).rainbow.bold);
});

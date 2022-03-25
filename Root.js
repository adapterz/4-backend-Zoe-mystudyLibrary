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
const moment = require("./CustomModule/DateTime");

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

// 로그 DB에 저장하는데 필요한 미들웨어
const morgan = require("morgan");
const winston = require("winston");
const { SqlTransport } = require("winston-sql-transport");
// DB에 로그 작성
// DB 설정
const transportConfig = {
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
};

const logger = new winston.createLogger({
  transports: [
    new SqlTransport(transportConfig),
    // 로그 파일에 로그 작성
    // new winston.transports.File({
    //   level: "info",
    //   filename: "./logs/all-logs.log",
    //   handleExceptions: true,
    //   json: true,
    //   maxFiles: 5,
    //   colorize: true,
    // }),
  ],
  exitOnError: false,
});

// morgan winston 설정
logger.stream = {
  write: function (message, encoding) {
    logger.info(message);
  },
};

// morgan 미들웨어 출력 winston 으로 전달
app.use(morgan("combined", { stream: logger.stream }));

// 개발단계 콘솔 출력
/*
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      level: "debug",
      handleExceptions: true,
      json: false,
      colorize: true,
    }),
  );
}
 */

// 디도스 방어 모듈
const rateLimit = require("express-rate-limit");
const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

// 경로별로 라우팅
const board_router = require("./Router/Board");
const comment_router = require("./Router/Comment");
const library_router = require("./Router/Library");
const review_router = require("./Router/Review");
const user_router = require("./Router/User");

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

//const library_request = require("./CustomModule/open_api");
//library_request.reqOpenData();

//console.log(query);
// 서버 시작
app.listen(process.env.PORT, () => {
  console.log(("Start Lib Server at" + moment().format(" YYYY-MM-DD HH:mm:ss")).rainbow.bold);
});

// 외장모듈
// express 모듈 가져오기
import express from "express";
// req.body 사용에 필요한 'body-parser' 미들웨어
import bodyParser from "body-parser";
// 컨텐츠 보안 정책에 따른 'helmet' 미들웨어 사용
import helmet from "helmet";
// console 로그 예쁘게 쓰기
import colors from "colors";
// 쿠키&세션 모듈
import cookieParser from "cookie-parser";
import session from "express-session";
// 로그 DB에 저장하는데 필요한 미들웨어
import morgan from "morgan";
import winston from "winston";
import { SqlTransport } from "winston-sql-transport";
import rateLimit from "express-rate-limit"; // 디도스 방어 모듈
// dotenv 모듈
require("dotenv").config();

// 내장모듈
// 날짜/시간 관련 모듈
import moment from "./CustomModule/DateTime";
// 라우터
const board_router = require("./Router/Board");
const comment_router = require("./Router/Comment");
const library_router = require("./Router/Library");
const review_router = require("./Router/Review");
const user_router = require("./Router/User");

// 설정
// 로그에 DB 저장하도록 할 설정
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
  transports: [new SqlTransport(transportConfig)],
  exitOnError: false,
});

// morgan winston 설정
logger.stream = {
  write: (message, encoding) => {
    logger.info(message);
  },
};
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

// 디도스 방어 모듈 설정(요청 제한)
const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

// 서버 설정
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extends: false }));
app.use(helmet());
app.disable("x-powered-by");
app.use(cookieParser("secret"));
app.use(
  session({
    secret: process.env.SESSION_PASSWORD,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  }),
);
app.use(morgan("combined", { stream: logger.stream }));
app.use("/api", apiLimiter);

// 경로별로 라우팅
app.use("/comment", comment_router);
app.use("/library", library_router);
app.use("/review", review_router);
app.use("/user", user_router);
app.use("/", board_router);

// 404 에러처리
app.get("/not_found", (req, res) => {
  res.status(404).send("not founded page");
});

// 도서관 정보 테이블에 넣기

//const library_request = require("./CustomModule/open_api");
//library_request.reqOpenData();

// 서버 시작
app.listen(process.env.PORT, () => {
  console.log(("Start Lib Server at" + moment().format(" YYYY-MM-DD HH:mm:ss")).rainbow.bold);
});

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
// 디도스 방어 모듈
import rateLimit from "express-rate-limit";
// dotenv 모듈
import "dotenv/config.js";
// 로그 DB에 저장하는데 필요한 모듈
import morgan from "morgan";
import winston from "winston";
import WinstonTransportSequelize from "winston-transport-sequelize";
// cors 모듈
import cors from "cors";
import * as fs from "fs";
import https from "https";

// 내장모듈
// 공공데이터 가져오는 모듈
import { reqOpenData } from "./customModule/requestOpenApi.js";
// 명언 스크래핑 모듈
import { getScraping } from "./customModule/scraping.js";
// 날짜/시간 관련 모듈
import { moment } from "./customModule/dateTime.js";
// 시퀄라이저 모듈
import { db, sequelize } from "./orm/models/index.mjs";
// 상태코드
import { OK } from "./customModule/statusCode.js";

// 라우터
import boardRouter from "./routes/board.js";
import commentRouter from "./routes/comment.js";
import libraryRouter from "./routes/library.js";
import reviewRouter from "./routes/review.js";
import userRouter from "./routes/user.js";
import wiseSayingRouter from "./routes/wiseSaying.js";

// 시퀄라이저 연결
db.sequelize
  .sync({ force: false }, { alter: false })
  .then(() => {
    console.log("success_db_access_by_sequelize".rainbow);
  })
  .catch((err) => {
    console.log(("err: " + err).red);
  });
// 각종 모듈 설정
// db에 로그 저장
const transport = new WinstonTransportSequelize({
  level: "info",
  sequelize: db.sequelize,
  tableName: "winston_logs",
  meta: { project: "myStudyLibrary" },
  fields: {
    logIndex: {
      type: db.Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    level: db.Sequelize.CHAR(10),
    message: db.Sequelize.STRING(500),
    timestamp: {
      type: db.Sequelize.DataTypes.TIMESTAMP,
      defaultValue: sequelize.literal("now()"),
    },
  },
  modelOptions: { timestamps: false },
});

const logger = new winston.createLogger({
  transports: [transport],
});

// morgan winston 설정
logger.stream = {
  write: (message, encoding) => {
    logger.info(message);
  },
};
// 디도스 방어 모듈 설정(요청 제한)
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 25000,
  standardHeaders: true,
  legacyHeaders: false,
});
let corsOptions;
// cors 설정
if (process.env.NODE_ENV === "development") {
  corsOptions = {
    origin: "http://localhost:36383",
    credentials: true,
    methods: ["GET", "PATCH", "POST", "DELETE"],
    maxAge: 86400,
    preflightContinue: true,
    optionsSuccessStatus: 200,
  };
}
if (process.env.NODE_ENV === "production") {
  corsOptions = {
    origin: "https://mystudylibrary.pe.kr",
    credentials: true,
    methods: ["GET", "PATCH", "POST", "DELETE"],
    maxAge: 86400,
    preflightContinue: true,
    optionsSuccessStatus: 200,
  };
}

// 서버 설정
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extends: false }));
app.use(helmet());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  session({
    secret: process.env.SESSION_PASSWORD,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);

app.use(cors(corsOptions));
if (process.env.NODE_ENV === "development") {
  app.options("http://localhost:36383", cors());
}
if (process.env.NODE_ENV === "production") {
  app.options("https://mystudylibrary.pe.kr", cors());
}

// 요청에 대해 로그
app.use(morgan("combined", { stream: logger.stream }));
// 디도스 방어 모듈 모든 요청에 대해 사용
app.use(apiLimiter);

// 홈
// 라우터 변수
const router = express.Router();
app.use(
  "/",
  router.get("/", function (req, res) {
    return res.status(OK).end();
  })
);

// 경로별로 라우팅
app.use("/comments", commentRouter);
app.use("/librarys", libraryRouter);
app.use("/reviews", reviewRouter);
app.use("/user", userRouter);
app.use("/board", boardRouter);
app.use("/wise-saying", wiseSayingRouter);

// 공공데이터 api 도서관 정보 테이블에 넣기
// reqOpenData();

// 서비스에 필요한 명언 정보 DB 테이블에 넣기
// getScraping();

// 서버 시작
if (process.env.NODE_ENV === "development") {
  app.listen(process.env.PORT, () => {
    console.log(("Start Backend Server at" + moment().format(" YYYY-MM-DD HH:mm:ss")).rainbow.bold);
  });
}
if (process.env.NODE_ENV === "production") {
  const options = {
    key: fs.readFileSync("/etc/letsencrypt/live/mystudylibrary.pe.kr/privkey.pem", "utf-8"),
    cert: fs.readFileSync("/etc/letsencrypt/live/mystudylibrary.pe.kr/cert.pem", "utf-8"),
    ca: fs.readFileSync("/etc/letsencrypt/live/mystudylibrary.pe.kr/chain.pem", "utf-8"),
  };
  https.createServer(options, app).listen(process.env.PORT, () => {
    console.log(("Start HTTPS Backend Server at" + moment().format(" YYYY-MM-DD HH:mm:ss")).rainbow.bold);
  });
}

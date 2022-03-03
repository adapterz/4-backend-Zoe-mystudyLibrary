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

// 경로별로 라우팅
const adj_lib_router = require("./router/adj_lib");
const boards_router = require("./router/board");
const home_router = require("./router/home");
const login_router = require("./router/login");
const new_user_router = require("./router/new_user");
const service_description_router = require("./router/service_description");
const user_router = require("./router/user");
const my_post_router = require("./router/my_post");

app.use("/adj-lib", adj_lib_router);
app.use("/", boards_router);
app.use("/", home_router);
app.use("/login", login_router);
app.use("/new-user", new_user_router);
app.use("/description", service_description_router);
app.use("/user", user_router);
app.use("/my-post", my_post_router);

// 404 에러처리
app.get("/not_found", function (req, res) {
  res.status(404).send("not founded page");
});

app.listen(process.env.PORT, () => {
  console.log("Test Lib Server");
});

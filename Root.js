// express 모듈 가져오기
const express = require("express");
const app = express();

// req.body 사용에 필요한 'body-parser' 미들웨어
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extends: true }));

// 컨텐츠 보안 정책에 따른 'helmet' 미들웨어 사용
const helmet = require("helmet");
app.use(helmet());
app.disable("x-powered-by");

// 포트번호 지정
const port = 3000;

// 경로별로 라우팅
const adj_lib_router = require("./routes/adj_lib/adj_lib");
const free_bulletin_board_router = require("./routes/free_bulletin_board/free_bulletin_board");
const home_router = require("./routes/home/home");
const login_router = require("./routes/login/login");
const new_user_router = require("./routes/new_user/new_user");
const service_description_router = require("./routes/service_description/service_description");
const study_proof_shot_router = require("./routes/study_proof_shot/study_proof_shot");
const user_router = require("./routes/user/user");

app.use("/adj_lib", adj_lib_router);
app.use("/free_bulletin_board", free_bulletin_board_router);
app.use("/", home_router);
app.use("/login", login_router);
app.use("/new_user", new_user_router);
app.use("/service_description", service_description_router);
app.use("/study_proof_shot", study_proof_shot_router);
app.use("/user", user_router);

// 404 에러처리
app.get("/not_found", function (req, res) {
  res.status(404).send("not founded page");
});

app.listen(port, () => {
  console.log("Test Lib Server");
});

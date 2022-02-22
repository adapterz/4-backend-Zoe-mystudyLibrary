// express 모듈 가져오기
const express = require("express");
const app = express();

// Csp
const helmet = require("helmet");
app.use(helmet());
app.disable("x-powered-by");

// 포트번호 지정
const port = 3000;

// router
const adj_lib_router = require("./routes/adj_lib/adj_lib.js");
const free_bulletin_board_router = require("./routes/free_bulletin_board/free_bulletin_board.js");
const home_router = require("./routes/home/home.js");
const login_router = require("./routes/login/login.js");
const new_user_router = require("./routes/new_user/new_user.js");
const service_description_router = require("./routes/service_description/service_description.js");
const study_proof_shot_router = require("./routes/study_proof_shot/study_proof_shot.js");
const user_router = require("./routes/user/user.js");

app.use("/adj_lib", adj_lib_router);
app.use("/free_bulletin_board", free_bulletin_board_router);
app.use("/", home_router);
app.use("/login", login_router);
app.use("/new_user", new_user_router);
app.use("/service_description", service_description_router);
app.use("/study_proof_shot", study_proof_shot_router);
app.use("/user", user_router);

app.listen(port, () => {
  console.log("Test ${port}");
});

// DB 연결을 위한 모듈 설치 및 DB connection 정보 설정
const mysql = require("mysql");
const db_info = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};
// DB 커넥션 생성 및 DB 접속
const db_connect = mysql.createConnection(db_info);
db_connect.connect(function (err) {
  if (err) console.error("mysql error:" + err);
  else console.log("mysql이 성공적으로 연결됐습니다.");
});

// 모듈화
module.exports = { db_connect: db_connect };

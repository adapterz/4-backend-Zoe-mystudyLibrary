// DB 연결을 위한 모듈 설치 및 DB connection 정보 설정
const mysql = require("mysql");
const colors = require("colors");

const db_info = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true, // 다중쿼리 허용
};
// DB 커넥션 생성 및 DB 접속
const db_connect = mysql.createConnection(db_info);
db_connect.connect(function (err) {
  if (err) console.error(("mysql error:" + err).red);
  else console.log("mysql 이 성공적으로 연결됐습니다.".gray.italic);
});

// 모듈화
module.exports = { db_connect: db_connect };

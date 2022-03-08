// DB 연결을 위한 모듈 설치 및 DB connection 정보 설정
const mysql = require("mysql");

const config = {
  connectionLimit: 10,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true, // 다중쿼리 허용
};
// DB 커넥션 생성 및 DB 접속
const pool = mysql.createPool(config);

// 모듈화
module.exports = { db_connect: pool };

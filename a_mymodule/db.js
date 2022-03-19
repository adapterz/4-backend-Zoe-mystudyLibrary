// DB 연결을 위한 모듈 설치 및 DB connection 정보 설정
const mysql = require("mysql2/promise");
const bluebird = require("bluebird");
const pool = mysql.createPool({
  connectionLimit: 10, // 커넥션풀 적용
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  multipleStatements: true, // 다중쿼리 허용
  Promise: bluebird,
});

module.exports = { pool: pool };

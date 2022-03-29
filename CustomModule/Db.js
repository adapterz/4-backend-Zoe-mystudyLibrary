// DB 연결을 위한 모듈 설치 및 DB connection 정보 설정
// 외장모듈
import mysql from "mysql2/promise";
import bluebird from "bluebird";

const config = {
  connectionLimit: 10, // 커넥션풀 적용
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true, // 다중쿼리 허용
  Promise: bluebird,
};

const myPool = mysql.createPool(config);

export { myPool };

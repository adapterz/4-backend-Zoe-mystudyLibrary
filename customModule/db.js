// DB 연결을 위한 모듈 설치 및 DB connection 정보 설정
// 외장모듈
import mysql from "mysql2/promise";
import bluebird from "bluebird";

// eslint-disable-next-line no-undef
const config = {
  connectionLimit: 10, // 커넥션풀 적용
	// eslint-disable-next-line no-undef
  host: process.env.DB_HOST,
	// eslint-disable-next-line no-undef
  port: process.env.DB_PORT,
	// eslint-disable-next-line no-undef
  user: process.env.DB_USER,
	// eslint-disable-next-line no-undef
  password: process.env.DB_PASSWORD,
	// eslint-disable-next-line no-undef
  database: process.env.DB_NAME,
  multipleStatements: true, // 다중쿼리 허용
  Promise: bluebird,
};

const myPool = mysql.createPool(config);

export { myPool };

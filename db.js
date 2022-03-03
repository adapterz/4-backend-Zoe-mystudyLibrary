// DB 연결을 위한 모듈 설치 및 DB connection 정보 설정
const mysql = require("mysql");
const db_info = {
  host: "localhost",
  post: "3306",
  user: "root",
  password: "qwe1234!",
  database: "myStudyLib",
};
// DB 커넥션 생성 및 DB 접속
const db_connect = mysql.createConnection(db_info);
db_connect.connect(function (err) {
  if (err) console.error("mysql error:" + err);
  else console.log("mysql이 성공적으로 연결됐습니다.");
});

module.exports = { db_connect: db_connect };

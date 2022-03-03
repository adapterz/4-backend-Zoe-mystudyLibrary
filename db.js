// DB 연결을 위한 모듈 설치 및 DB connection 정보 설정
const mysql = require("mysql");
const db_info = {
  host: "localhost",
  post: "3306",
  user: "root",
  password: "qwe1234!",
  database: "myStudyLib",
};

module.exports = {
  init: function () {
    return mysql.createConnection(db_info);
  },
  connect: function (conn) {
    conn.connect(function (err) {
      if (err) console.error("mysql connection error : " + err);
      else console.log("mysql 이 성공적으로 연결됐습니다.");
    });
  },
};

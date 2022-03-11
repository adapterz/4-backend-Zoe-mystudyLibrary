const bcrypt = require("bcrypt");
const saltRounds = 10;

const encryption = function (body_pw) {
  // req.body.pw에 해싱된 값으로 바꿔줌
  return bcrypt.hashSync(body_pw, saltRounds).toString();
};

module.exports = {
  encryption: encryption,
};

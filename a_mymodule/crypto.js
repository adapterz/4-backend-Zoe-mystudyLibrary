const bcrypt = require("bcrypt");
const saltRounds = 10;

const encryption = function (req, res, next) {
  // req.body.pw에 해싱된 값으로 바꿔줌
  const hashed_pw = bcrypt.hashSync(req.body.pw, saltRounds);
  req.body.pw = hashed_pw;
  // req.body.confirmPw가 있으면 해싱된 값으로 바꿔줌
  if (req.body.confirmPw) {
    const hashed_confirm = bcrypt.hashSync(req.body.confirmPw, saltRounds);
    req.body.confirmPw = hashed_confirm;
  }
  // req.body.newPw가 있으면 해싱된 값으로 바꿔줌
  if (req.body.newPw) {
    const hashed_new = bcrypt.hashSync(req.body.newPw, saltRounds);
    req.body.newPw = hashed_new;
  }
  next();
};

module.exports = {
  encryption: encryption,
};

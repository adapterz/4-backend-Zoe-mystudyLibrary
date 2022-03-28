// 패스워드 암호화 메서드
import bcrypt from "bcrypt";
const saltRounds = 10;

export async function hashPw(body_pw) {
  return bcrypt.hashSync(body_pw, saltRounds).toString();
}

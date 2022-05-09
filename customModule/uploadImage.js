// 프로필 사진 업로드를 위한 설정 및 메서드
// 외부모듈
import multer from "multer"
import path from "path"
import jwt from "jsonwebtoken"
// 내부모듈
import { FORBIDDEN, UNAUTHORIZED } from "./statusCode.js"

// 유효성 검사(이미지 파일인지 확인)
const imageValidation = function (req, file, cb) {
  let typeArray = file.mimetype.split("/")
  let fileType = typeArray[1]
  // 이미지 타입일 때
  if (fileType == "jpg" || fileType == "jpeg" || fileType == "png" || fileType == "gif") {
    cb(null, true)
    // 이미지 타입이 아닐 때
  } else {
    req.body.fileValidation = false
    cb(null, false)
  }
}

// multer 설정
export const uploadImage = multer({
  storage: multer.diskStorage({
    // 저장 경로
    destination: (req, file, cb) => {
      cb(null, "profileImage/")
    },
    // 파일이름
    filename: (req, file, cb) => {
      const loginIndex = jwt.verify(req.signedCookies.token, process.env.TOKEN_SECRET).idx
      const imageName = loginIndex + path.extname(file.originalname)
      cb(null, imageName)
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  // 유효성 검사(이미지 파일인지 확인)
  fileFilter: imageValidation,
}).single("profileImage")

// 이미지 저장 전 로그인했는지 여부와 token 체크
export async function checkLoginToken(req, res, next) {
  try {
    //  필요 변수 선언
    const loginToken = req.signedCookies.token
    let loginIndex
    // 로그인 토큰이 없을 때
    if (loginToken === undefined) return res.status(UNAUTHORIZED).json({ state: "login_required" })
    // 로그인했을 때 토큰의 유저인덱스 불러오기
    loginIndex = await jwt.verify(loginToken, process.env.TOKEN_SECRET).idx
    const payloadIndex = await jwt.decode(loginToken).idx
    // payload의 유저인덱스와 signature의 유저인덱스 비교 (조작여부 확인)
    if (loginIndex !== payloadIndex) return res.status(FORBIDDEN).json({ state: "not_authorization" })
    next()
  } catch (err) {
    // 만료된 토큰
    if (err.message === "jwt expired") {
      return res.status(UNAUTHORIZED).json({ state: "expired_token" })
    }
    // 유효하지 않은 토큰일 때
    if (err.message === "invalid signature") {
      return res.status(FORBIDDEN).json({ state: "incorrect_access" })
    }
    return res.status(FORBIDDEN).json({ state: "not_authorization" })
  }
}

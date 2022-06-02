// 외장모듈
import express from "express";
// 내장모듈
import { wiseSayingController } from "../controllers/wiseSaying.js";

// 라우터 변수
const router = express.Router();

/*
 * 1. 랜덤으로 명언 정보 가져오기
 */
router.get("/", wiseSayingController);

// 모듈화
export default router;

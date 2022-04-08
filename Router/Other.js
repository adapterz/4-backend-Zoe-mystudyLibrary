// 외장모듈
import express from "express";
import { wiseSayingController } from "../Controller/Other";

// 라우터 변수
const router = express.Router();

/*
 * 1. 랜덤으로 명언 정보 가져오는 컨트롤러
 */
router.get("/wise-saying", wiseSayingController);

// 모듈화
export default router;

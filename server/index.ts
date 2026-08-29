import "dotenv/config";

import express from "express";
import cors from "cors";

import { db } from "../generator/firebaseAdmin.js";
import { runBatch } from "../generator/runBatch.js";


interface GenerateStatus {
  isGenerating: boolean;
  current: number;
  total: number;
  successCount: number;
  failCount: number;
}

let generateStatus: GenerateStatus = {
  isGenerating: false,
  current: 0,
  total: 0,
  successCount: 0,
  failCount: 0,
};
const app = express();

app.use(cors());
app.use(express.json());

// 콘텐츠 생성
app.post("/api/generate", async (req, res) => {
  try {
    const count = Number(req.body.count);

    if (
      !Number.isInteger(count) ||
      count < 1
    ) {
      return res.status(400).json({
        success: false,
        message:
          "count는 1 이상의 정수여야 합니다.",
      });
    }

    if (count > 100) {
      return res.status(400).json({
        success: false,
        message:
          "한 번에 최대 100개까지 생성할 수 있습니다.",
      });
    }

    if (generateStatus.isGenerating) {
      return res.status(409).json({
        success: false,
        message:
          "이미 콘텐츠를 생성하고 있습니다.",
        status: generateStatus,
      });
    }

    generateStatus = {
      isGenerating: true,
      current: 0,
      total: count,
      successCount: 0,
      failCount: 0,
    };

    console.log(
      `콘텐츠 ${count}개 생성 시작`
    );

    const result = await runBatch(
      count,
      (progress) => {
        generateStatus = {
          isGenerating: true,
          ...progress,
        };

        console.log(
          `진행률: ${progress.current}/${progress.total}`
        );
      }
    );

    generateStatus = {
      isGenerating: false,
      current: count,
      total: count,
      successCount:
        result.successCount,
      failCount:
        result.failCount,
    };

    console.log(
      `콘텐츠 ${count}개 생성 완료`
    );

    return res.json({
      success: true,
      message:
        `${count}개 콘텐츠 생성이 완료되었습니다.`,
      result,
    });
  } catch (error) {
    console.error(
      "콘텐츠 생성 오류:",
      error
    );

    generateStatus = {
      ...generateStatus,
      isGenerating: false,
    };

    return res.status(500).json({
      success: false,
      message:
        "콘텐츠 생성 중 오류가 발생했습니다.",
    });
  }
});

// 게시물 삭제
app.delete("/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection("posts").doc(id);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      return res.status(404).json({
        success: false,
        message: "게시물이 없습니다.",
      });
    }

    await docRef.delete();

    return res.json({ success: true });
  } catch (error) {
    console.error("게시물 삭제 오류:", error);

    return res.status(500).json({
      success: false,
      message: "게시물 삭제 실패",
    });
  }
});

// 서버 상태 확인
app.get("/health", (_req, res) => {
  return res.json({ status: "ok" });
});

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API server running on port ${PORT}`);
});
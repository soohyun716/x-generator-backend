import "dotenv/config";
import OpenAI from "openai";

import { createImagePrompt } from "./prompts/imagePrompt.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateImage(
  scene: string
): Promise<Buffer> {
  if (!scene) {
    throw new Error("imageScene이 없습니다.");
  }

  const prompt = createImagePrompt(scene);

  const result = await openai.images.generate({
    model: "gpt-image-2",
    prompt,
    size: "1024x1024",
    quality: "low",
  });

  const base64 = result.data?.[0]?.b64_json;

  if (!base64) {
    throw new Error("이미지 생성 결과가 없습니다.");
  }

  return Buffer.from(base64, "base64");
}
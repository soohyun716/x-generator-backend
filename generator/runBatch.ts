import fs from "fs";
import path from "path";

import { generateStory } from "./generateStory.js";
import { generateImage } from "./generateImage.js";
import { composeImage } from "./composeImage.js";
import { savePost } from "./savePost.js";
import { STORY_CATEGORIES } from "./constants/storyCategories.js";

const STORY_LENGTHS = [200, 300, 400];

const PROGRESS_FILE = path.resolve(
  "generator/constants/categoryProgress.json"
);

function getRandomLength(): number {
  return STORY_LENGTHS[
    Math.floor(Math.random() * STORY_LENGTHS.length)
  ];
}

function getCategoryIndex(): number {
  if (!fs.existsSync(PROGRESS_FILE)) {
    return 0;
  }

  try {
    const raw = fs.readFileSync(PROGRESS_FILE, "utf-8");
    const data = JSON.parse(raw);

    return typeof data.index === "number"
      ? data.index
      : 0;
  } catch {
    return 0;
  }
}

function saveCategoryIndex(index: number) {
  fs.writeFileSync(
    PROGRESS_FILE,
    JSON.stringify({ index }, null, 2),
    "utf-8"
  );
}

export interface BatchProgress {
  current: number;
  total: number;
  successCount: number;
  failCount: number;
}

export async function runBatch(
  total: number,
  onProgress?: (
    progress: BatchProgress
  ) => void
) {
  if (!Number.isInteger(total) || total < 1) {
    throw new Error(
      "생성 개수는 1 이상의 정수여야 합니다."
    );
  }

  let successCount = 0;
  let failCount = 0;

  let currentCategoryIndex = getCategoryIndex();

  console.log(
    `총 ${total}개 콘텐츠 생성을 시작합니다.`
  );

  console.log(
    `시작 카테고리 인덱스: ${currentCategoryIndex}`
  );

  console.log(
    `시작 카테고리: ${STORY_CATEGORIES[currentCategoryIndex]
    }`
  );

  for (let i = 1; i <= total; i++) {
    const category =
      STORY_CATEGORIES[
      currentCategoryIndex %
      STORY_CATEGORIES.length
      ];

    const targetLength = getRandomLength();

    console.log("\n==============================");
    console.log(`[${i}/${total}] 생성 시작`);
    console.log(`카테고리: ${category}`);
    console.log(`목표 길이: 약 ${targetLength}자`);
    console.log("==============================");

    try {
      console.log("스토리 생성 중...");

      const story = await generateStory(
        category,
        targetLength
      );

      console.log("스토리 생성 완료");
      console.log("제목:", story.title);

      const actualLength =
        story.body.length +
        story.threadText.length;

      console.log(
        `실제 길이: ${actualLength}자`
      );

      console.log("이미지 생성 중...");

      const rawImageBuffer =
        await generateImage(
          story.imageScene
        );

      console.log("이미지 생성 완료");

      console.log("이미지 합성 중...");

      const finalImageBuffer =
        await composeImage({
          imageBuffer: rawImageBuffer,
          body: story.body,
        });

      console.log("이미지 합성 완료");

      console.log("저장 중...");

      const saved = await savePost({
        story,
        finalImageBuffer,
      });

      successCount++;

      console.log(`[${i}/${total}] 완료`);
      console.log("Post ID:", saved.id);

      currentCategoryIndex =
        (currentCategoryIndex + 1) %
        STORY_CATEGORIES.length;

      saveCategoryIndex(
        currentCategoryIndex
      );

      console.log(
        `다음 카테고리 인덱스 저장: ${currentCategoryIndex}`
      );
    } catch (error) {
      failCount++;

      console.error(
        `[${i}/${total}] 생성 실패`
      );

      console.error(error);
    }
    onProgress?.({
      current: i,
      total,
      successCount,
      failCount,
    });
  }

  console.log("\n==============================");
  console.log("배치 생성 완료");
  console.log("==============================");

  console.log(`성공: ${successCount}개`);
  console.log(`실패: ${failCount}개`);

  console.log(
    `다음 실행 시작 카테고리: ${STORY_CATEGORIES[currentCategoryIndex]
    }`
  );

  return {
    requested: total,
    successCount,
    failCount,
  };
}
import fs from "fs";
import path from "path";

import { generateStory } from "./generateStory.js";
import { generateImage } from "./generateImage.js";
import { composeImage } from "./composeImage.js";
import { savePost } from "./savePost.js";

const STORY_CATEGORIES = [
  "장례식장",
  "회사야근",
  "찜질방",
  "동네꽃집",
  "동물병원",
  "소개팅",
  "세탁소",
  "야구장",
  "가족여행",
  "웨딩홀",
  "PC방",
  "회사점심",
  "공항",
  "친구집",
  "미용실",
  "캠핑장",
  "중고거래",
  "엘리베이터",
  "수영장",
  "썸",
  "고속도로휴게소",
  "사진관",
  "편의점",
  "회식",
  "게스트하우스",
  "반려동물산책",
  "도서관",
  "동창모임",
  "주민센터",
  "놀이공원",
  "코인세탁방",
  "회사탕비실",
  "전통시장",
  "기차",
  "연애초반",
  "헬스장",
  "문구점",
  "친구부모님",
  "지역축제",
  "호텔",
  "안경점",
  "부모님취미",
  "동네카페",
  "스키장",
  "퇴사",
  "반려동물유치원",
  "생일파티",
  "꽃선물",
  "지하철",
  "소개팅후일담",
  "코인노래방",
  "아파트경비실",
  "미술관",
  "회사신입",
  "형제자매",
  "플리마켓",
  "시내버스",
  "네일샵",
  "해외여행",
  "친구소개팅",
  "자격증시험장",
  "회사휴게실",
  "동네빵집",
  "가족사진",
  "응급실대기실",
  "택배",
  "친구커플",
  "대학교",
  "공방",
  "결혼식",
  "회사워크숍",
  "농촌체험",
  "커플싸움",
  "목욕탕",
  "친구할머니",
  "택시",
  "학교축제",
  "동네세탁소",
  "템플스테이",
  "회사출장",
  "해수욕장",
  "부모님친구",
  "문화센터",
  "오래된친구",
  "고속버스",
  "무인사진관",
  "동물카페",
  "구내식당",
  "수산시장",
  "졸업식",
  "동네약국",
  "집들이",
  "새벽편의점",
  "등산",
  "웨딩촬영",
  "놀이공원대기줄",
  "회사청소시간",
  "지역행사",
  "장거리연애",
  "공항면세점",
  "한강공원",
  "렌터카여행",
];

const STORY_LENGTHS = [200, 300, 400];

const PROGRESS_FILE = path.resolve(
  "generator/categoryProgress.json"
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
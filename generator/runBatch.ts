import fs from "fs";
import path from "path";

import { generateStory } from "./generateStory.js";
import { generateImage } from "./generateImage.js";
import { composeImage } from "./composeImage.js";
import { savePost } from "./savePost.js";

const STORY_CATEGORIES = [
  "심야영화관",
  "결혼식뷔페",
  "휴게소화장실",
  "공항수하물찾는곳",
  "새벽응급실",
  "대학축제주점",
  "찜질방수면실",
  "아파트분리수거장",
  "무인아이스크림가게",
  "고양이보호소",
  "유기견봉사",
  "반려동물장례식장",
  "웨딩드레스샵",
  "상견례",
  "돌잔치",
  "백일잔치",
  "조카돌보기",
  "명절친척집",
  "제사",
  "김장",
  "시골할머니집",
  "부모님동창회",
  "친척결혼식",
  "사촌모임",
  "산후조리원면회",
  "신혼집구경",
  "친구이삿날",
  "유품정리",
  "헌옷수거함",
  "분실물센터",
  "지하철유실물센터",
  "경찰서민원실",
  "법원방청",
  "예비군훈련장",
  "민방위교육장",
  "헌혈의집",
  "건강검진센터",
  "내시경대기실",
  "한의원",
  "정형외과물리치료실",
  "교정치과",
  "안과검사실",
  "보건소",
  "심리상담센터",
  "운전면허적성검사",
  "자동차검사소",
  "폐차장",
  "중고차매매단지",
  "셀프세차장",
  "대리운전",
  "막차",
  "첫차",
  "공항리무진",
  "야간고속버스",
  "기차입석",
  "배멀미",
  "여객선",
  "섬여행",
  "공항환승",
  "수하물분실",
  "호텔조식",
  "호텔수영장",
  "호텔룸서비스",
  "숙소체크아웃",
  "여행지빨래방",
  "패키지여행",
  "여행지한인식당",
  "외국인관광객",
  "새벽산행",
  "산정상",
  "등산객쉼터",
  "계곡",
  "낚싯배",
  "갯벌체험",
  "농산물직거래장터",
  "오일장",
  "경매장",
  "벼룩시장",
  "폐업정리세일",
  "창고형마트",
  "백화점문화센터",
  "홈쇼핑",
  "당근무료나눔",
  "택배오배송",
  "음식배달오배송",
  "무인택배함",
  "새벽배송",
  "아파트방송",
  "층간소음항의",
  "주차시비",
  "견인차",
  "열쇠수리기사",
  "보일러수리",
  "에어컨설치",
  "인터넷설치기사",
  "방역업체",
  "이사첫날",
  "옥상",
  "반지하",
  "고시원",
  "빈집"
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
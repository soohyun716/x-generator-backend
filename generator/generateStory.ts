import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import { STORY_PROMPT } from "./prompts/storyPrompt.js";
import type { GeneratedStory } from "../shared/types.js";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MAX_RETRIES = 3;

export async function generateStory(
  category: string,
  targetLength: number
): Promise<GeneratedStory> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 1800,

        output_config: {
          format: {
            type: "json_schema",
            schema: {
              type: "object",

              properties: {
                title: {
                  type: "string",
                },

                body: {
                  type: "string",
                },

                threadText: {
                  type: "string",
                },

                imageScene: {
                  type: "string",
                },
              },

              required: [
                "title",
                "body",
                "threadText",
                "imageScene",
              ],

              additionalProperties: false,
            },
          },
        },

        messages: [
          {
            role: "user",
            content: `
${STORY_PROMPT}

[이번 콘텐츠의 필수 카테고리]

${category}

반드시 위 카테고리를 중심 소재로 사용하라.
카테고리를 다른 소재로 임의 변경하지 않는다.

단, 카테고리는 배경과 소재만 제한한다.
사건, 등장인물, 제목, 반전 방식, threadText의 말투는
자유롭고 다양하게 구성하라.

뻔한 클리셰와 반복적인 전개는 피하라.

[이번 콘텐츠의 목표 분량]

body + threadText를 합쳐서 약 ${targetLength}자 내외로 작성하라.

정확히 ${targetLength}자를 맞출 필요는 없다.
자연스러운 이야기 흐름을 우선하되
목표 분량에서 지나치게 벗어나지 않는다.

목표가 200자라면 짧고 빠르게 전개하고,
300자라면 적당한 상황 전개를 포함하고,
400자라면 반전까지 가는 과정과 후일담을
조금 더 충분히 보여준다.

body와 threadText의 길이 비율은 고정하지 않는다.

threadText가 한 문장으로 짧을 수도 있고,
여러 문장으로 길게 이어질 수도 있다.
`,
          },
        ],
      });

      if (response.stop_reason === "max_tokens") {
        throw new Error("Claude 응답이 max_tokens 때문에 잘렸습니다.");
      }

      const firstBlock = response.content[0];

      if (!firstBlock || firstBlock.type !== "text") {
        throw new Error("Claude가 텍스트를 반환하지 않았습니다.");
      }

      const story = JSON.parse(firstBlock.text) as GeneratedStory;

      return story;
    } catch (error) {
      console.error(
        `스토리 생성 실패 (${attempt}/${MAX_RETRIES})`,
        error
      );

      if (attempt === MAX_RETRIES) {
        throw error;
      }

      console.log("재시도합니다...");
    }
  }

  throw new Error("스토리 생성 실패");
}
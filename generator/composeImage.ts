import sharp from "sharp";

interface ComposeImageParams {
  imageBuffer: Buffer;
  body: string;
}

export async function composeImage({
  imageBuffer,
  body,
}: ComposeImageParams): Promise<Buffer> {
  const width = 1080;
  const photoHeight = 720;

  const fontSize = 42;
  const lineHeight = 65;

  const paddingTop = 90;
  const paddingBottom = 80;
  const paddingX = 70;

  const maxCharsPerLine = 25;

  const escapeXml = (text: string) =>
    text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

  const words = body
    .trim()
    .replace(/\s+/g, " ")
    .split(" ");

  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine
      ? `${currentLine} ${word}`
      : word;

    if (testLine.length > maxCharsPerLine) {
      if (currentLine) {
        lines.push(currentLine);
      }

      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  const textHeight =
    paddingTop +
    lines.length * lineHeight +
    paddingBottom;

  const totalHeight =
    photoHeight + textHeight;

  console.log("body 길이:", body.length);
  console.log("본문 줄 수:", lines.length);
  console.log("텍스트 영역 높이:", textHeight);
  console.log("최종 이미지 높이:", totalHeight);

  const photo = await sharp(imageBuffer)
    .resize(width, photoHeight, {
      fit: "cover",
      position: "attention",
    })
    .png()
    .toBuffer();

  const textSvg = `
    <svg
      width="${width}"
      height="${textHeight}"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        width="100%"
        height="100%"
        fill="white"
      />

      <text
        x="${width / 2}"
        y="${textHeight / 2}"
        font-size="40"
        font-family="Noto Sans CJK KR"
        font-weight="400"
        fill="#000000"
        fill-opacity="0.05"
        text-anchor="middle"
        dominant-baseline="middle"
      >@AltoBot</text>

      <text
        x="${paddingX}"
        y="${paddingTop}"
        font-size="${fontSize}"
        font-family="'Noto Sans KR', 'Noto Sans CJK KR', 'Malgun Gothic', Arial, sans-serif"
        font-weight="400"
        fill="black"
      >
        ${lines
          .map(
            (line, index) => `
              <tspan
                x="${paddingX}"
                dy="${index === 0 ? 0 : lineHeight}"
              >${escapeXml(line)}</tspan>
            `
          )
          .join("")}
      </text>
    </svg>
  `;

  const textArea = Buffer.from(textSvg);

  return sharp({
    create: {
      width,
      height: totalHeight,
      channels: 4,
      background: "#ffffff",
    },
  })
    .composite([
      {
        input: photo,
        top: 0,
        left: 0,
      },
      {
        input: textArea,
        top: photoHeight,
        left: 0,
      },
    ])
    .webp({
      quality: 85,
    })
    .toBuffer();
}

// 기존 맥 생성 코드
// import sharp from "sharp";

// interface ComposeImageParams {
//   imageBuffer: Buffer;
//   body: string;
// }

// export async function composeImage({
//   imageBuffer,
//   body,
// }: ComposeImageParams): Promise<Buffer> {
//   const width = 1080;

//   // 사진 영역
//   const photoHeight = 720;

//   // 텍스트 설정
//   const fontSize = 42;
//   const lineHeight = 65;

//   const paddingTop = 90;
//   const paddingBottom = 80;
//   const paddingX = 70;

//   const maxCharsPerLine = 25;

//   const escapeXml = (text: string) =>
//     text
//       .replace(/&/g, "&amp;")
//       .replace(/</g, "&lt;")
//       .replace(/>/g, "&gt;")
//       .replace(/"/g, "&quot;")
//       .replace(/'/g, "&apos;");

//   // ==============================
//   // body 줄바꿈 계산
//   // ==============================

//   const words = body
//     .trim()
//     .replace(/\s+/g, " ")
//     .split(" ");

//   const lines: string[] = [];
//   let currentLine = "";

//   for (const word of words) {
//     const testLine = currentLine
//       ? `${currentLine} ${word}`
//       : word;

//     if (testLine.length > maxCharsPerLine) {
//       if (currentLine) {
//         lines.push(currentLine);
//       }

//       currentLine = word;
//     } else {
//       currentLine = testLine;
//     }
//   }

//   if (currentLine) {
//     lines.push(currentLine);
//   }

//   // ==============================
//   // 줄 수에 따라 텍스트 높이 자동 계산
//   // ==============================

//   const textHeight =
//     paddingTop +
//     lines.length * lineHeight +
//     paddingBottom;

//   const totalHeight =
//     photoHeight + textHeight;

//   console.log("body 길이:", body.length);
//   console.log("본문 줄 수:", lines.length);
//   console.log("텍스트 영역 높이:", textHeight);
//   console.log("최종 이미지 높이:", totalHeight);

//   // ==============================
//   // 사진
//   // ==============================

//   const photo = await sharp(imageBuffer)
//     .resize(width, photoHeight, {
//       fit: "cover",
//       position: "attention",
//     })
//     .png()
//     .toBuffer();

//   // ==============================
//   // 텍스트 SVG
//   // ==============================

//   const textSvg = `
//     <svg
//       width="${width}"
//       height="${textHeight}"
//       xmlns="http://www.w3.org/2000/svg"
//     >
//       <rect
//         width="100%"
//         height="100%"
//         fill="white"
//       />

//       <text
//         x="${width / 2}"
//         y="${textHeight / 2}"
//         font-size="40"
//         font-family="Arial, sans-serif"
//         font-weight="400"
//         fill="#000000"
//         fill-opacity="0.05"
//         text-anchor="middle"
//         dominant-baseline="middle"
//       >@AltoBot</text>

//       <text
//         x="${paddingX}"
//         y="${paddingTop}"
//         font-size="${fontSize}"
//         font-family="Arial, sans-serif"
//         fill="black"
//       >
//         ${lines
//       .map(
//         (line, index) => `
//               <tspan
//                 x="${paddingX}"
//                 dy="${index === 0 ? 0 : lineHeight}"
//               >${escapeXml(line)}</tspan>
//             `
//       )
//       .join("")}
//       </text>
//     </svg>
//   `;

//   const textArea = Buffer.from(textSvg);

//   // ==============================
//   // 사진 + 본문 합성
//   // ==============================

//   const finalImage = await sharp({
//     create: {
//       width,
//       height: totalHeight,
//       channels: 4,
//       background: "#ffffff",
//     },
//   })
//     .composite([
//       {
//         input: photo,
//         top: 0,
//         left: 0,
//       },
//       {
//         input: textArea,
//         top: photoHeight,
//         left: 0,
//       },
//     ])
//     .webp({
//       quality: 85,
//     })
//     .toBuffer();

//   return finalImage;
// }


import { FieldValue } from "firebase-admin/firestore";
import {
  S3Client,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

import { db } from "./firebaseAdmin.js";

interface Story {
  title: string;
  body: string;
  threadText: string;
  imageScene: string;
}

interface SavePostParams {
  story: Story;
  finalImageBuffer: Buffer;
}

interface UploadR2Result {
  key: string;
  url: string;
}

// R2 클라이언트 설정
const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

// Buffer를 Cloudflare R2에 직접 업로드
async function uploadImageBuffer(
  buffer: Buffer
): Promise<UploadR2Result> {
  const fileName = `${randomUUID()}.webp`;
  const key = `x-generator/${fileName}`;

  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: "image/webp",
    })
  );

  const publicUrl =
    process.env.R2_PUBLIC_URL?.replace(/\/$/, "");

  if (!publicUrl) {
    throw new Error(
      "R2_PUBLIC_URL 환경변수가 설정되어 있지 않습니다."
    );
  }

  return {
    key,
    url: `${publicUrl}/${key}`,
  };
}

export async function savePost({
  story,
  finalImageBuffer,
}: SavePostParams) {
  console.log("R2 이미지 업로드 중...");

  // 1. 메모리에 있는 최종 이미지를 R2로 바로 업로드
  const uploadResult =
    await uploadImageBuffer(finalImageBuffer);

  console.log("R2 업로드 완료");

  // 2. Firestore에 게시물 정보 저장
  const docRef = await db
    .collection("posts")
    .add({
      title: story.title,
      body: story.body,
      threadText: story.threadText,
      imageScene: story.imageScene,

      // React에서 이미지 표시
      imageUrl: uploadResult.url,

      // 나중에 R2 이미지 삭제할 때 사용
      imageKey: uploadResult.key,

      status: "ready",

      createdAt: FieldValue.serverTimestamp(),
    });

  console.log("Firestore 저장 완료");

  return {
    id: docRef.id,
    imageUrl: uploadResult.url,
  };
}


// // Buffer를 Cloudinary에 직접 업로드
// function uploadImageBuffer(
//   buffer: Buffer
// ): Promise<UploadApiResponse> {
//   return new Promise((resolve, reject) => {
//     const uploadStream =
//       cloudinary.uploader.upload_stream(
//         {
//           folder: "x-generator",
//           resource_type: "image",
//         },
//         (error, result) => {
//           if (error) {
//             reject(error);
//             return;
//           }

//           if (!result) {
//             reject(
//               new Error(
//                 "Cloudinary 업로드 결과가 없습니다."
//               )
//             );
//             return;
//           }

//           resolve(result);
//         }
//       );

//     uploadStream.end(buffer);
//   });
// }

// export async function savePost({
//   story,
//   finalImageBuffer,
// }: SavePostParams) {
//   console.log("Cloudinary 이미지 업로드 중...");

//   // 1. 메모리에 있는 최종 이미지를 Cloudinary로 바로 업로드
//   const uploadResult =
//     await uploadImageBuffer(finalImageBuffer);

//   console.log("Cloudinary 업로드 완료");

//   // 2. Firestore에 게시물 정보 저장
//   const docRef = await db
//     .collection("posts")
//     .add({
//       title: story.title,
//       body: story.body,
//       threadText: story.threadText,
//       imageScene: story.imageScene,

//       // React에서 이미지 표시
//       imageUrl: uploadResult.secure_url,

//       // 나중에 Cloudinary 이미지 삭제할 때 사용
//       imagePublicId: uploadResult.public_id,

//       status: "ready",

//       createdAt: FieldValue.serverTimestamp(),
//     });

//   console.log("Firestore 저장 완료");

//   return {
//     id: docRef.id,
//     imageUrl: uploadResult.secure_url,
//   };
// }
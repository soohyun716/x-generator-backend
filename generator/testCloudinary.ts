import { cloudinary } from "./cloudinary.js";

async function main() {
  const result = await cloudinary.uploader.upload(
    "./output/final/3853441d-ca33-4005-bbc7-7274de4f18fb.png",
    {
      folder: "x-generator",
    }
  );

  console.log("업로드 성공!");
  console.log("이미지 URL:", result.secure_url);
  console.log("Public ID:", result.public_id);
}

main().catch((error) => {
  console.error("업로드 실패:");
  console.error(error);
});
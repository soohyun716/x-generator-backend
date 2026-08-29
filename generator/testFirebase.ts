import { db } from "./firebaseAdmin.js";

async function main() {
  const ref = await db.collection("test").add({
    message: "Firebase 연결 성공",
    createdAt: new Date(),
  });

  console.log("Firestore 저장 성공:", ref.id);
}

main().catch(console.error);
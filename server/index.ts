import "dotenv/config";

import express from "express";
import cors from "cors";

import { db } from "../generator/firebaseAdmin.js";
import { cloudinary } from "../generator/cloudinary.js";

const app = express();

app.use(cors());
app.use(express.json());

app.delete("/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const docRef = db.collection("posts").doc(id);

    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      return res.status(404).json({
        message: "게시물이 없습니다.",
      });
    }

    const post = snapshot.data();

    // Cloudinary 이미지 삭제
    if (post?.imagePublicId) {
      await cloudinary.uploader.destroy(
        post.imagePublicId
      );
    }

    // Firestore 삭제
    await docRef.delete();

    return res.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "게시물 삭제 실패",
    });
  }
});

app.listen(3001, () => {
  console.log(
    "API server: http://localhost:3001"
  );
});
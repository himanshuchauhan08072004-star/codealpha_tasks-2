import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { downloadFile } from "../controllers/fileController";

const router = Router();

router.get("/:fileId/download", requireAuth, downloadFile);

export default router;

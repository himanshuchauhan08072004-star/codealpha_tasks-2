import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { upload } from "../middleware/upload";
import {
  createMeeting,
  getMeeting,
  getRecentMeetings,
  endMeeting,
  getMeetingMessages,
  getMeetingFiles,
  uploadMeetingFile,
} from "../controllers/meetingController";

const router = Router();

router.use(requireAuth);

router.post("/", createMeeting);
router.get("/recent", getRecentMeetings);
router.get("/:id", getMeeting);
router.patch("/:id/end", endMeeting);
router.get("/:id/messages", getMeetingMessages);
router.get("/:id/files", getMeetingFiles);
router.post("/:id/files", upload.single("file"), uploadMeetingFile);

export default router;

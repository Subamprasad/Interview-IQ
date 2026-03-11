const express = require("express");
const router = express.Router();
const multer = require("multer");
const auth = require("../middlewares/auth");
const { startInterview, processAnswer, evaluateInterview, getInterview, getUserInterviews } = require("../controllers/interviewController");

const upload = multer({ storage: multer.memoryStorage() });

router.post("/start", auth, upload.single("resume"), startInterview);
router.post("/answer/:id", auth, processAnswer);
router.get("/evaluate/:id", auth, evaluateInterview);
router.get("/user", auth, getUserInterviews);
router.get("/:id", auth, getInterview);




module.exports = router;

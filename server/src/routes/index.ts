import express from "express";
import home from "./homeRoutes";
import twilio from "./twilioRoutes";

const router = express.Router();

router.use("/", home);
router.use("/twilio", twilio);

export default router;

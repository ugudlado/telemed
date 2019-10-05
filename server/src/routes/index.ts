import express from "express";
import {isAuthenticated} from "../utils/requestInterceptors";
import home from "./homeRoutes";
import twilio from "./twilioRoutes";

const router = express.Router();
router.use("/", home);
router.use("/twilio", isAuthenticated, twilio);

export default router;

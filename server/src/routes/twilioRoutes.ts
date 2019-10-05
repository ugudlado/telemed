import express from "express";
import TwilioController from "../controllers/twilioController";

const twilioController = new TwilioController();

const router = express.Router();

router.get("/token", twilioController.getToken);
router.post("/createRoom", twilioController.createRoom);
router.post("/closeRoom", twilioController.closeRoom);
router.post("/recording", twilioController.sendComposition);
router.get("/compositions", twilioController.getCompositionById);
router.get("/download", twilioController.downloadComposition);

export default router;

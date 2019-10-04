import express from "express";
import HomeController from "../controllers/homeController";

const router = express.Router();

const homeController = new HomeController();

router.get("/", homeController.sendHello);

export default router;

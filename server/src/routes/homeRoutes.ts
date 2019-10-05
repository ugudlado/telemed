import express from "express";
import HomeController from "../controllers/homeController";
import UserService from "../services/UserService";

const router = express.Router();

const homeController = new HomeController(new UserService());

router.get("/", homeController.sendHello);
router.post("/login", homeController.authenticate);

export default router;

import { Router } from "express";
import { UserController } from "../controller/UserController.js";
import { ChatController } from "../controller/ChatController.js";
import { authRouter } from "./auth.js";

const authController = new UserController();
const chatController = new ChatController();

export const router = Router();
router.get("/", authController.isAuthenticated, chatController.index);
router.use("/auth", authRouter);

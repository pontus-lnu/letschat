import { Router } from "express";
import { UserController } from "../controller/UserController.js";
import { ChatController } from "../controller/ChatController.js";
import { authRouter } from "./auth.js";
import { chatRouter } from "./chat.js";

const userController = new UserController();
const chatController = new ChatController();

export const router = Router();
router.get("/", userController.isAuthenticated, chatController.index);
router.use("/chat", userController.isAuthenticated, chatRouter);
router.use("/auth", authRouter);

import { Router } from "express";
import { ChatController } from "../controller/ChatController.js";

const chatController = new ChatController();
export const chatRouter = Router();

chatRouter.get("/:userId", chatController.startChat);
chatRouter.post("/:userId", chatController.createMessage);

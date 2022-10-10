import { Router } from "express";
import { UserController } from "../controller/UserController.js";
const authController = new UserController();
export const authRouter = Router();

authRouter.get("/", authController.showWelcome);
authRouter.get("/login", authController.showLoginDialog);
authRouter.get("/signup", authController.showsignupDialog);
authRouter.post("/login", authController.doLogin);
authRouter.post("/logout", authController.doLogout);
authRouter.post("/signup", authController.doSignup);

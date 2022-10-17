import express from "express";
import expressLayouts from "express-ejs-layouts";
import helmet from "helmet";
import { router } from "./routes/router.js";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import session from "express-session";
import passport from "passport";
import morgan from "morgan";
import http from "node:http";
import SocketManager from "./server/SocketManager.js";
import * as dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(helmet());
app.use(express.static("public"));
app.set("view engine", "ejs");
const appDir = dirname(fileURLToPath(import.meta.url));
app.set("views", join(appDir, "views"));
app.use(expressLayouts);
app.set("layout", join(appDir, "views", "layouts", "default"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.set("trust proxy", 1);
const sessionMiddleware = session({
  secret: process.env.SESSION_MIDDLEWARE_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false },
  name: "letschat",
});
app.use(sessionMiddleware);
app.use(passport.authenticate("session"));
app.use("/", router);
const httpServer = http.createServer(app);
const socketManager = new SocketManager(httpServer);
socketManager.addSessionMiddleware(sessionMiddleware);
socketManager.addPassportAuth(passport);
socketManager.run();

httpServer.listen(3000, () => {
  console.log("Listening on *:3000");
});

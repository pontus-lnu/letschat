import express from "express";
import expressLayouts from "express-ejs-layouts";
import helmet from "helmet";
import { router } from "./routes/router.js";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import session from "express-session";
import passport from "passport";
import morgan from "morgan";

const appDir = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(helmet());
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", join(appDir, "views"));
app.use(expressLayouts);
app.set("layout", join(appDir, "views", "layouts", "default"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.set("trust proxy", 1); // trust first proxy
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);
app.use(passport.authenticate("session"));
app.use("/", router);
app.listen(3000);

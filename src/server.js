import express from "express";
import expressLayouts from "express-ejs-layouts";
import helmet from "helmet";
import { router } from "./routes/router.js";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import session from "express-session";
import passport from "passport";
import morgan from "morgan";
import { Server } from "socket.io";
import http from "node:http";
import MessageModel from "./model/Message.js";
import SessionStore from "./server/SessionStore.js";
import crypto from "crypto";

const randomId = () => crypto.randomBytes(8).toString("hex");

const messageModel = new MessageModel();
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
const sessionMiddleware = session({
  secret: "9cf45dd8c9a86af0659f82eaa070b9ec",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false },
  name: "letschat",
});
app.use(sessionMiddleware);
app.use(passport.authenticate("session"));
app.use("/", router);
const httpServer = http.createServer(app);
const io = new Server(httpServer);
const wrap = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next);
io.use(wrap(sessionMiddleware));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));

// io.use((socket, next) => {
//   const username = socket.handshake.auth.username;
//   if (!username) {
//     return next(new Error("invalid username"));
//   }
//   socket.username = username;
//   next();
// });
const sessionStore = new SessionStore();
io.use((socket, next) => {
  if (!socket.request.user) {
    return next(new Error("Unauthorized"));
  }
  const sessionId = socket.handshake.auth.sessionId;
  if (sessionId && session.userId) {
    const session = sessionStore.findSession(sessionId);
    socket.sessionId = sessionId;
    socket.userId = session.userId;
    socket.username = socket.request.user.getUsername();
    return next();
  }
  socket.username = socket.request.user.getUsername();
  socket.userId = socket.request.user.getId();
  socket.sessionId = randomId();
  next();
});

io.on("connection", (socket) => {
  socket.emit("session", {
    sessionId: socket.sessionId,
    userId: socket.userId,
    username: socket.username,
  });

  console.log(socket.username, "connected!");
  const numberOfUsers = io.of("/").sockets.size;
  console.log(numberOfUsers, " user(s) connected.");

  console.log(socket.username, "joining socket", socket.userId.toString());
  socket.join(socket.userId.toString());

  // Tell other users that we've connected
  socket.broadcast.emit("user connected", {
    socketId: socket.socketId,
    userId: socket.userId,
    username: socket.username,
  });

  // Get list of all active users
  const users = [];
  for (let [id, socket] of io.of("/").sockets) {
    users.push({
      socketId: socket.socketId,
      userId: socket.userId,
      username: socket.username,
    });
  }
  socket.emit("users", users);

  socket.on("private message", async ({ content, to }) => {
    console.log("private messages on server", to, content);
    const newMessage = await messageModel.createMessage(
      socket.userId,
      to,
      content
    );
    socket
      .to(to)
      .to(socket.userId)
      .emit("private message", {
        content: content,
        from: { id: socket.userId, username: socket.username },
        timestamp: newMessage.getTimestamp(),
      });
  });

  socket.on("disconnect", () => {
    console.log(socket.username, "disconnected");
    const numberOfUsers = io.of("/").sockets.size;
    console.log(numberOfUsers, " user(s) connected.");
    io.emit("user disconnected", {
      userId: socket.socketId,
      username: socket.username,
    });
  });
});

httpServer.listen(3000, () => {
  console.log("Listening on *:3000");
});

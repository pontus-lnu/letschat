import MessageModel from "../model/Message.js";
import SessionStore from "./SessionStore.js";
import crypto from "crypto";
import { Server } from "socket.io";

export default class SocketManager {
  #io;
  #sessionStore = new SessionStore();
  #messageModel = new MessageModel();

  constructor(httpServer) {
    this.#io = new Server(httpServer);
  }

  run = () => {
    this.#parseSession();
    this.#handleConnection();
  };

  addSessionMiddleware(sessionMiddleware) {
    this.#io.use(this.#wrapper(sessionMiddleware));
  }

  addPassportAuth(passportAuth) {
    this.#io.use(this.#wrapper(passportAuth.initialize()));
    this.#io.use(this.#wrapper(passportAuth.session()));
  }

  #wrapper = (middleware) => (socket, next) =>
    middleware(socket.request, {}, next);

  #generateRandomId = () => {
    return crypto.randomBytes(8).toString("hex");
  };

  #parseSession = () => {
    this.#io.use((socket, next) => {
      if (!socket.request.user) {
        return next(new Error("Unauthorized"));
      }
      const sessionId = socket.handshake.auth.sessionId;
      console.log("sessionId", sessionId);
      if (sessionId) {
        console.log("grabbing session from store");
        const session = this.#sessionStore.findSession(sessionId);
        if (session) {
          socket.sessionId = sessionId;
          socket.userId = session.userId;
          socket.username = socket.request.user.getUsername();
          return next();
        }
      }
      socket.username = socket.request.user.getUsername();
      socket.userId = socket.request.user.getId();
      socket.sessionId = this.#generateRandomId();
      this.#sessionStore.saveSession(socket.sessionId, {
        userId: socket.userId,
        username: socket.username,
      });
      next();
    });
  };

  #handleConnection = () => {
    this.#io.on("connection", async (socket) => {
      socket.emit("session", {
        sessionId: socket.sessionId,
        userId: socket.userId,
        username: socket.username,
      });

      console.log(socket.username, "connected!");
      const numberOfUsers = this.#io.of("/").sockets.size;
      console.log(numberOfUsers, " user(s) connected.");

      console.log(
        socket.username,
        "joining socket",
        socket.userId,
        "session",
        socket.sessionId
      );
      socket.join(socket.userId.toString());

      const matchingSockets = await this.#io
        .in(socket.userId.toString())
        .allSockets();
      console.log(matchingSockets);
      if (matchingSockets.size < 2) {
        socket.broadcast.emit("user connected", {
          socketId: socket.socketId,
          userId: socket.userId,
          username: socket.username,
        });
      }

      const users = [];
      for (let [id, s] of this.#io.of("/").sockets) {
        let userExists = false;
        users.forEach((user) => {
          if (user.userId == s.userId) {
            userExists = true;
          }
        });
        if (userExists) {
          continue;
        }
        if (s.userId == socket.userId) {
          continue;
        }
        users.push({
          socketId: s.socketId,
          userId: s.userId,
          username: s.username,
        });
      }
      socket.emit("users", users);

      socket.on("private message", async ({ content, to }) => {
        console.log("private messages on server", to, content);
        const newMessage = await this.#messageModel.createMessage(
          socket.userId,
          to,
          content
        );
        socket
          .to(to)
          .to(socket.userId.toString())
          .emit("private message", {
            content: newMessage.getContent(),
            from: { userId: socket.userId, username: socket.username },
            timestamp: newMessage.getTimestamp(),
          });
      });

      socket.on("disconnect", async () => {
        console.log(numberOfUsers, " user(s) connected.");
        const matchingSockets = await this.#io
          .in(socket.userId.toString())
          .allSockets();
        console.log("matching sockets", matchingSockets);
        const isDisconnected = matchingSockets.size === 0;
        if (isDisconnected) {
          socket.broadcast.emit("user disconnected", socket.userId);
        }
      });

      socket.on("get messages", async ({ user1, user2 }) => {
        console.log("getting messages");
        const getMessagesResponse = await this.#messageModel.getMessages(
          user1,
          user2
        );
        const messagesToEmit = [];
        getMessagesResponse.forEach((message) => {
          messagesToEmit.push({
            from: message.getSender(),
            to: message.getReceiver(),
            content: message.getContent(),
            timestamp: message.getTimestamp(),
          });
        });
        console.log(messagesToEmit);
        socket.emit("messages", messagesToEmit);
      });
    });
  };
}

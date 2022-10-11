import MessageModel from "../model/Message.js";
import UserModel from "../model/User.js";

const messageModel = new MessageModel();
const userModel = new UserModel();

export class ChatController {
  async index(req, res) {
    const viewdata = {
      user: { username: req.user.getUsername(), id: req.user.getId() },
    };
    res.render("chat/index", { viewdata });
  }

  async startChat(req, res, next) {
    const messages = await messageModel.getMessages(
      req.user.getId(),
      req.params.userId
    );
    const peer = await userModel.getUserById(req.params.userId);
    res.render("chat/start", {
      user: { username: req.user.getUsername(), id: req.user.getId() },
      peer: { username: peer.getUsername(), id: peer.getId() },
      messages: messages,
    });
  }

  async createMessage(req, res, next) {
    try {
      await messageModel.createMessage(
        req.user.getId(),
        req.params.userId,
        req.body.chatmessage
      );
      const messages = await messageModel.getMessages(
        req.user.getId(),
        req.params.userId
      );
      const peer = await userModel.getUserById(req.params.userId);

      res.render("chat/start", {
        user: { username: req.user.getUsername(), id: req.user.getId() },
        peer: { username: peer.getUsername(), id: peer.getId() },
        messages: messages,
      });
    } catch (e) {
      console.error(e);
      res.render("chat/index");
    }
  }
}

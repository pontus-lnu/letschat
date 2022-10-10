export class ChatController {
  async index(req, res) {
    res.render("chat", { username: req.user.getUsername() });
  }
}

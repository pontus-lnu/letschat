import { pool } from "../lib/db.js";
import { fromUnixTime, getUnixTime } from "date-fns";

export class Message {
  #sender;
  #receiver;
  #content;
  #timestamp;

  constructor(sender, reciever, content, timestamp) {
    this.#sender = sender;
    this.#receiver = reciever;
    this.#content = content;
    this.#timestamp = timestamp;
  }

  getSender() {
    return this.#sender;
  }

  getReceiver() {
    return this.#receiver;
  }

  getContent() {
    return this.#content;
  }

  getTimestamp() {
    return fromUnixTime(this.#timestamp);
  }
}

export default class MessageModel {
  async getMessages(participant1, participant2) {
    const lastTenMessages = {
      text: "SELECT * FROM messages WHERE sender in ($1,$2) AND receiver in ($1,$2) LIMIT 10",
      values: [participant1, participant2],
    };
    const messagesResponse = await pool.query(lastTenMessages);
    const messages = [];
    messagesResponse.rows.forEach((row) => {
      messages.push(
        new Message(row.sender, row.receiver, row.content, row.timestamp)
      );
    });
    return messages.sort((a, b) => a.getTimestamp() - b.getTimestamp());
  }

  async createMessage(sender, receiver, message) {
    const timestamp = getUnixTime(Date.now());
    pool.query({
      text: "INSERT INTO messages(sender,receiver,content,timestamp) VALUES ($1,$2,$3,$4)",
      values: [sender, receiver, message, timestamp],
    });
  }
}

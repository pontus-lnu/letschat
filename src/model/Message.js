import { pool } from "../lib/db.js";
import { fromUnixTime, getUnixTime } from "date-fns";
import { Pntscrypt } from "@pf222jd/pntscrypt";

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
    return fromUnixTime(this.#timestamp).toString();
  }
}

export default class MessageModel {
  async getMessages(participant1, participant2) {
    const messagesInDb = {
      text: "SELECT * FROM messages WHERE sender in ($1,$2) AND receiver in ($1,$2)",
      values: [participant1, participant2],
    };
    const messagesResponse = await pool.query(messagesInDb);
    const messages = [];
    messagesResponse.rows.forEach((row) => {
      messages.push(this.#createMessageFromRow(row));
    });
    return messages.sort((a, b) => a.getTimestamp() - b.getTimestamp());
  }

  async createMessage(sender, receiver, message) {
    const timestamp = getUnixTime(Date.now());
    const encryption = new Pntscrypt(message);
    const encryptedMessage = encryption.encryptUsingSubstitution(10);
    const createMessageResponse = await pool.query({
      text: "INSERT INTO messages(sender,receiver,content,timestamp) VALUES ($1,$2,$3,$4) RETURNING *",
      values: [sender, receiver, encryptedMessage, timestamp],
    });
    if (createMessageResponse.rows.length === 1) {
      return this.#createMessageFromRow(createMessageResponse.rows[0]);
    } else {
      throw Error("Could not create message.");
    }
  }

  #createMessageFromRow(row) {
    const pntscrypt = new Pntscrypt(row.content);
    return new Message(
      row.sender,
      row.receiver,
      pntscrypt.decryptUsingSubstitution(10),
      row.timestamp
    );
  }
}

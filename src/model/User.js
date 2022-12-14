import { Pntscrypt } from "@pf222jd/pntscrypt";
import { pool } from "../lib/db.js";

class User {
  #username = "";
  #password = "";
  #id;

  constructor(username, password, id) {
    this.#username = username;
    this.#password = password;
    this.#id = id;
  }

  comparePassword(passwordToCompare) {
    const pntscrypt = new Pntscrypt(passwordToCompare);
    return this.#password === pntscrypt.encryptUsingHash();
  }

  getUsername() {
    return this.#username;
  }

  getId() {
    return this.#id;
  }
}

export default class UserModel {
  async getUser(username) {
    const pntscrypt = new Pntscrypt(username);
    const getUserResponse = await pool.query({
      text: "SELECT * FROM users WHERE username = $1",
      values: [pntscrypt.encryptUsingSubstitution(10)],
    });
    if (getUserResponse.rowCount !== 1) {
      throw Error("No user with username: " + username);
    } else {
      return this.#createUserFromRow(getUserResponse.rows[0]);
    }
  }

  async getUserById(id) {
    const getUserResponse = await pool.query({
      text: "SELECT * FROM users WHERE id = $1",
      values: [id],
    });
    if (getUserResponse.rowCount !== 1) {
      throw Error("No user with id: ", id);
    } else {
      return this.#createUserFromRow(getUserResponse.rows[0]);
    }
  }

  async createUser(username, password) {
    const pntscrypt = new Pntscrypt(password);
    const hashedPassword = pntscrypt.encryptUsingHash();
    const usernameEncryption = new Pntscrypt(username);
    const createUserResponse = await pool.query({
      text: "INSERT INTO users(username, password) VALUES($1, $2)",
      values: [usernameEncryption.encryptUsingSubstitution(10), hashedPassword],
    });
    if (createUserResponse.rowCount === 1) {
      return new User(username, hashedPassword);
    } else {
      throw Error("Could not add user " + username);
    }
  }

  #createUserFromRow(row) {
    const pntscrypt = new Pntscrypt(row.username);
    return new User(
      pntscrypt.decryptUsingSubstitution(10),
      row.password,
      row.id
    );
  }
}

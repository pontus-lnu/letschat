import { Pntscrypt } from "@pf222jd/pntscrypt";
import { pool } from "../lib/db.js";

class User {
  #username = "";
  #password = "";

  constructor(username, password) {
    this.#username = username;
    this.#password = password;
  }

  comparePassword(passwordToCompare) {
    const pntscrypt = new Pntscrypt(passwordToCompare);
    return this.#password === pntscrypt.encryptUsingHash();
  }

  getUsername() {
    return this.#username;
  }
}

export default class UserModel {
  async getUser(username) {
    const getUserResponse = await pool.query({
      text: "SELECT * FROM users WHERE username = $1",
      values: [username],
    });
    if (getUserResponse.rowCount == 0) {
      throw Error("No user with username: " + username);
    } else {
      return new User(
        getUserResponse.rows[0].username,
        getUserResponse.rows[0].password
      );
    }
  }

  async createUser(username, password) {
    const pntscrypt = new Pntscrypt(password);
    const hashedPassword = pntscrypt.encryptUsingHash();
    const createUserResponse = await pool.query({
      text: "INSERT INTO users(username, password) VALUES($1, $2)",
      values: [username, hashedPassword],
    });
    if (createUserResponse.rowCount === 1) {
      return new User(username, hashedPassword);
    } else {
      throw Error("Could not add user " + username);
    }
  }
}

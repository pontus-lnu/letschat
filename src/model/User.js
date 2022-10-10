import { pool } from "../lib/db.js";

class User {
  #username = "";
  #password = "";

  constructor(username, password) {
    this.#username = username;
    this.#password = password;
  }

  comparePassword(password) {
    return this.#password == password;
  }

  getUsername() {
    return this.#username;
  }
}

export class UserModel {
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
    const createUserResponse = await pool.query({
      text: "INSERT INTO users(username, password) VALUES($1, $2)",
      values: [username, password],
    });
    if (createUserResponse.rowCount === 1) {
      return new User(username, password);
    } else {
      throw Error("Could not add user " + username);
    }
  }
}

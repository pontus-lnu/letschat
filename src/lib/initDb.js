import pkg from "pg";
const { Pool } = pkg;

export const pool = new Pool({
  user: "postgres",
  host: "127.0.0.1",
  database: "letschat",
  password: "letschat",
  port: 5432,
});

// const createDb = {
//   text: "CREATE DATABASE $1",
//   values: ["letschat"],
// };

// pool.query(createDb);

pool.query({
  text: "INSERT into USERS(username, password) VALUES($1, $2)",
  values: ["john", "john"],
});
pool.query({
  text: "INSERT into USERS(username, password) VALUES($1, $2)",
  values: ["bob", "bob"],
});
pool.query({
  text: "INSERT into USERS(username, password) VALUES($1, $2)",
  values: ["alice", "alice"],
});
pool.end();

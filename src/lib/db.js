import pkg from "pg";
const { Pool } = pkg;

export const pool = new Pool({
  user: "postgres",
  host: "127.0.0.1",
  database: "letschat",
  password: "letschat",
  port: 5432,
});

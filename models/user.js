"use strict";

const { NotFoundError } = require("../expressError");
const db = require("../db");

/** User of the site. */

class User {

  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    const result = await db.query(
      `INSERT INTO users (username,
                          password,
                          first_name,
                          last_name,
                          phone,
                          join_at)
        VALUES ($1, $2, $3, $4, $5, current_timestamp)
        RETURNING username, password, first_name, last_name, phone`,
      [username, password, first_name, last_name, phone]
    );

    return result.rows[0];
  }

  /** Authenticate: is username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const result = await db.query(
      `SELECT password
        FROM users
        WHERE username = $1`,
      [username]
    );
    const user = result.rows[0];

    if (user.password !== password) {
      return false;
    }
    return true;
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const result = await db.query(
      `UPDATE users
        SET last_login_at = current_timestamp
        WHERE username = $1`,
      [username]
    );

    return result.rows[0];
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() {
    const result = await db.query(
      `SELECT username, first_name, last_name
        FROM users`
    );

    return result.rows;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await db.query(
      `SELECT username,
              first_name,
              last_name,
              phone,
              join_at,
              last_login_at
        FROM users
        WHERE username = $1`,
      [username]
    );
    const user = result.rows[0];

    if (!user) throw new NotFoundError('User does not exist');

    return user;
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    // const user = User.get(username);
    const allMessages = [];

    // if (!user) throw new NotFoundError(`User does not exist: ${username}`);

    const result = await db.query(
      `SELECT messages.id,
              messages.to_username,
              t.first_name AS to_first_name,
              t.last_name AS to_last_name,
              t.phone AS to_phone,
              messages.from_username,
              f.first_name AS from_first_name,
              f.last_name AS from_last_name,
              f.phone AS from_phone,
              messages.body,
              messages.sent_at,
              messages.read_at
        FROM messages
        JOIN users AS t ON messages.to_username = t.username
        JOIN users AS f ON messages.from_username = f.username
        WHERE f.username = $1`,
      [username]
    );
    const messages = result.rows;
    console.log(messages);

    for (let message of messages) {
      let data = {
        id: message.id,
        to_user: {
          username: message.to_username,
          first_name: message.to_first_name,
          last_name: message.to_last_name,
          phone: message.to_phone,
        },
        body: message.body,
        sent_at: message.sent_at,
        read_at: message.read_at,
      };

      allMessages.push(data);
    }
    return allMessages;
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    // const user = User.get(username);
    const allMessages = [];

    // if (!user) throw new NotFoundError(`User does not exist: ${username}`);

    const result = await db.query(
      `SELECT messages.id,
              messages.to_username,
              t.first_name AS to_first_name,
              t.last_name AS to_last_name,
              t.phone AS to_phone,
              messages.from_username,
              f.first_name AS from_first_name,
              f.last_name AS from_last_name,
              f.phone AS from_phone,
              messages.body,
              messages.sent_at,
              messages.read_at
        FROM messages
        JOIN users AS t ON messages.to_username = t.username
        JOIN users AS f ON messages.from_username = f.username
        WHERE t.username = $1`,
      [username]
    );
    const messages = result.rows;

    for (let message of messages) {
      let data = {
        id: message.id,
        from_user: {
          username: message.from_username,
          first_name: message.from_first_name,
          last_name: message.from_last_name,
          phone: message.from_phone,
        },
        body: message.body,
        sent_at: message.sent_at,
        read_at: message.read_at,
      };

      allMessages.push(data);
    }

    return allMessages;
  }
}


module.exports = User;

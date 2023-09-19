"use strict";

const { SECRET_KEY } = require("../config");
const { BadRequestError, UnauthorizedError } = require("../expressError");
const User = require("../models/user");
const jwt = require('jsonwebtoken');

const Router = require("express").Router;
const router = new Router();

/** POST /login: {username, password} => {token} */
router.post('/login', async function (req, res) {
  if (req.body === undefined) throw new BadRequestError();

  const { username, password } = req.body;
  if (await User.authenticate(username, password)) {
    let payload = { username };
    let token = jwt.sign(payload, SECRET_KEY);

    return res.json({ token });
  }

  throw new UnauthorizedError('Invalid credentials');
});


/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */

router.post('/register', async function (req, res) {

});

module.exports = router;
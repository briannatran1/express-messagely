"use strict";

const Router = require("express").Router;
const router = new Router();
const Message = ('../models/message');
const { ensureLoggedIn } = require("../middleware/auth");
const { UnauthorizedError } = require("../expressError");

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Makes sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get('/:id', ensureLoggedIn, async function (req, res) {
  const user = res.locals.user.username;
  const message = await Message.get(req.params.id);

  if (message.to_user.username !== user || message.from_user.username !== user) {
    throw new UnauthorizedError('Unauthorized action');
  }

  return res.json({ message });
});


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post('/', ensureLoggedIn, async function (req, res) {
  const { from_username, to_username, body } = req.body;
  const message = await Message.create(req.body);

  return res.json({ message });
});


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Makes sure that the only the intended recipient can mark as read.
 *
 **/

router.post('/:id/read', ensureLoggedIn, async function (req, res) {
  const message = await Message.get(id);
  const user = res.locals.user.username;

  if (message.to_user.username === user) {
    await Message.markRead(req.params.id);
  }

  throw new UnauthorizedError('Unauthorized action');
});


module.exports = router;
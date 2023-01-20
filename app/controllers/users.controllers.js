const { json } = require("body-parser");
const Joi = require("joi");
const { token } = require("morgan");
const db = require("../../database");
const users = require("../models/users.models");

const getAll = (req, res) => {
  users.getAllUsers((err, num_rows, results) => {
    if (err == 401)
      return res.status(401).send("Unauthorised, You need to login...");
    if (err) return res.status(500).send("Server Error...");

    return res.status(200).send(results);
  });
};

const create = (req, res) => {
  const schema = Joi.object({
    first_name: Joi.string().trim().required(),
    last_name: Joi.string().trim().required(),
    email: Joi.string().email().trim().required(),
    password: Joi.string()
      .pattern(
        new RegExp(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,30}$/
        )
      )
      .required(),
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = Object.assign({}, req.body);

  users.addNewUser(user, (err, id) => {
    if (err == 400) return res.status(400).send("Bad Request...");
    if (err == 401)
      return res.status(401).send("Unauthorised, You need to login...");
    if (err) return res.status(500).send("Server Error...");

    return res.status(201).send({
      user_id: id,
    });
  });
};

const login = (req, res) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(20).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let email = req.body.email;
  let password = req.body.password;

  users.authenticateUser(email, password, (err, id) => {
    if (err) return res.status(400).send("Invalid email or password");

    users.getToken(id, (err, token) => {
      if (err == 400) {
        return res.sendStatus(400);
      } else if (err) {
        return res.sendStatus(500);
      }

      if (token) {
        return res.status(200).send({ user_id: id, session_token: token });
      } else {
        users.setToken(id, (err, token) => {
          if (err) return res.sendStatus(500);

          return res.status(200).send({
            user_id: id,
            session_token: token,
          });
        });
      }
    });
  });
};

const logout = (req, res) => {
  let token = req.get("X-Authorization");
  users.removeToken(token, (err) => {
    if (err == 401)
      return res.status(401).send("Unauthorised, You need to login");
    if (err) return res.status(500).send("Server Error...");

    return res.sendStatus(200);
  });
  return null;
};

module.exports = {
  getAll: getAll,
  create: create,
  login: login,
  logout: logout,
};

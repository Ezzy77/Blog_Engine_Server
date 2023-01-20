const Joi = require("joi");
const articles = require("../models/articles.models");
const users = require("../models/users.models");

const getAll = (req, res) => {
  articles.getAllArticles((err, num_rows, results) => {
    if (err) return res.sendStatus(500);

    return res.status(200).send(results);
  });
};

const create = (req, res) => {
  const schema = Joi.object({
    title: Joi.string().required(),
    author: Joi.string().required(),
    article_text: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let token = req.get("X-Authorization"); //get the token from the header...

  users.getIdFromToken(token, (err, id) => {
    if (err) return res.sendStatus(500);

    let article = Object.assign({}, req.body);

    articles.addNewArticle(article, id, (err, id) => {
      if (err == 400) return res.status(400).send("Bad Request...");
      if (err == 401)
        return res.status(401).send("Unauthorised! You need to login...");
      if (err) return res.status(500).send("Server Error");

      return res.status(201).send({ article_id: id });
    });
  });
};

const getOne = (req, res) => {
  let article_id = parseInt(req.params.article_id);

  articles.getSingleArticles(article_id, (err, result) => {
    if (err == 404) return res.status(404).send("Not found...");
    if (err) return res.status(500).send("Server Error");

    return res.status(200).send(result);
  });
};

const updateArticle = (req, res) => {
  let article_id = parseInt(req.params.article_id);

  articles.getSingleArticles(article_id, (err, result) => {
    if (err === 404) return res.sendStatus(404);
    if (err) return res.sendStatus(500);

    const schema = Joi.object({
      title: Joi.string(),
      author: Joi.string(),
      article_text: Joi.string(),
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    if (req.body.hasOwnProperty("title")) {
      result.title = req.body.title;
    }

    if (req.body.hasOwnProperty("author")) {
      result.author = req.body.author;
    }

    if (req.body.hasOwnProperty("article_text")) {
      result.article_text = req.body.article_text;
    }
    articles.updateArticle(article_id, result, (err, id) => {
      if (err == 400) return res.status(400).send("Bad Request...");
      if (err == 401)
        return res.status(401).send("Unauthorised! You need to login...");
      if (err == 404) return res.status(404).send("Not found...");
      if (err) return res.status(500).send("Server Error");

      return res.sendStatus(200);
    });
  });
};

const deleteArticle = (req, res) => {
  let article_id = parseInt(req.params.article_id);

  articles.findArticleId(article_id, (err, row) => {
    if (err || row === null) {
      return res.status(404).send("Article with that ID does not exist");
    }

    articles.deleteArticle(article_id, (err) => {
      if (!article_id) return res.sendStatus(404);
      if (err == 401)
        return res.status(401).send("Unauthorised! You need to login...");
      if (err == 404) return res.status(404).send("Not found...");
      if (err) return res.status(500).send("Server Error");
      return res.sendStatus(200);
    });
  });
};

module.exports = {
  getAll: getAll,
  create: create,
  getOne: getOne,
  updateArticle: updateArticle,
  deleteArticle: deleteArticle,
};

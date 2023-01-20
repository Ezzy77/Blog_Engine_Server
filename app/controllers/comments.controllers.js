const Joi = require("joi");
const comments = require("../models/comments.models");
const articles = require("../models/articles.models");

const getAll = (req, res) => {
  //get the path param
  let article_id = parseInt(req.params.article_id);
  comments.getAllComments(article_id, (err, num_rows, results) => {
    if (err == 404) res.status(404).send("Not Found..");
    if (err) res.status(500).send("Server Error..");

    return res.status(200).send(results);
  });
};

const create = (req, res) => {
  let article_id = parseInt(req.params.article_id);

  const schema = Joi.object({
    comment_text: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let comment = Object.assign({}, req.body);

  articles.findArticleId(article_id, (err, row) => {
    if (err || row === null) {
      return res
        .status(404)
        .send("Posting comment to an article that does not exist");
    }
    comments.addNewComment(article_id, comment, (err, id) => {
      if (article_id == null) return res.sendStatus(404);
      if (err === 400) return res.status(400).send("Bad Request...");
      if (err === 401)
        return res.status(401).send("Unauthorised! You need to login...");
      if (err === 404) return res.status(404).send("Not Found...");
      if (err) return res.status(500).send("Server Error...");

      return res.status(201).send({
        comment_id: id,
      });
    });
  });
};

const deleteComment = (req, res) => {
  let comment_id = parseInt(req.params.comment_id);

  comments.findCommentId(comment_id, (err, row) => {
    if (err || row === null) {
      return res.status(404).send("Comment not found");
    }
    comments.deleteComment(comment_id, (err) => {
      if (err == 404) return res.status(404).send("Not Found...");
      if (err == 401)
        return res.status(401).send("Unauthorised, You need to login...");
      if (err) return res.status(500).send("Server Error");

      return res.sendStatus(200);
    });
  });
};

module.exports = {
  getAll: getAll,
  create: create,
  deleteComment: deleteComment,
};

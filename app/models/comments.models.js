const db = require("../../database");

const getAllComments = (article_id, done) => {
  const results = [];
  const sql = "SELECT * FROM comments WHERE article_id=? ";

  db.each(
    sql,
    [article_id],
    (err, row) => {
      if (err) console.log("Something went wrong " + err);

      results.push({
        comment_id: row.comment_id,
        comment_text: row.comment_text,
        date_published: row.date_published,
      });
    },
    (err, num_rows) => {
      return done(err, num_rows, results);
    }
  );
};

const addNewComment = (article_id, comment, done) => {
  let datePublished = new Date().toLocaleString();

  const sql =
    "INSERT INTO comments (article_id, comment_text, date_published) VALUES (?,?,?)";
  let values = [article_id, comment.comment_text, datePublished];

  db.run(sql, values, function (err) {
    if (err) return done(err, null);

    return done(null, this.lastID);
  });
};

// this is used when trying to deleting a comment that does not exist
const findCommentId = (id, done)=>{
  if (id === undefined || id === null)
      return done(true, null);
  else {
      db.get(
          'SELECT * FROM comments WHERE comment_id=?',
          [id],
          function(err, row){
              if (row != null)
                  return done(null, row.comment_id);
              return done(err, null);
          }
      )
  }
}

const deleteComment = (id, done) => {
  const sql = "DELETE from comments WHERE comment_id=?";

  db.run(sql, [id], (err, row) => {
    if (err) return done(err);

    return done(err);
  });
};

module.exports = {
  getAllComments: getAllComments,
  addNewComment: addNewComment,
  deleteComment: deleteComment,
  findCommentId
};

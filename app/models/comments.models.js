const db = require("../../database");

const getAllComments = (done)=>{
    const results = []
    const sql = "SELECT * FROM comments"

    db.each(sql, 
        [],
        (err, row)=>{
            if(err) console.log("Something went wrong " + err);

            results.push({
                comment_id: row.comment_id,
                comment_text: row.comment_text,
                date_published: new Date(row.date_published).toLocaleDateString(),
                article_id: row.article_id
            });
        },
        (err, num_rows)=>{
            return done(err, num_rows, results);
        }
    )
}


const addNewComment = (comment, done)=>{
    let datePublished = Date.now();
    const sql = 'INSERT INTO comments (comment_text, date_published) VALUES (?,?)';
    let values = [comment.comment_text, comment.datePublished];

    db.run(
        sql, 
        values, 
        function(err){
            if(err) return done(err, null);

            return done(null, this.lastID);
        }
    )
}

const deleteComment = (id, done) =>{
    const sql = 'DELETE from comments WHERE comment_id=?';

    db.run(sql, [id],(err, row)=>{
        if(err) return done(err)

        return done(false);
    })
}

module.exports={
    getAllComments: getAllComments,
    addNewComment: addNewComment,
    deleteComment: deleteComment

}
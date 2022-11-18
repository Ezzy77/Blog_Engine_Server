const Joi  = require('joi');
const comments = require("../models/comments.models");

const getAll = (req, res)=>{
    comments.getAllComments((err, num_rows, results)=>{
        if(err===404) {
            return res.sendStatus(404)
        }else if(err){
            return res.sendStatus(500)
        }

        return res.status(200).send(results);
    })
}

const create = (req, res)=>{

    const schema = Joi.object({
        "comment_text": Joi.string().required()
    })

    const { error } = schema.validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    let comment = Object.assign({}, req.body);

    comments.addNewComment(comment, (err, id)=>{
        if(err===500) return res.sendStatus(500);
        if(err===404) return res.sendStatus(404)

        return res.status(201).send({
            comment_id: id
        })
    })
}

const deleteComment = (req, res) =>{
    let comment_id = parseInt(req.params.comment_id);

    comments.deleteComment(comment_id, (err)=>{
        if(err===401) return res.sendStatus(401);
        if(err===404) return res.sendStatus(404);
        
        return res.sendStatus(200)
    })
}

module.exports = {
    getAll: getAll,
    create: create,
    deleteComment: deleteComment
}
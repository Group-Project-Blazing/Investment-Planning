const { User, Whishlist} = require('../models')
const jwt = require('jsonwebtoken')

const authentification = (req, res, next) => {
    if(!req.headers.access_token){
        throw 'YOU ARE NOT LOGIN'
    }

    try{
        let decoded = jwt.verify(req.headers.access_token, process.env.SECRET_KEY)
        req.UserId = decoded.id
        
        User.findOne({where:{id:decoded.id}})
        .then(user => {
            if(user){
                next()
            }else {
                throw "User Not Found";
            }
        })
        .catch(err => {
            res.status(404).json(err)
        })
    }
    catch(err){
        res.status(401).json({"message":"INVALID ACCESS TOKEN"})
    }
}

const authorization = (req, res, next) => {
    const { id } = req.params

    Whishlist.findOne({where:{id,UserId:req.UserId}})
    .then(result => {
        if(result){
            req.whishlist = result
            next()
        }else{
            throw "Whishlist Not Found"
        }
    })
    .catch(err => {
        res.status(404).json(err)
    })
}

module.exports = { authentification, authorization}
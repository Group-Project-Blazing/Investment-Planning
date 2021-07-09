const { User } = require('../models')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

class UserController {
    static register(req, res){
        console.log(req.body);
        const { email, password} = req.body

        User.create({email,password})
        .then(data => {
            
            res.status(201).json({id:data.id,email:data.email,saldo:data.saldo});
        })
        .catch(err => {
            res.status(500).json(err)
        })
    }

    static login(req, res, next){
        const {email, password} = req.body

        User.findOne({where:{email}})
        .then(result => {
            if(result && bcrypt.compareSync(password, result.password)){
                const payload = {
                    id : result.id
                }

                let access_token = jwt.sign(payload, process.env.SECRET_KEY)

                res.status(200).json({"id":result.id,"email":result.email,"access_token":access_token,"saldo":result.saldo})
            }
        })
        .catch(err => {
            res.status(401).json(err)
        })
    }

    static googleLogin(req, res, next){
        const { idToken } = req.body
        let email
        let statusCode = 200

        client.verifyIdToken({
            idToken,
            audience:process.env.GOOGLE_CLIENT_ID
        })
        .then((ticket) => {

            email = ticket.getPayload().email

            return User.findOne({where:{email}})
        })
        .then(user => {
            if(user) {
                return user
            }

            statusCode = 200;
            return User.create({
                email,
                password:process.env.DEFAULT_PASSWORD
            })
        })
        .then(user => {
            const access_token = jwt.sign({id:user.id}, process.env.SECRET_KEY)
            res.status(statusCode).json({access_token})
        })
        .catch(err => {
            res.json(401).json(err)
        })
    }
}

module.exports = UserController
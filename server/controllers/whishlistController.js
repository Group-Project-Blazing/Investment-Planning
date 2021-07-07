const {Whishlist} = require('../models')

class WhishlistController {
    static getAll(req, res, next){
        Whishlist.findAll({where:{UserId:req.UserId}})
        .then(result => {
            res.status(200).json(result)
        })
        .catch(err => {
            res.status(404).json(err)
        })
    }

    static addWhishlist(req, res, next){
        const {name, image_url, price, description} = req.body

        Whishlist.create({name,price, image_url, UserId:req.UserId,description})
        .then(result => {
            res.status(201).json(result)
        })
        .catch(err => {
            res.status(500).json(err)
        })
    }

    static findById(req, res, next){
        res.status(200).json(req.whishlist)
    }

    static deleteWhishlists(req, res, next){
        const { whishlist } = req

        whishlist
        .destroy()
        .then(()=>{
            res.json(200).json({"message":"Successfully delete Wishlist"})
        })
        .catch(err => {
            res.json(500).json(err)
        })
    }
}

module.exports = WhishlistController
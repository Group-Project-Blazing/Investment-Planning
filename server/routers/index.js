const UserController = require('../controllers/userController')
const WhishlistController = require('../controllers/whishlistController')
const { authentification, authorization } = require('../middleware/auth')

const router = require('express').Router()

router.post('/register', UserController.register)
router.post('/login', UserController.login)
router.get('/wishlists', authentification, WhishlistController.getAll)
router.post('/wishlists', authentification, WhishlistController.addWhishlist)
router.delete('/wishlists/:id', authentification, authorization, WhishlistController.deleteWhishlists)

module.exports = router
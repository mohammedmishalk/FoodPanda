const express = require('express');

const router = express.Router();
const controller = require('../controllers/userControl');

router.get('/login', controller.loginRender);
router.post('/login', controller.loginPost);
router.get('/logout', controller.logout);
router.get('/signup', controller.signupRender);
router.post('/signup', controller.signupPost);
router.get('/home', controller.userHomeRender);
router.get('/food', controller.userfood);
// router.get('/productDetail/:id', controller.getProductDetail);
router.get('/otp', controller.GetOtp)
router.post('/otp', controller.PostOtp) 
router.get('/cart',controller.cart)
router.get('/addcart/:id',controller.addCart)
router.get('/add',controller.add) 
router.get('/reduce/:id',controller.reduce)
router.get('/remove/:id',controller.remove)
// router.post('/verify-otp', userController.verifyOtp)

module.exports = router;   

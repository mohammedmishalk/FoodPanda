const express = require('express');

const router = express.Router();
const controller = require('../controllers/userControl');
const cart = require("../models/carts");
const verifyLogin = require("../middleware/Session");



router.get('/login', controller.loginRender);
router.post('/login', controller.loginPost);
router.get('/logout', controller.logout);
router.get('/signup', controller.signupRender);
router.post('/signup', controller.signupPost);
router.get('/home',controller.userHomeRender);
// router.get('/food', verifyLogin.userSession,controller.userfood);
// router.get('/productDetail/:id', controller.getProductDetail);
router.get('/otp',controller.GetOtp)
router.post('/otp', controller.PostOtp) 

router.get('/productDetail/:id', controller.getProductDetail);
router.get('/checkout', verifyLogin.userSession, controller.getCheckout);
router.get('/addToCart/:id', verifyLogin.userSession,controller.getAddToCart);
router.get('/cart',verifyLogin.userSession, controller.getCart);
router.get('/profile', verifyLogin.userSession, controller.getProfile);
router.post('/cartQuantity', verifyLogin.userSession, controller.cartQuantity);
router.post('/deleteProduct', verifyLogin.userSession, controller.postDeleteProduct);
router.get('/changePassword', verifyLogin.userSession, controller.getChangePassword);
router.post('/changePassword', verifyLogin.userSession, controller.postChangePasswod);
router.get('/addAddress', verifyLogin.userSession, controller.getaddAddress);
router.post('/addAddress', verifyLogin.userSession, controller.postaddAddress);
router.get('/editAddress/:id', verifyLogin.userSession, controller.getEditAddress);
router.post('/editAddress/:id', verifyLogin.userSession, controller.postEditAddress);
router.get('/deleteAddress/:id', verifyLogin.userSession, controller.getDeleteAddress);
router.post('/orderConfirmed', verifyLogin.userSession, controller.confirmOrder);
router.get('/orderSuccess', verifyLogin.userSession, controller.orderSuccess);
router.get('/orders', verifyLogin.userSession, controller.getOrders);
router.post('/verifyPayment', verifyLogin.userSession, controller.verifyPayment);
router.get('/paymentFail', verifyLogin.userSession, controller.paymentFailure);
router.post('/store', controller.search);
// router.post("/search",verifyLogin.userSession,controller.Search)
router.get('/forgotpassword',controller.forgotPassword)
router.post('/forgotpassword',controller.postforgotPassword)
router.post('/resetpassotp',controller.postotpsignup)
router.post('/newpassword',controller.postNewPassword)

module.exports = router;   

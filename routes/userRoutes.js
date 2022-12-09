const express = require('express');

const router = express.Router();
const controller = require('../controllers/userControl');

router.get('/login', controller.loginRender);
router.post('/login', controller.loginPost);
router.get('/logout', controller.logout);
router.get('/signup', controller.signupRender);
router.post('/signup', controller.signupPost);
router.get('/home', controller.userHomeRender);
// router.get('/productDetail/:id', controller.getProductDetail);
// router.get('/otp-login', userController.getPhoneNumber)
// router.post('/otp-login', userController.generateOtp) // posts phone Number for OTP
// router.post('/verify-otp', userController.verifyOtp)

module.exports = router;   

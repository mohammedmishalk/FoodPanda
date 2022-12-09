/* eslint-disable no-console */
const Users = require("../models/signupModel");
// const Categories = require('../models/categories');
const twilio = require('twilio')

const Products = require("../models/products");
const nodemailer = require("nodemailer");
const MY_OTP_SENDER = require("../models/sendOTP");
const OTP_LOGIN_MODEL = require("../models/otpSing");

let message = "";

const loginRender = (req, res) => {
  res.render("user/login", { message });
  message = "";
};

const loginPost = async (req, res) => {
  try {
    await Users.findOne({ email: req.body.email }).then((result) => {
      if (result) {
        if (result.isBlock === false) {
          console.log(result.isBlock);
          if (result.password === req.body.password) {
            // console.log(result.password);
            const { session } = req;
            session.accountType = "user";
            session.userid = result.email;
            res.redirect("/user/home");
          } else {
            message = "wrong password";
            res.render("user/login", { message });
          }
        } else {
          message = "You are blocked";
          res.render("user/login", { message });
        }
      } else {
        message = "Register to continue";
        res.render("user/login", { message });
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

const userHomeRender = async (req, res) => {
  const { session } = req;
  // const categories = await Categories.find();
  const products = await Products.find();
  // console.log(session.userid);
  if (session.userid && session.accountType === "user") {
    // console.log(session.userid);
    const customer = true;
    res.render("user/userhome", { customer, products });
  } else {
    const customer = false;
    res.render("user/userHome", { customer, products });
  }
};

const logout = (req, res) => {
  const { session } = req;
  session.destroy();
  // console.log('logout');
  res.redirect("/");
};

const signupRender = (req, res) => {
  res.render("user/usersignup", { message });
  message = "";
};

const signupPost = (req, res) => {
  let firstname = req.body.firstName;
  let email = req.body.email;
  let phone = Number(req.body.phoneNumber);
  let password = req.body.password;
  Users.findOne({ email }).then((result) => {
    if (result) {
      message = "Email is already registered";
      res.redirect("/user/signup");
    } else if (password) {
      const user = new Users({
        full_name: firstname,
        email: email,
        phone: phone,
        password: password,
        account_type: "user",
      });
      user.save().then((results) => {
        console.log(results);
        message = "Successfully Registered";
        res.render("user/successfull");
        message = "";
      });
    } else {
      message = "passwords do not match ";
      res.redirect("/user/signup");
    }
  });
};


// getPhoneNumber= (req, res) => {
//   res.render("user/otp", { cartItemsCount: 0 });
// },


// generateOtp= async (req, res) => {
//   console.log(typeof req.body.phone);

//   try {
//     const userExist = await checkPhoneNumber(req.body.phone); // check phone Number exists on database

//     // Generates random code if user Exists
//     const randomCode = (function getRandomCode() {
//       if (!userExist) {
//         console.log("user does not exist on database");
//         res.render("user/otp", { cartItemsCount: 0 });
//         return false;
//       } else {
//         console.log("user exists");

//         // Generates Random 4 digit Code
//         return (() => {
//           return Math.floor(1000 + Math.random() * 9000);
//         })();
//       }
//     })();
//     if (randomCode != false) {
//       await OTP_LOGIN_MODEL.findOneAndUpdate(
//         { phone: req.body.phone },
//         { code: randomCode },
//         {
//           new: true,
//           upsert: true,
//         }
//       );
//       const USER_PHONE_NUMBER = `+91` + req.body.phone;
//       console.log(USER_PHONE_NUMBER);

//       MY_OTP_SENDER(randomCode, USER_PHONE_NUMBER); // Sends email to user

//       res.render("user/optVerf", { data: req.body.phone, cartItemsCount: 0 }); // Renders page to verify OTP
//     }
//   } catch (error) {
//     console.log(error);
//   }
// },
// verifyOtp= async (req, res) => {
//   try {
//     console.log(req.body.phone);
//     console.log(req.body.otp);
//     const userCodeObj = await OTP_LOGIN_MODEL.findOne({
//       phone: req.body.phone,
//     });

//     const userDoc = await USER_MODEL.findOne({ phone: req.body.phone });

//     console.log("code from db Is:" + userCodeObj.code);
//     if (req.body.otp == userCodeObj.code) {
//       if (userCodeObj.blockStatus == true) {
//         res.render("user/login", { msg: "You were blocked by Admin", cartItemsCount: 0 });
//       } else {
//         req.session.user = userDoc._id;
//         res.redirect("/");
//       }
//     } else {
//       console.log("otp is Invalid");
//       res.redirect("/login");
//     }
//   } catch (error) { }
// },
// const getProductDetail = async (req, res) => {
//   try {
//     const { session } = req;
//     const { id } = req.params;
//     console.log(id);
//     const products = await Products.findOne({ _id: id });
//     console.log(products);
//     if (session.userid && session.accountType === 'user') {
//       console.log(session.userid);
//       const customer = true;
//       res.render('user/productDetail', { customer, products });
//     } else {
//       const customer = false;
//       res.render('user/productDetail', { customer, products });
//     }
//   } catch (error) {
//     console.log(error.message);
//   }
// };

module.exports = {
  loginRender,
  loginPost,
  logout,
  userHomeRender,
  signupPost,
  signupRender,
  // getPhoneNumber,
  // generateOtp,
  // verifyOtp,

  // getProductDetail,
};

/* eslint-disable no-console */
const Users = require("../models/signupModel");
// const Categories = require('../models/categories');
const bcrypt = require("bcryptjs");
const sessions = require('express-session');
var Cart =require('../models/cart');
const Orders = require('../models/orders');
const Products = require("../models/products");
const nodemailer = require("nodemailer");

let message = "";
var email;

var mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mishalnunu@gmail.com",
    pass: "wkmumdvuozkdtbbq",
  },
});
const OTP = `${Math.floor(1000 + Math.random() * 9000)}`;

const loginRender = (req, res) => {
  res.render("user/login", { message });
  message = "";
};

const loginPost = async (req, res) => {
  try {
   

    const email = req.body.email;
    const password = req.body.password;

    const user = await Users.findOne({ email: email }).then(async (userData) => {
      if (userData) {
        const passwordMatch = await bcrypt.compare(password, userData.password);

        if (passwordMatch) {
          // req.sessions.user_id = userData._id;

          if (userData.isBlock === false) {
            console.log(userData.isBlock);
            if (passwordMatch) {
              sessions.accountType = "user";
              sessions.userid = userData.email;
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


const userfood = async (req, res) => {
  const { session } = req;
  // const categories = await Categories.find();
  const products = await Products.find();
  // console.log(session.userid);
  if (session.userid && session.accountType === "user") {
    // console.log(session.userid);
    const customer = true;
    res.render("user/foodview", { customer, products });
  } else {
    const customer = false;
    res.render("user/foodview", { customer, products });
  }
};

const logout = (req, res) => {
  const { session } = req;
  session.destroy();
  // console.log('logout');
  res.redirect("/");
};

const signupRender = (req, res) => {
  try {
    res.render("user/usersignup", { message });
    message = "";
  } catch (error) {
    console.log(error);
  }
};

const signupPost = async (req, res) => {
  firstname = req.body.firstName;
  email = req.body.email;
  phone = Number(req.body.phoneNumber);
  password = req.body.password;
  let mailDetails = {
    from: "mishalnunu@gmail.com",
    to: email,
    subject: "FOODPANDA ACCOUNT REGISTRATION",
    html: `<p>YOUR OTP FOR REGISTERING IN FOODPANDA IS ${OTP}</p>`,
  };

  const user = await Users.findOne({ email: email });
  if (user) {
    res.render("user/usersignup", { message: "Already Registered" });
  } else {
    mailTransporter.sendMail(mailDetails, function (err, data) {
      if (err) {
        console.log("Error Occurs,,,,");
      } else {
        console.log("Email Sent Successfully");
        res.redirect("/user/otp");
      }
    });
  }
};

const GetOtp = async (req, res) => {
  try {
    res.render("user/otp");
  } catch (error) {
    console.log(error.message);
  }
};

const PostOtp = async (req, res) => {
  let otp = req.body.otp;

  console.log(otp);
  console.log(OTP);
  if (OTP == otp) {
    // let password
    const hash = await bcrypt.hash(password, 10);
    const user = new Users({
      full_name: firstname,
      email: email,
      phone: phone,
      password: hash,
      account_type: "user",
    });

    user.save().then(() => {
      req.session.user_id = Users._id;
      res.render("user/successfull");
    });
  } else {
    console.log("otp error");
    res.redirect("/otp");
  }
};


 const cart=(req, res, next)=> {
  if(!req.session.cart){
      return res.render('user/cart', {products: null});
  }
  var cart = new Cart(req.session.cart);
  res.render('user/cart', {products: cart.generateArray(), totalPrice: cart.totalPrice});
  
}

addCart= (req,res,next)=> {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  Products.findById(productId, function (err, product) {
      if(err){
          return res.redirect('/user/food');
      }

      cart.add(product, product.id);
      req.session.cart = cart;
      console.log(req.session.cart);
      res.redirect('/user/food');

  });
}

/*AddbyOne*/
add= (req,res,next)=> {

  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.addByOne(productId);
  req.session.cart=cart;
  res.redirect('/user/cart');

}

reduce= (req,res,next)=> {

  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.reduceByOne(productId);
  req.session.cart=cart;
  res.redirect('/user/cart');
}


remove= (req,res,next) =>{

  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.removeAll(productId);
  req.session.cart=cart;
  res.redirect('/user/cart');
}





module.exports = {
  loginRender,
  loginPost,
  logout,
  userHomeRender,
  userfood,
  signupPost,
  signupRender,
  GetOtp,
  PostOtp,
  cart,
  addCart,
  add,
  reduce,
  remove,
};

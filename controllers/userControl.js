const mongoose = require('mongoose');
const Users = require("../models/signupModel");
const Categories = require('../models/categories');
const bcrypt = require("bcryptjs");
const Address = require('../models/address');
const Orders = require('../models/orders');
const Carts = require('../models/carts');
const nodemailer = require("nodemailer");
const Products = require("../models/products");
const moment = require('moment');
const crypto = require('crypto');
const instance = require('../middleware/razorpay');


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
  const session = req.session;
  const customer = false;
  if (session.userid) {
    res.redirect('/user/home');
  }
  res.render('user/login', { message, customer });
  message = '';
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
              const { session } = req;
              session.account_type = "user";
              session.userid = userData._id;
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
    let count = 0;
  
    const products = await Products.find().limit(1);
    const discounts = await Products.find({ discount: true });
    if (session.userid && session.account_type === 'user') {
      const userData = await Users.findOne({ _id: session.userid });
      const cart = await Carts.find({ userId: userData._id });
      if (cart.length) {
        count = cart[0].product.length;
      }
      const customer = true;
      res.render('user/userhome', { customer, products, count, discounts });
    } else {
      const customer = false;
      res.render('user/userhome', { customer, products, count, discounts });
    }
  };
  
  const getProductDetail = async (req, res) => {
    try {
      const { session } = req;
      const { id } = req.params;
      const products = await Products.find();
  
      if (session.userid && session.account_type === 'user') {
        let count = 0;
        const userData = await Users.findOne({ _id: session.userid });
        const cart = await Carts.find({ userId: userData._id });
  
        const customer = true;
        if (cart.length) {
          count = cart[0].product.length;
        } else {
          count = 0;
        }
        res.render('user/foodview', { customer, products, count, session });
      } else {
        const count = null;
        const customer = false;
        res.render('user/foodview', { customer, products, count, session });
      }
    } catch (error) {
      console.log(error.message);
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

const signupPost = async (req,res) => {
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
    console.log(error.message);tS
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




const getCart = async (req, res) => {
  const { session } = req;
  const userData = mongoose.Types.ObjectId(session.userid);
  const customer = true;
  const cart = await Carts.aggregate([
    {
      $match: { userId: userData },
    },
    {
      $unwind: '$product',
    },
    {
      $project: {
        productItem: '$product.productId',
        productQuantity: '$product.quantity',
      },
    },
    {
      $lookup: {
        from: 'products',
        localField: 'productItem',
        foreignField: '_id',
        as: 'productDetail',
      },
    },
    {
      $project: {
        productItem: 1,
        productQuantity: 1,
        productDetail: { $arrayElemAt: ['$productDetail', 0] },
      },
    },
    {
      $addFields: {
        productPrice: {
          $sum: { $multiply: ['$productQuantity', '$productDetail.price'] },
        },
      },
    },
  ]);

  const sum = cart.reduce((accumulator, object) => accumulator + object.productPrice, 0);
  const count = cart.length;
  res.render('user/cart', { session, customer, cart, count, sum });
};

const getAddToCart = async (req, res) => {
  const id = req.params.id;
  const userId = req.session.userid;
  const products = await Products.findOne({ _id: id });
  const userData = await Users.findOne({ _id: userId });
  const objId = mongoose.Types.ObjectId(id);

  // const idUser = mongoose.Types.ObjectId(userData._id);
  const proObj = {
    productId: objId,
    quantity: 1,
  };
  if (products.stock >= 1) {

    
    const userCart = await Carts.findOne({ userId: userData._id });
    if (userCart) {
      const proExist = userCart.product.findIndex((product) => product.productId == id);
      if (proExist !== -1) {
        await Carts.aggregate([
          {
            $unwind: '$product',
          },
        ]);
        await Carts.updateOne(
          { userId: userData._id, 'product.productId': objId },
          { $inc: { 'product.$.quantity': 1 } },
        );
        res.redirect(`/user/productDetail/${id}`);
      } else {
        Carts
          .updateOne({ userId: userData._id }, { $push: { product: proObj } })
          .then(() => {
            res.redirect(`/user/productDetail/${id}`);
          });
      }
    } else {
      const newCart = new Carts({
        userId: userData._id,
        product: [
          {
            productId: objId,
            quantity: 1,
          },
        ],
      });
      newCart.save().then(() => {
        // res.json({ status: true });
      });
    }
  } else {
    res.json({ stock: true });
  }
};

const cartQuantity = async (req, res, next) => {
  const data = req.body;
  data.count = Number(data.count);
  data.quantity = Number(data.quantity);
  const objId = mongoose.Types.ObjectId(data.product);
  const productDetail = await Products.findOne({ _id: data.product });
  if (
    (data.count == -1 && data.quantity == 1)
    || (data.count == 1 && data.quantity == productDetail.stock)
  ) {
    res.json({ quantity: true });
  } else {
    await Carts
      .aggregate([
        {
          $unwind: '$product',
        },
      ])
      .then(() => {
        Carts
          .updateOne(
            { _id: data.cart, 'product.productId': objId },
            { $inc: { 'product.$.quantity': data.count } },
          )
          .then(() => {
            res.json({ status: true });
            next();
          });
      });
  }
};

const postDeleteProduct = (req, res) => {
  const cartid = req.body.cart;
  const pid = req.body.product;
  Carts.updateOne(
    { _id: cartid },
    { $pull: { product: { productId: pid } } },
  ).then(() => {
    // console.log(cart);
    res.redirect('/user/cart');
  }).catch((error) => {
    console.log(error);
  });
};

const getCheckout = async (req, res) => {
  const { session } = req;
  const uid = mongoose.Types.ObjectId(session.userid);
  const customer = true;
  const cart = await Carts.aggregate([
    {
      $match: { userId: uid },
    },
    {
      $unwind: '$product',
    },
    {
      $project: {
        productItem: '$product.productId',
        productQuantity: '$product.quantity',
      },
    },
    {
      $lookup: {
        from: 'products',
        localField: 'productItem',
        foreignField: '_id',
        as: 'productDetail',
      },
    },
    {
      $project: {
        productItem: 1,
        productQuantity: 1,
        productDetail: { $arrayElemAt: ['$productDetail', 0] },
      },
    },
    {
      $addFields: {
        productPrice: {
          $sum: { $multiply: ['$productQuantity', '$productDetail.price'] },
        },
      },
    },
  ]);

  const sum = cart.reduce((accumulator, object) => accumulator + object.productPrice, 0);
  const count = cart.length;
  Address.find({ user_id: uid }).then((address) => {
    res.render('user/checkout', {
      allData: cart, count, sum, name: req.session.firstName, address, customer,
    });
  }).catch((e) => {
    console.log(e);
  });
};

const getProfile = async (req, res) => {
  const { session } = req;
  let count = 0;
  const userid = session.userid;
  if (session.userid && session.account_type === 'user') {
    const customer = true;
    await Carts.findOne({ user_id: req.session.userID }).then((doc) => {
      if (doc) {
        count = doc.product.length;
      }
    });
    await Users.findOne({ user_id: userid }).then((userdoc) => {
      Address.find({ user_id: userid }).then((address) => {
        res.render('user/profile', { user: userdoc, address, customer, count });
      }).catch(() => {
        res.redirect('/404');
      });
    }).catch(() => {
      res.redirect('/404');
    });
  } else {
    res.redirect('/login');
  }
};


const getChangePassword = (req, res) => {
  res.render('user/changePassword', { message: '' });
};

const postChangePasswod =async (req, res) => {
  try {
    const uid = req.session.userid;
    const { currentPassword, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    Users.findOne({ user_id: uid }).then(async (result) => {
      const passwordMatch = await bcrypt.compare(currentPassword, result.password);
      // console.log(result)
      if (passwordMatch) {
        if (password === currentPassword) {
          res.render('user/changePassword', { message: 'old password and new pasword is same' });
        } else {
          Users.findOneAndUpdate({ user_id: uid }, { hash }).then(() => {
            res.redirect('/user/profile');
          }).catch(() => {
            res.redirect('/404');
          });
        }
      } else {
        res.render('user/changePassword', { message: 'Current password do not match' });
      }
    }).catch(() => {
      res.redirect('/404');
    });
  } catch (error) {
    res.redirect('/404');
  }
};

const getaddAddress = (req, res) => {
  const { session } = req;
  if (session.userid && session.account_type === 'user') {
    res.render('user/addAddress');
  } else {
    res.redirect('/user/login');
  }
};

const postaddAddress = async (req, res) => {
  const uid = req.session.userid;
  // const { addressDetail } = Address;
  const addressDetails = await new Address({
    // eslint-disable-next-line no-underscore-dangle
    user_id: uid,
    address: req.body.address,
    city: req.body.city,
    district: req.body.district,
    state: req.body.state,
    pincode: req.body.pincode,
  });
  await addressDetails.save().then((results) => {
    if (results) {
      res.redirect('/user/checkout');
    } else {
      res.json({ status: false });
    }
  });
};

const getEditAddress = (req, res) => {
  try {
    const aid = req.params.id;

    Address.findOne({ _id: aid }).then((doc) => {
      res.render('user/editAddress', { doc });
    }).catch(() => {
      res.redirect('/user/profile');
    });
  } catch (error) {
    res.redirect('/user/profile');
  }
};

const postEditAddress = (req, res) => {
  try {
    const aid = req.params.id;
    const {
      address,
      state,
      city,
      pincode,
    } = req.body;
    Address.updateOne(
      { _id: aid },
      {
        address, state, city, pincode,
      },
    ).then(() => {
      res.redirect('/user/profile');
    }).catch(() => {
      res.redirect('/404');
    });
  } catch (error) {
    res.redirect('/404');
  }
};

const getDeleteAddress = (req, res) => {
  try {
    const { id } = req.params;
    Address.findByIdAndDelete({ _id: id }).then(() => {
      res.redirect('/user/profile');
    }).catch(() => {
      res.redirect('/404');
    });
  } catch (error) {
    res.redirect('/404');
  }
};

const confirmOrder = (req, res) => {
  const uid = mongoose.Types.ObjectId(req.session.userid);
  const paymethod = req.body.pay;
  const adrs = req.body.address;
  Users.findOne({ user_id: uid }).then((userData) => {
    Carts.aggregate([
      {
        $match: { userId: uid },
      },
      {
        $unwind: '$product',
      },
      {
        $project: {
          productItem: '$product.productId',
          productQuantity: '$product.quantity',
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: 'productItem',
          foreignField: '_id',
          as: 'productDetail',
        },
      },
      {
        $project: {
          productItem: 1,
          productQuantity: 1,
          productDetail: { $arrayElemAt: ['$productDetail', 0] },
        },
      },
      {
        $addFields: {
          productPrice: {
            $sum: { $multiply: ['$productQuantity', '$productDetail.price'] },
          },
        },
      },
    ])
      .then((result) => {
      
        for (let i = 0; i < result.length; i++) {
          const sold = result[i].productDetail.soldCount + result[i].productQuantity;
          console.log('total sold =', sold);
          Products.updateMany(
           
            { _id: result[i].productDetail._id },
            { soldCount: sold },
          ).then(() => {
          }).catch((err) => {
            console.log(err);
          });
        }
        // const count = result.length;
        const sum = result
          .reduce((accumulator, object) => accumulator + object.productPrice, 0);
        Carts.findOne({ userId: uid }).then((cartData) => {
          const order = new Orders({
            order_id: Date.now(),
            user_id: uid,
            address: adrs,
            order_placed_on: moment().format('DD-MM-YYYY'),
            products: cartData.product,
            totalAmount: sum,
            finalAmount: Math.round(sum + (sum * 0.15) + 100),
            paymentMethod: paymethod,
            expectedDelivery: moment().add(4, 'days').format('MMM Do YY'),
          });
       
          order.save().then((done) => {
          
            const oid = done._id;
            Carts.deleteOne({ user_id: uid }).then(() => {
              if (paymethod === 'cod') {
                console.log('payment is cod');
                res.json([{ success: true, oid }]);
              } else if (paymethod === 'online') {
                console.log('payment is online');
                // const amount = done.totalAmount * 100;
                const amount = done.finalAmount * 100;
                const options = {
                  amount,
                  
                  currency: 'INR',
                  receipt: `${oid}`,
                };
                instance.orders.create(options, (err, orders) => {
                  if (err) {
                    console.log(err);
                  } else {
                    res.json([{ success: false, orders }]);
                    // console.log(orders);
                  }
                });
              }
            });
          });
        });
      });
  });
};

const orderSuccess = (req, res) => {
  const customer = true;
  console.log(req.params);
  const oid = mongoose.Types.ObjectId(req.params.oid);
  Orders.aggregate([
    { $match: { _id: oid } },
    {
      $lookup: {
        from: 'logins',
        localField: 'user_id',
        foreignField: 'user_id',
        as: 'user',
      },
    },
    {
      $lookup: {
        from: 'addresses',
        localField: 'address',
        foreignField: '_id',
        as: 'address',
      },
    },
  ]).then((result) => {
    console.log(result);
    res.render('user/orderSuccess', {
      customer,
    });
  });
};

const getOrders = async (req, res) => {
  try {
    const customer = true;
    const name = req.session.firstName;
    const uid = req.session.userid;
    await Orders.aggregate([
      {
        $match: { user_id: uid },
      },
      {
        $unwind: '$products',
      },
      {
        $project: {
          productItem: '$products.productId',
          productQuantity: '$products.quantity',
          order_id: 1,
          address: 1,
          expectedDelivery: 1,
          finalAmount: 1,
          paymentMethod: 1,
          paymentStatus: 1,
          orderStatus: 1,
          createdAt: 1,
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: 'productItem',
          foreignField: '_id',
          as: 'productDetail',
        },
      },
      {
        $unwind: '$productDetail',
      },
      {
        $addFields: {
          productPrice: {
            $sum: { $multiply: ['$productQuantity', '$productDetail.price'] },
          },
        },
      },
    ]).then((result) => {
      // eslint-disable-next-line no-underscore-dangle
      Orders.find({ user_id: uid }).then((doc) => {
        res.render('user/orders', {
          name, customer, count: 0, productData: result, allData: doc, items: 0,
        });
      });
    }).catch(() => {
      res.redirect('/500');
    });
  } catch (error) {
    res.redirect('/500');
  }
};

const verifyPayment = (req, res) => {
  console.log('reached verify paymet');
  const details = req.body;
  let hmac = crypto.createHmac('sha256', 'jSUYpUYNfZItVjdH0mvj4nnl');
  hmac.update(
   
    details.payment.razorpay_order_id +
   
    '|' +
    
    details.payment.razorpay_payment_id
  );
  hmac = hmac.digest('hex');
 
  console.log(`${details.payment.razorpay_signature}signatuer`);
  if (hmac == details.payment.razorpay_signature) {
    const objId = mongoose.Types.ObjectId(details.order.receipt);
    console.log('objId');
    Orders
      .updateOne({ _id: objId }, { $set: { paymentStatus: 'Paid' } })
      .then(() => {
        res.json({ success: true, oid: details.order.receipt });
      })
      .catch((err) => {
        console.log(err);
        res.json({ status: false, err_message: 'payment failed' });
      });
  } else {
    res.json({ status: false, err_message: 'payment failed' });
  }
};

const paymentFailure = (req, res) => {
  const details = req.body;
  console.log(details);
  res.send('payment failed');
};


forgotPassword= (req, res) => {
  try {
    user = req.session.userid;
    if (user) {
      res.redirect("/user/login");
    } else {
      res.render("user/forgotpassword");
    }
  } catch (error) {
    res.render("user/404");
  }
},

postforgotPassword= async (req, res) => {
  
    let Data = req.body.email;

    let userData = await Users.findOne({ email: Data });
    let mailDetails = {
      from: "mishalnunu@gmail.com",
      to: Data,
      subject: "food panda ACCOUNT VERIFICATION",
      html: `<p>YOUR OTP FOR RESET PASSWORD IS <h1> ${OTP} <h1> </p>`,
    };
    mailTransporter.sendMail(mailDetails,function (err, data) {
      if (err) {
        console.log("error occurs");
      } else {
        console.log("Email Sent Successfully");
        res.render("user/resetpassotp", { Data });
      }
    });
  } 


postotpsignup= async (req, res) => {
  let data = req.body.details;

  try {
    let otp = req.body.otp;
    if (OTP == otp) {
      console.log("matchedd");
      res.render("user/resetpassword", { data });
    } else {
      console.log("error");
    }
  } catch (error) {
    res.render("404");
  }
},

postNewPassword= async (req, res) => {
  try {
    const data = req.body;
    if (data.password && data.confirmpassword) {
      if (data.confirmpassword) {
        let newPassword = await bcrypt.hash(data.password, 10);

        Users.updateOne(
          { email: data.email },
          {
            $set: {
              password: newPassword,
            },
          }
        ).then((data) => {
          console.log(data);
          res.redirect("/user/login");
        });
      }
    }
  } catch (error) {
    res.render("404");
  }
}

const search = async (req, res) => {
  const { session } = req;
  try {
    let customer;
    const pageNum = req.query.page;
    const perPage = 6;
    let count = 0;
    const searchvalue = req.body.searchinput;
    const text = 'Results for your search: ';
    const docCount = await Products.find({
      $and: [
        { difference: { $gt: 0 } },
        { difference: { $subtract: ['$stock', 'soldCount'] } },
        { item_name: new RegExp(searchvalue, 'i') },
      ],
    })
      .countDocuments();

    Products.find({
      $and: [
        { isBlock: false },
        { difference: { $subtract: ['$stock', 'soldCount'] } },
        { $gt: 0 },
        { item_name: new RegExp(searchvalue, 'i') },
      ],
    })
      .skip((pageNum - 1) * perPage)
      .limit(perPage)
      .then((products) => {
        Carts.findOne({ user_id: req.session.userID }).then((doc) => {
          if (doc) {
            count = doc.product.length;
          }
          if (session.userid && session.account_type === 'user') {
            customer = true;
            res.render('user/foodview', { page: '/', docCount, pageNum, pages: Math.ceil(docCount / perPage), customer, products, count, searchvalue, text ,session});
          } else {
            customer = false;
            res.render('user/foodview', { page: '/', docCount, pageNum, pages: Math.ceil(docCount / perPage), customer, products, count, searchvalue, text,session });
          }
        });
      })
      .catch(() => {
        res.redirect('/500');
      });
  } catch (error) {
    res.redirect('/500');
  }
};

module.exports = {
  loginRender,
  loginPost,
  logout,
  userHomeRender,
  getProductDetail,
  signupPost,
  signupRender,
  GetOtp,
  PostOtp,
  cartQuantity,
  postDeleteProduct,
  getCart,
  getAddToCart,
  getCheckout,
  getProfile,
  getChangePassword,
  postChangePasswod,
  getaddAddress,
  postaddAddress,
  getEditAddress,
  postEditAddress,
  getDeleteAddress,
  confirmOrder,
  orderSuccess,
  getOrders,
  verifyPayment,
  paymentFailure,
  forgotPassword,
  postforgotPassword,
  postotpsignup,
  postNewPassword,
  search
  
 
 
};

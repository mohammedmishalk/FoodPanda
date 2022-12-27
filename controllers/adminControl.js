const moment = require('moment');
const Users = require('../models/signupModel');
const Categories = require('../models/categories');
const Products = require('../models/products');
const Orders = require('../models/orders');
const Coupons = require('../models/coupon');


require('dotenv/config');


let message = '';





const adminHomeRender = (req, res) => {
  const { session } = req;
  if (session.userid && session.account_type === 'admin') {
    res.render('admin/adminHome');
  } else {
    res.redirect('/admin/login');
  }
};

const adminLoginRender = (req, res) => {
  const { session } = req;
  if (session.userid && session.account_type === 'admin') {
    res.redirect('/admin/home');
  } else {
    res.render('admin/login', { message });
    message = '';
  }
};

const admin = "admin@gmail.com";
const mypassword = "123";
const adminLoginPost = (req, res) => {
  if (req.body.email == admin && req.body.password == mypassword) {
    const { session } = req;
    session.userid = admin;
    session.account_type = 'admin';
    res.redirect('/admin/home');
  } else {
    message = 'Invalid email or password';
    res.render('admin/login', { message });
  }
};


const adminUsersRender = async (req, res) => {
  const { session } = req;
  if (session.userid && session.account_type === 'admin') {
    const usersData = await Users.find();
    res.render('admin/adminUserView', { users: usersData });
  } else {
    res.redirect('/admin/login');
  }
};



const admin_edit_user = (req, res) => {
  const session = req.session;
  if (session.userid && session.account_type == "admin") {
    const finding = Users.find({ _id: req.params.id })
      .then((result) => {
        const data = result;
        res.render("admin/editUser", { data });
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    res.redirect("/");
  }
};

const edit_post = (req, res) => {
  console.log(req.body);
  const update = Users.findOneAndUpdate(
    { _id: req.params.id },
    {
        full_name: req.body.firstName,
       email: req.body.email,
      phone: req.body.phoneNumber,
     
    }
  )
    .then((result) => {
      console.log(result);
      message = "User data updated";
      res.redirect("/admin/users");
    })
    .catch((err) => {
      console.log(err);
    });
};


const blockUser = async (req, res) => {
  try {
    await Users.updateOne({ _id: req.params.id }, { $set: { isBlock: true } }).then(() => {
      res.redirect('/admin/users');
    });
  } catch (error) {
    console.log(error.message);
  }
};

const unblockUser = async (req, res) => {
  try {
    await Users.updateOne({ _id: req.params.id }, { $set: { isBlock: false } }).then(() => {
      res.redirect('/admin/users');
    });
  } catch (error) {
    console.log(error.message);
  }
};

const logout = (req, res) => {
  const { session } = req;
  session.destroy();
  console.log('logout');
  res.redirect('/user/login');
};

const getAdminCategory = async (req, res) => {
  const { session } = req;
  if (session.userid && session.account_type === 'admin') {
    try {
      const categories = await Categories.find();
      res.render('admin/category', { categories });
    } catch (error) {
      console.log(error.message);
    }
  }
};



const getAddCategory = (req, res) => {
  const { session } = req;
  if (session.userid && session.account_type === 'admin') {
    res.render('admin/addCategory');
  } else {
    res.redirect('/admin/login');
  }
};

const postAddCategory = async (req, res) => {
  
  try {
   console.log(req.body)
    const categories = new Categories({
      name: req.body.cat,
      description: req.body.des,
     
    });
    const Data = await categories.save();
    if (Data){
      res.redirect('/admin/adminCategory');
    } else {
      res.render('admin/addCategory');
    }
  } catch (error) {
    console.log(error.message);
  }
};
  
  
  
 

const getEditCategory = async (req, res) => {
  const { session } = req;
  if (session.userid && session.account_type === 'admin') {
    const { id } = req.params;
    console.log(id);
    const categories = await Categories.findOne({ _id: id });
    res.render('admin/editCategory', { categoriesData: categories });
  } else {
    res.redirect('/admin/login');
  }
};

const postEditCategory = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(req.params.id);
    const categoriesData = await Categories.updateOne({ _id: id }, {
      name: req.body.cat,
      description: req.body.des,
    });
    if (categoriesData) {
      res.redirect('/admin/adminCategory');
    } else {
      res.render('admin/editCategory');
    }
  } catch (error) {
    console.log(error.message);
  }
};

const getDeleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    await Categories.deleteOne({ _id: id }).then(() => {
      res.redirect('/admin/adminCategory');
    });
  } catch (error) {
    console.log(error.message);
  }
};

const getAdminProducts = async (req, res) => {
  const { session } = req;
  if (session.userid && session.account_type === 'admin') {
    const productsData = await Products.find();
    res.render('admin/adminProductView', { products: productsData });
  } else {
    res.redirect('/admin/login');
  }
};

const getAddProduct = async (req, res) => {
  const { session } = req;
  if (session.userid && session.account_type === 'admin') {
    const categories = await Categories.find();
    // console.log(categories);
    res.render('admin/adminAddProduct', { categories });
  } else {
    res.redirect('/admin/login');
  }
};

const postAddProduct = async (req, res) => {
  try {
    const IMAGE_PATH = (req.file.path).slice(7)


    const products = new Products({
      item_name : req.body.item_name,
      des : req.body.des,
      price: req.body.price,
      category: req.body.cat,
      stock:req.body.qty,
      soldCount: 10,

      image:IMAGE_PATH,
     
    });
    const productsData = await products.save();
    if (productsData){
      res.redirect('/admin/products');
    } else {
      res.render('admin/addProduct');
    }
  } catch (error) {
    console.log(error.message);
  }
};




const getEditProduct = (req, res) => {
  const session = req.session;
  if (session.userid && session.account_type == "admin") {
    const finding = Products.find({ _id: req.params.id })
      .then((result) => {
        const data = result;
        res.render("admin/editProduct", { data });
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    res.redirect("/");
  }
};

const postEditProduct = (req, res) => {
  console.log(req.body);
  const update = Products.findOneAndUpdate(
    { _id: req.params.id },
    {
      item_name : req.body.item_name,
      des : req.body.des,
      price: req.body.price,
      category: req.body.cat,
     
    }
  )
    .then((result) => {
      console.log(result);
      message = "product data updated";
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
    });
};




const getDeleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    await Products.deleteOne({ _id: id }).then(() => {
      res.redirect('/admin/products');
    });
  } catch (error) {
    console.log(error.message);
  }
};



const getOrders = (req, res) => {
  try {
    Orders.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'products.productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      {
        $lookup: {
          from: 'logins',
          localField: 'user_id',
          foreignField: '_id',
          as: 'userfields',
        },
      },
      {
        $lookup: {
          from: 'addresses',
          localField: 'address',
          foreignField: '_id',
          as: 'userAddress',
        },
      },
      {
        $unwind: '$userfields',
      },
    ]).then((result) => {
      console.log(result);
      res.render('admin/orders', { allData: result });
    });
  } catch (error) {
    res.redirect('/500');
  }
};


const changeOrderStatus = (req, res) => {
  try {
    const { orderID, paymentStatus, orderStatus } = req.body;
    Orders.updateOne(
      { _id: orderID },
      {
        paymentStatus, orderStatus,
      },
    ).then(() => {
      res.send('success');
    }).catch(() => {
      res.redirect('/500');
    });
  } catch (error) {
    res.redirect('/500');
  }
};

const orderCompeleted = (req, res) => {
  try {
    const { orderID } = req.body;
    Orders.updateOne(
      { _id: orderID },
      { orderStatus: 'Completed' },
    ).then(() => {
      res.send('done');
    });
  } catch (error) {
    res.redirect('/500');
  }
};

const orderCancel = (req, res) => {
  try {
    const { orderID } = req.body;
    Orders.updateOne(
      { _id: orderID },
      { orderStatus: 'Cancelled', paymentStatus: 'Cancelled' },
    ).then(() => {
      res.send('done');
    });
  } catch (error) {
    res.redirect('/500');
  }
};


const getSalesReport = async (req, res) => {
  try {
      const today = moment().startOf('day');
      const endtoday = moment().endOf('day');
      const monthstart = moment().startOf('month');
      const monthend = moment().endOf('month');
      const yearstart = moment().startOf('year');
      const yearend = moment().endOf('year');
      // const today = moment('09-12-2022', 'DD-MM-YYYY').startOf('day');
      // const endtoday = moment('10-12-2022', 'DD-MM-YYYY').endOf('day');
      const daliyReport = await model.Order.aggregate([
          {
              $match: {
                  createdAt: {
                      $gte: today.toDate(),
                      $lte: endtoday.toDate(),
                  },
              },
          },
          {
              $lookup:
              {
                  from: 'logins',
                  localField: 'user_id',
                  foreignField: 'user_id',
                  as: 'user',
              },
          },
          {
              $project: {
                  order_id: 1,
                  user: 1,
                  paymentStatus: 1,
                  totalAmount: 1,
                  orderStatus: 1,
              },
          },
      ]);
      const monthReport = await model.Order.aggregate([
          {
              $match: {
                  createdAt: {
                      $gte: monthstart.toDate(),
                      $lte: monthend.toDate(),
                  },
              },
          },
          {
              $lookup:
              {
                  from: 'logins',
                  localField: 'user_id',
                  foreignField: 'user_id',
                  as: 'user',
              },
          },
          {
              $project: {
                  order_id: 1,
                  user: 1,
                  paymentStatus: 1,
                  totalAmount: 1,
                  orderStatus: 1,
              },
          },
      ]);
      const yearReport = await model.Order.aggregate([
          {
              $match: {
                  createdAt: {
                      $gte: yearstart.toDate(),
                      $lte: yearend.toDate(),
                  },
              },
          },
          {
              $lookup:
              {
                  from: 'logins',
                  localField: 'user_id',
                  foreignField: 'user_id',
                  as: 'user',
              },
          },
          {
              $project: {
                  order_id: 1,
                  user: 1,
                  paymentStatus: 1,
                  totalAmount: 1,
                  orderStatus: 1,
              },
          },
      ]);
      res.render('admin/salesReport', { to: daliyReport, mo: monthReport, ye: yearReport });
  } catch (error) {
      res.redirect('/500');
  }
};

const salesCustomDate = async (req, res) => {
  try {
      const { startDate, endDate } = req.body;
      const start = moment(startDate, 'YYYY-MM-DD').startOf('day');
      const end = moment(endDate, 'YYYY-MM-DD').endOf('day');

      const cusReport = await model.Order.aggregate([
          {
              $match: {
                  createdAt: {
                      $gte: start.toDate(),
                      $lte: end.toDate(),
                  },
              },
          },
          {
              $lookup:
              {
                  from: 'logins',
                  localField: 'user_id',
                  foreignField: 'user_id',
                  as: 'user',
              },
          },
          {
              $project: {
                  order_id: 1,
                  user: 1,
                  paymentStatus: 1,
                  totalAmount: 1,
                  orderStatus: 1,
              },
          },
      ]);
      res.json(cusReport);
  } catch (error) {
      res.redirect('/500');
  }
};


const getCoupon = async (req, res) => {
  try {
    const coupons = await Coupons.find();
    res.render('admin/coupon', { allData: coupons });
  } catch (error) {
    res.redirect('/500');
  }
};

const getAddCoupon = (req, res) => {
  try {
    res.render('admin/addCoupon');
  } catch (error) {
    console.log(error);
    res.redirect('/500');
  }
};

const postAddCoupon = async (req, res) => {
  try {
    const { code, offer, amount } = req.body;
    const already = await Coupons.find({ coupon_code: code });
    if (already.length !== 0) {
      
      res.redirect('/admin/addCoupon');
    } else {
      // eslint-disable-next-line prefer-destructuring
      const Coupon = Coupons;
      const coupon = new Coupon({
        coupon_code: code,
        offer,
        max_amount: amount,
      });
      await coupon.save();
      res.redirect('/admin/coupon');
    }
  } catch (error) {
    res.redirect('/500');
  }
};

const getDeleteCoupon = (req, res) => {
  try {
    Coupons.findOneAndDelete({ _id: req.params.id })
      .then(() => {
        res.redirect('/admin/coupon');
      }).catch(() => {
        res.redirect('/500');
      });
  } catch (error) {
    res.redirect('/500');
  }
};



module.exports = {
  adminHomeRender,
  adminLoginRender,
  adminLoginPost,
  adminUsersRender,
  blockUser,
  unblockUser,
  admin_edit_user,
  edit_post,
  getAdminCategory,
  getAddCategory,
  postAddCategory,
  getEditCategory,
  postEditCategory,
  getDeleteCategory,
  getAdminProducts,
  getAddProduct,
  postAddProduct,
  getEditProduct,
  postEditProduct,
  getDeleteProduct,
  getOrders,
  logout,
  changeOrderStatus,
  orderCancel,
  orderCompeleted,
  getSalesReport,
  getCoupon,
  getAddCoupon,
  postAddCoupon,
  getDeleteCoupon,
  salesCustomDate,
  
};

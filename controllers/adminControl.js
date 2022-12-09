/* eslint-disable no-console */
const Users = require('../models/signupModel');
// const Categories = require('../models/categories');
const Products = require('../models/products');


var fs = require('fs');
require('dotenv/config');


const multer = require('multer')
const path = require('path')

// const storage = multer.diskStorage({
//      destination: (req, file,callback)=>{
//           callback(null, './public/images')
//      },
//      filename: (req, file, callback)=>{
//           console.log(file)
//           callback(null, Date.now()+ path.extname(file.originalname))
//      }
// })

// upload.single("image")
// puton data enctype="multipart/form=data"   
// tyoe file name image
// const upload = multer({storage: storage})


let message = '';

const adminHomeRender = (req, res) => {
  const { session } = req;
  if (session.userid && session.accountType === 'admin') {
    res.render('admin/adminHome');
  } else {
    res.redirect('/admin/login');
  }
};

const adminLoginRender = (req, res) => {
  const { session } = req;
  if (session.userid && session.accountType === 'admin') {
    res.redirect('/admin/home');
  } else {
    res.render('admin/login', { message });
    message = '';
  }
};

const admin = 'admin@gmail.com';
const mypassword = '123';
const adminLoginPost = (req, res) => {
  if (req.body.email === admin && req.body.password === mypassword) {
    const { session } = req;
    session.userid = admin;
    session.accountType = 'admin';
    res.redirect('/admin/home');
  } else {
    message = 'Invalid email or password';
    res.render('admin/login', { message });
  }
};

const adminUsersRender = async (req, res) => {
  const { session } = req;
  if (session.userid && session.accountType === 'admin') {
    const usersData = await Users.find();
    res.render('admin/adminUserView', { users: usersData });
  } else {
    res.redirect('/admin/login');
  }
};



const admin_edit_user = (req, res) => {
  const session = req.session;
  if (session.userid && session.accountType == "admin") {
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

// const getAdminCategory = async (req, res) => {
//   const { session } = req;
//   if (session.userid && session.accountType === 'admin') {
//     try {
//       const categories = await Categories.find();
//       res.render('admin/category', { categories });
//     } catch (error) {
//       console.log(error.message);
//     }
//   }
// };

// const getAddCategory = (req, res) => {
//   const { session } = req;
//   if (session.userid && session.accountType === 'admin') {
//     res.render('admin/addCategory');
//   } else {
//     res.redirect('/admin/login');
//   }
// };

// const postAddCategory = async (req, res) => {
//   try {
//     console.log(req.body);
//     const categories = new Categories({
//       name: req.body.name,
//       description: req.body.description,
//     });
//     const categoriesData = await categories.save();
//     if (categoriesData) {
//       res.redirect('/admin/adminCategory');
//     } else {
//       res.render('admin/addCategory');
//     }
//   } catch (error) {
//     console.log(error.message);
//   }
// };

// const getEditCategory = async (req, res) => {
//   const { session } = req;
//   if (session.userid && session.accountType === 'admin') {
//     const { id } = req.params;
//     console.log(id);
//     const categories = await Categories.findOne({ _id: id });
//     res.render('admin/editCategory', { categoriesData: categories });
//   } else {
//     res.redirect('/admin/login');
//   }
// };

// const postEditCategory = async (req, res) => {
//   try {
//     const { id } = req.params;
//     console.log(req.params.id);
//     const categoriesData = await Categories.updateOne({ _id: id }, {
//       name: req.body.name,
//       description: req.body.description,
//     });
//     if (categoriesData) {
//       res.redirect('/admin/adminCategory');
//     } else {
//       res.render('admin/editCategory');
//     }
//   } catch (error) {
//     console.log(error.message);
//   }
// };

// const getDeleteCategory = async (req, res) => {
//   try {
//     const { id } = req.params;
//     console.log(id);
//     await Categories.deleteOne({ _id: id }).then(() => {
//       res.redirect('/admin/adminCategory');
//     });
//   } catch (error) {
//     console.log(error.message);
//   }
// };

const getAdminProducts = async (req, res) => {
  const { session } = req;
  if (session.userid && session.accountType === 'admin') {
    const productsData = await Products.find();
    res.render('admin/adminProductView', { products: productsData });
  } else {
    res.redirect('/admin/login');
  }
};

const getAddProduct = async (req, res) => {
  const { session } = req;
  if (session.userid && session.accountType === 'admin') {
    // const categories = await Categories.find();
    // console.log(categories);
    res.render('admin/adminAddProduct');
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




const getEditProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    await Products.findOne({ _id: id }).then((product) => {
      if (product) {
        res.render('admin/editProduct', { productsData: product });
      } else {
        res.redirect('/admin/products');
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

const postEditProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(req.params.id);
    const productsData = await Products.updateOne({ _id: id }, {
      productName: req.body.productName,
      description: req.body.description,
      productCategory: req.body.productCategory,
      stock: req.body.stock,
      cost: req.body.cost,
      image: req.body.image,
      soldCount: req.body.soldCount,
      discount: req.body.discount,
    });
    if (productsData) {
      res.redirect('/admin/products');
    } else {
      res.render('admin/editProduct');
    }
  } catch (error) {
    console.log(error.message);
  }
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

module.exports = {
  adminHomeRender,
  adminLoginRender,
  adminLoginPost,
  adminUsersRender,
  blockUser,
  unblockUser,
  admin_edit_user,
  edit_post,
  // getAdminCategory,
  // getAddCategory,
  // postAddCategory,
  // getEditCategory,
  // postEditCategory,
  // getDeleteCategory,
  getAdminProducts,
  getAddProduct,
  postAddProduct,
  getEditProduct,
  postEditProduct,
  getDeleteProduct,
  logout,
};
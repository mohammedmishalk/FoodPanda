const express = require('express');
const path = require('path');

const router = express.Router();
const controller = require('../controllers/adminControl');

const multer  = require('multer')


const storage = multer.diskStorage({
    destination: (req, file,callback)=>{
         callback(null, './public/images')
    },
    filename: (req, file, callback)=>{
         console.log(file)
         callback(null, Date.now()+ path.extname(file.originalname))
    }
})


const upload = multer({ storage: storage })




router.route('/login').get(controller.adminLoginRender).post(controller.adminLoginPost);
router.get('/logout', controller.logout);
router.get('/home', controller.adminHomeRender);
router.get('/users', controller.adminUsersRender);
router.route('/edit/:id').get(controller.admin_edit_user).post(controller.edit_post);
router.get('/blockuser/:id', controller.blockUser);
router.get('/unblockuser/:id', controller.unblockUser);
// router.get('/adminCategory', controller.getAdminCategory);
// router.route('/addCategory').get(controller.getAddCategory).post(controller.postAddCategory);
// router.get('/deleteCategory/:id', controller.getDeleteCategory);
// router.route('/editCategory/:id').get(controller.getEditCategory).post(controller.postEditCategory);
router.get('/products', controller.getAdminProducts);
router.route('/addProduct').get(controller.getAddProduct).post( upload.single("image"),controller.postAddProduct);
router.route('/editProduct/:id').get(controller.getEditProduct).post(controller.postEditProduct);
router.get('/deleteProduct/:id', controller.getDeleteProduct);

module.exports = router;

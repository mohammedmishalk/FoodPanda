const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProdectSchema = new Schema({
  item_name: {
    type: String,
    required: true,
  },
  des: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    min: 0,
    max: 250,
    required: true,
  },
  category: {
    type: String,
    ref: 'categories',
    required: true,
  },
  image: [
    {
      url: String,
      filename: String,
    },
  ],
  soldCount: {
    type: Number,
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
 
});

const Products = mongoose.model("product", ProdectSchema);
module.exports = Products;

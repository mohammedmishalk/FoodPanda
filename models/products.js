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
    type: String,
    required: true,
  },
  category: {
    type: String,
    ref: 'categories',
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
 
});

const Products = mongoose.model("product", ProdectSchema);
module.exports = Products;

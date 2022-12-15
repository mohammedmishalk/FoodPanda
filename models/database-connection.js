
const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');

mongoose.connect('mongodb://127.0.0.1:27017/store', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}, (err) => {
  if (err) {
    // eslint-disable-next-line no-console
    console.log(err);
  } else {
    // eslint-disable-next-line no-console
    console.log('successfully connected');
  }
});
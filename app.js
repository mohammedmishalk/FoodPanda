const express = require('express');
const cookieParser = require('cookie-parser');
const sessions = require('express-session');
const path = require('path');
const nodemailer = require('nodemailer');
const app = express();

const dotenv = require("dotenv");


dotenv.config();

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

// app.use(fileUpload());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
  secret: 'thisismysecrctekeyfhrgfgrfrty84fwir767',
  saveUninitialized: true,
  cookie: { maxAge: oneDay },
  resave: false,
}));

app.use((req, res, next) => {
  res.set(
    'Cache-Control',
    'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0',
  );
  next();
});

const userRoutes = require('./routes/userRoutes');

app.use('/user', userRoutes);

const adminRoutes = require('./routes/adminRoutes');

app.use('/admin', adminRoutes);

app.get('/', (req, res) => {
  const { session } = req;
  // eslint-disable-next-line no-console
  console.log(session.userid);
  if (session.userid) {
    res.redirect('/user/home');
  } else {
    res.redirect('/user/login');
  }
});

app.use((req, res) => {
  res.status(404).render('404');
});

app.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log('server running on port 3000');
});

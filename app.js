const express = require('express');
const cookieParser = require('cookie-parser');
const sessions = require('express-session');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const path = require('path');
const app = express();

const dotenv = require("dotenv");
const dbconnect=require('./models/database-connection')
dbconnect.connectDB();

dotenv.config();

app.use(cookieParser());
app.use(express.json());
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

app.use('/user', userRoutes);
app.use('/admin', adminRoutes);


app.get('/', (req, res) => {
  const { session } = req;
  console.log(session.userid);
  if (session.userid) {
    res.redirect('/user/home');
  } else {
    res.redirect('/user/login');
  }
});




app.use((req, res) => {
  res.status(404)
  res.render('404');
});



app.listen(3000, () => {
  console.log('http://localhost:3000/');
});

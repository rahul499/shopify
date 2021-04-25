require('dotenv').config();

const createError = require('http-errors');
const engine = require('ejs-mate');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passport = require('passport');
const session = require('express-session');
const User = require('./models/user');
const mongoose = require('mongoose');
const methodOverride = require('method-override');


// require routes
const indexRouter = require('./routes/index');
const postsRouter = require('./routes/posts');
const reviewsRouter = require('./routes/reviews');

const app = express();

// use ejs-locals for all ejs templates
app.engine('ejs', engine);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//setup public assets directory
app.use(express.static('public'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));


//connect to database
const db = "mongodb+srv://shopifyuser:hellorahul@shopify.aoaue.mongodb.net/shopifydata?retryWrites=true&w=majority";
mongoose.connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  }
).then(() => console.log('MongoDB connected...'))
.catch(err => console.log('Not connected to database.'));
mongoose.Promise = global.Promise;


//Configure passport and session
app.use(session({
  secret: 'rahul',
  resave: false,
  saveUninitialized: true,
}))

app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//title local variables middleware
app.use(function(req, res, next){


req.user = {
  '_id': '608549687103f2703800eb01',
  'username': 'sam'
}
res.locals.currentUser = req.user;
  res.locals.title = 'Shopify';
  //set success flash messages
  res.locals.success = req.session.success || '';
  delete req.session.success; 
  //set error flash messages
  res.locals.error = req.session.error || '';
  delete req.session.error;
  //continue onto next function in middleware chain
  next();
})

// mount routes
app.use('/', indexRouter);
app.use('/posts', postsRouter);
app.use('/posts/:id/reviews', reviewsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // // set locals, only providing error in development
  // res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};

  // // render the error page
  // res.status(err.status || 500);
  // res.render('error');

  console.log(err);
  req.session.error = err.message;
  res.redirect('back');
});


module.exports = app;

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var cors = require('cors');

// Use bluebird
var configDB = require('./configs/db.config');
mongoose.Promise = global.Promise;
mongoose.connect(configDB.devDB, err => {
  if (err)
    console.error(err);
});

// Models
var supplierModel = require('./models/supplier.model');
var driverModel = require('./models/driver.model');
var managerModel = require('./models/manager.model');
var transportModel = require('./models/transport.model');
var productModel = require('./models/product.model');
var workModel = require('./models/work.model');
var billModel = require('./models/bill.model');
var orderDispatchModel = require('./models/orderDispatch.model');
var devolutionModel = require('./models/devolution.model');
var syncDetailModel = require('./models/syncDetail.model');

// Routes
var index = require('./routes/index');
var suppliers = require('./routes/suppliers.route');
var drivers = require('./routes/drivers.route');
var managers = require('./routes/managers.route');
var transports = require('./routes/transports.route');
var works = require('./routes/works.route');
var products = require('./routes/products.route');
var bills = require('./routes/bills.route');
var orders = require('./routes/orderDispatch.route');
var devolutions = require('./routes/devolutions.route');
var syncDetails = require('./routes/syncDetails.route');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/api/suppliers', suppliers);
app.use('/api/drivers', drivers);
app.use('/api/managers', managers);
app.use('/api/transports', transports);
app.use('/api/works', works);
app.use('/api/products', products);
app.use('/api/bills', bills);
app.use('/api/orders', orders);
app.use('/api/devolutions', devolutions);
app.use('/api/syncDetails', syncDetails);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

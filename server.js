// =======================
// get the packages we need ============
// =======================
var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');

var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
var User   = require('./app/models/user'); // get our mongoose model

// =======================
// configuration =========
// =======================
var port = process.env.PORT || 8080; // used to create, sign, and verify tokens
mongoose.connect(config.database); // connect to database
app.set('superSecret', process.env.ANGEL_APP_SUPER_SECRET); // secret variable
app.set('tokenExpiry', 3600);

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

// =======================
// routes ================
// =======================
app.get('/', function(req, res) {
    res.send('Hello! The API is at http://localhost:' + port + '/api');
});

// API ROUTES -------------------
var apiRoutes = express.Router();

//Routes that don't require any Auth
apiRoutes = require('./app/controllers/default_controller')(app, apiRoutes);
apiRoutes = require('./app/controllers/registration_controller')(app, apiRoutes);
apiRoutes = require('./app/controllers/auth_controller')(app, apiRoutes);

//Token Auth Middleware
apiRoutes = require('./app/middleware/tokenauth_middleware')(app, apiRoutes);

//Routes that require auth_controller
apiRoutes = require('./app/controllers/user_controller')(app, apiRoutes);

// apply the routes to our application with the prefix /api
app.use('/api', apiRoutes);

// =======================
// start the server ======
// =======================
app.listen(port);
console.log('Magic happens at http://localhost:' + port);

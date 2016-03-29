var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var User   = require('../models/user'); // get our mongoose model

module.exports = function(app, apiRoutes) {

  // route to authenticate a user (POST http://localhost:8080/api/authenticate)
  apiRoutes.post('/register', function(req, res) {
    var thisName = req.body.name;
    var thisPassword = req.body.password;
    var thisAdmin = req.body.admin;
    var thisEmail = req.body.email;
    var thisMobile = req.body.mobile;

    if(thisName && thisPassword && (thisAdmin != undefined) && (thisEmail || thisMobile)) {

      //see if the user already exists without a password
      User.findOne({
        $or: [{
          "mobile": thisMobile
        },{
          "email" : thisEmail
        }]
      },"+password", function(err, u) {
        if(err) throw err;

        if(u) {
          var password = u.password;

          if(password) {
            //the user already exists so return an Error
            return res.status(422).send({
              success: false,
              message: 'User could not be created as they already exist. Try logging in instead.'
            });
          } else {
            //the user exists but has no password, set the password and generate the Token
            u.password = thisPassword;
            u.save(function(err) {
              if (err) {
                return res.status(422).send({
                  success: false,
                  message: 'User could not be created',
                  details: err.errmsg
                });
              }

              console.log('User saved successfully');
              u.password = "";
              var token = jwt.sign(u, app.get('superSecret'), {
                expiresIn: app.get('tokenExpiry')
              });

              // return the information including token as JSON
              res.json({
                success: true,
                message: 'User created successfully',
                token: token
              });
            });
          }
        } else {
          //Create the user from scratch

          var u = new User({
            name: thisName,
            password: thisPassword,
            admin: thisAdmin,
            email: thisEmail,
            mobile: thisMobile
          });

          u.save(function(err) {
            if (err) {
              return res.status(422).send({
                success: false,
                message: 'User could not be created',
                details: err.errmsg
              });
            }

            console.log('User saved successfully');
            u.password = "";
            var token = jwt.sign(u, app.get('superSecret'), {
              expiresIn: app.get('tokenExpiry')
            });

            // return the information including token as JSON
            res.json({
              success: true,
              message: 'User created successfully',
              token: token
            });
          });
        }
      });
    } else {
      return res.status(422).send({
          success: false,
          message: 'Name, Password and Admin setting are mandatory.'
      });
    }
  });

  return apiRoutes;
}

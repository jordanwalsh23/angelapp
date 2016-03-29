var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var User   = require('../models/user'); // get our mongoose model

module.exports = function(app, apiRoutes) {

  // route to authenticate a user (POST http://localhost:8080/api/authenticate)
  apiRoutes.post('/login', function(req, res) {
    var thisPassword = req.body.password;
    var thisEmail = req.body.email;
    var thisMobile = req.body.mobile;

    if(thisPassword && (thisEmail || thisMobile)) {

      //see if the user exists
      User.findOne({
        $or: [{
          "mobile": thisMobile
        },{
          "email" : thisEmail
        }]
      },"+password", function(err, u) {
        if(err) throw err;

        if(u) {
          u.comparePassword(thisPassword, function(err,is_match){
            console.log("error is: " + err);
            console.log("match is: " + is_match);

            if(err || !is_match) {
              return res.status(401).send({
                  success: false,
                  message: 'Supplied email/mobile and password don\'t match'
              });
            } else if (is_match) {
              u.save(function(err) {
                if (err) {
                  return res.status(422).send({
                    success: false,
                    message: 'User could not be saved',
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
                  message: 'User logged in successfully',
                  token: token
                });
              });
            }
          });

        } else {
          return res.status(401).send({
              success: false,
              message: 'Supplied email/mobile and password don\'t match'
          });
        }
      });
    } else {
      return res.status(422).send({
          success: false,
          message: 'Email or Mobile and Password are mandatory.'
      });
    }
  });

  return apiRoutes;
}

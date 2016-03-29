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

    if(thisName && thisPassword && (thisAdmin != undefined) || thisEmail || thisMobile) {
      // create a sample user
      var u = new User({
        name: thisName,
        password: thisPassword,
        admin: thisAdmin,
        email: thisEmail,
        mobile: thisMobile
      });

      // save the sample user
      u.save(function(err) {
       if (err) {
         return res.status(422).send({
             success: false,
             message: 'User could not be created',
             details: err.errmsg
         });
       }

       console.log('User saved successfully');
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
    } else {
      return res.status(422).send({
          success: false,
          message: 'Name, Password and Admin setting are mandatory.'
      });
    }
  });

  return apiRoutes;
}

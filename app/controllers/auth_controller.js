var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var User   = require('../models/user'); // get our mongoose model

module.exports = function(app, apiRoutes) {
  // route to authenticate a user (POST http://localhost:8080/api/authenticate)
  apiRoutes.post('/authenticate', function(req, res) {

    // find the user
    User.findOne({
      name: req.body.name
    }, function(err, user) {

      if (err) throw err;

      if (!user) {
        res.json({ success: false, message: 'Authentication failed. User not found.' });
      } else if (user) {

        // check if password matches
        if (user.password != req.body.password) {
          res.json({ success: false, message: 'Authentication failed. Wrong password.' });
        } else {

          // if user is found and password is right
          // create a token
          var token = jwt.sign(user, app.get('superSecret'), {
            expiresIn: app.get('tokenExpiry')
          });

          // return the information including token as JSON
          res.json({
            success: true,
            message: 'Enjoy your token!',
            token: token
          });
        }
      }
    });
  });

  // route to renew and expired token (POST http://localhost:8080/api/renew)
  apiRoutes.post('/renew', function(req, res) {

    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {
      // verifies secret and checks exp
      jwt.verify(token, app.get('superSecret'), {
        ignoreExpiration: true
      }, function(err, decoded) {
        if (err) {
          return res.status(403).send({ success: false, message: 'Failed to authenticate token.' });
        } else {

          var id = decoded && decoded._doc && decoded._doc._id ? decoded._doc._id : false;

          if(id) {
            console.log("renewing token for "+id);

            User.findOne({
              _id: id
            }, function(err, user) {
              if(err || user == null) {
                return res.status(403).send({ success: false, message: 'Failed to authenticate token. (User error)' });
              } else {
                var token = jwt.sign(user, app.get('superSecret'), {
                  expiresIn: app.get('tokenExpiry')
                });

                // return the information including token as JSON
                res.json({
                  success: true,
                  message: 'Enjoy your token!',
                  token: token
                });
              }
            });
          } else {
            return res.status(403).send({ success: false, message: 'Failed to authenticate token. (User error)' });
          }
        }
      });

    } else {
      // if there is no token
      // return an error
      return res.status(422).send({
          success: false,
          message: 'No token provided.'
      });
    }
  });

  return apiRoutes;
}

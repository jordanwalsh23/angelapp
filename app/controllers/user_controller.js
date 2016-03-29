var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var User   = require('../models/user'); // get our mongoose model

module.exports = function(app, apiRoutes) {
  // route to return all users (GET http://localhost:8080/api/users)
  apiRoutes.get('/users', function(req, res) {

    var admin = req.decoded && req.decoded._doc && req.decoded._doc.admin;

    if(admin) {
      User.find({}, function(err, users) {
        res.json(users);
      });
    } else {
      //Only has visibility over the current userId
      var id = req.decoded && req.decoded._doc && req.decoded._doc._id ? req.decoded._doc._id : "";

      if(id) {
        User.find({
          _id: id
        }, function(err, user){
          if(err || user == null) {
            return res.status(404).send({
                success: false,
                message: 'User not found'
            });
          } else {
            res.json(user);
          }
        });
      }
    }
  });

  // route to return a single user (GET http://localhost:8080/api/users/:id)
  apiRoutes.get('/users/:id', function(req, res) {

    var userId = req.params.id;

    if(userId) {
      console.log(userId);

      User.findOne({
        _id: userId
      }, function(err, user){
        if(err || user == null) {
          return res.status(404).send({
              success: false,
              message: 'User not found'
          });
        } else {
          res.json(user);
        }
      });
    }
  });

  // route to update a single user (PATCH http://localhost:8080/api/users/:id)
  apiRoutes.patch('/users/:id', function(req, res) {

    var is_admin = req.decoded && req.decoded._doc && req.decoded._doc.admin;



    var userId = req.params.id;

    var name = req.body.name;
    var password = req.body.password;
    var admin = req.body.admin;
    var email = req.body.email;
    var mobile = req.body.mobile;

    //Check to see if the user is not an admin and they're trying to upgrade themselves
    if(!is_admin && admin) {
      return res.status(422).send({
          success: false,
          message: 'Cannot upgrade the current user to \'admin\' permission.'
      });
    }

    if(userId) {
      console.log(userId);

      User.findOne({
        _id: userId
      }, function(err, user){
        if(err) {
          return res.status(404).send({
              success: false,
              message: 'User not found'
          });
        } else {
          //update the user

          name ? user.name = name : false;
          password ? user.password = password : false;
          admin != undefined ? user.admin = admin : false;
          email ? user.email = email : false;
          mobile ? user.mobile = mobile : false;

          user.save(function(err) {
            if(err) {
              return res.status(422).send({
                  success: false,
                  message: 'Error updating user',
                  error : err
              });
            } else {
              return res.status(200).send({
                  success: true,
                  message: 'User updated successfully'
              });
            }
          })
        }
      });
    }
  });

  // route to delete a single user (DELETE http://localhost:8080/api/users/:id)
  apiRoutes.delete('/users/:id', function(req, res) {

    var userId = req.params.id;

    if(userId) {
      console.log("Deleting:" + userId);

      User.remove({
        _id: userId
      }, function(err){
        if(err) {
          return res.status(404).send({
              success: false,
              message: 'User not found'
          });
        } else {
          return res.status(200).send({
              success: true,
              message: 'User deleted successfully'
          });
        }
      });
    }
  });

  return apiRoutes;
}

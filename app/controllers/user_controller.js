var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var User   = require('../models/user'); // get our mongoose model

module.exports = function(app, apiRoutes) {
  // route to return all users (GET http://localhost:8080/api/users)
  apiRoutes.get('/users', function(req, res) {

    var admin = req.decoded && req.decoded._doc && req.decoded._doc.admin;
    var query = req.query && req.query.q ? req.query.q : "";

    if(query) {
      console.log("query is: " + query);
      User.find({
        $or: [{
          "mobile": query
        },{
          "email" : query
        }]
      }, function(err, users) {
        res.json(users);
      });
    } else if(admin) {
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

  // route to create a user that doesn't already exist in the system
  apiRoutes.post('/users', function(req, res) {
    var thisName = req.body.name;
    var thisAdmin = req.body.admin;
    var thisEmail = req.body.email;
    var thisMobile = req.body.mobile;

    if(thisName && (thisEmail || thisMobile)) {
      // create a sample user
      var u = new User({
        name: thisName,
        admin: thisAdmin || false,
        email: thisEmail || "",
        mobile: thisMobile || ""
      });

      u.save(function(err) {
       if (err) {
         console.log(err);
         return res.status(422).send({
             success: false,
             message: 'User could not be created',
             details: err.errmsg
         });
       }

       console.log('User saved successfully');

       // return the information including token as JSON
       res.json({
         success: true,
         message: 'User created successfully',
       });
      });
    } else {
      return res.status(422).send({
          success: false,
          message: 'Name and either email or mobile are required.'
      });
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

    var isAdmin = req.decoded && req.decoded._doc && req.decoded._doc.admin;

    var userId = req.params.id;

    var name = req.body.name;
    var password = req.body.password;
    var admin = req.body.admin;
    var email = req.body.email;
    var mobile = req.body.mobile;

    //Check to see if the user is not an admin and they're trying to upgrade themselves
    if(!isAdmin && admin) {
      return res.status(403).send({
          success: false,
          message: 'Forbidden: Cannot upgrade the current user to \'admin\' permission as the current user is not an admin.'
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

    var isAdmin = req.decoded && req.decoded._doc && req.decoded._doc.admin;
    var isCurrentUser = req.decoded && req.decoded._doc && req.decoded._doc._id == userId;

    if(!isAdmin && !isCurrentUser) {
      return res.status(403).send({
          success: false,
          message: 'Forbidden: user is not an admin and is attempting to delete another user.'
      });
    }

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

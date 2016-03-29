var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var User   = require('../models/user'); // get our mongoose model

module.exports = function(app, apiRoutes) {
  // route to show a random message (GET http://localhost:8080/api/)
  apiRoutes.get('/', function(req, res) {
    res.json({
      message: 'AngelApp API',
      links: [{
        'url' : '/api/register',
        'method' : 'POST',
        'type' : 'application/json',
        'rel' : 'register'
      }]
    });
  });

  return apiRoutes;

}

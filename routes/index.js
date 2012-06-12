var User   = require('../models/user')
  , Plant  = require('../models/plant')
  , Update = require('../models/update');
/*
 * GET home page.
 */
 
module.exports = function(req, res){
  Users.find()
       .limit(10)
       .fields('username', 'updatedAt', 'avatarUrl')
       .sort('updatedAt', -1)
       .run(function(err, recentUsers){
         
    res.render('index', { 
       title: 'Welcome to Civics Garden' 
     , recentUsers: recentUsers
    });
    
  });
};
var User   = require('../models/user')
  , Plant  = require('../models/plant')
  , Update = require('../models/update');

/*
 * GET users.
 */

exports.getIndex = function(req, res){
 Users.find()
      .limit(10)
      .fields('username', 'updatedAt')
      .run(function(err, recentUsers){

   res.render('users/index', { 
      title: 'Welcome to Civics Garden' 
    , recentUsers: recentUsers
   });

 });
};

exports.getUser = function(req, res){
  if (req.params.user) {
    Plant.findOne()
         .where('owner.username', req.params.user)
         .run(function(err, plant){
      User.findOne()
          .where('username', req.params.user)
          .run(function(err, user){
      
        if (user != null) {

          if (plant) {
            plant.toObject();
          }
          
          Update.find()
              .where('owner.username', req.params.user)
              .sort('createdAt', -1)
              .run(function(err, updates){
          
            updates = updates.map(function(update) {
              return update.toObject();
            });
      
            res.render('users/user', { 
               title: 'Civics Garden: ' + req.params.user
             , user: user
             , plant: plant
             , updates: updates
            });
          });
        }
        else {
          res.render('404', { status: 404, url: req.url, title: "No found" });
        }
      });
    });
  }
  else { // no user
    res.redirect('/');
  }
};
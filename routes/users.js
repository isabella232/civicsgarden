var User   = require('../models/user')
  , Plant  = require('../models/plant')
  , Activity = require('../models/activity');

var Users = require('../config/users.json');

/*
 * GET users.
 */

exports.all = function(req, res){
  User.find()
      .where('username').in(Users)
      .lean() // only return JSON
      .exec(function(err, dbUsers){
    
    // populate an object of our users
    var users = {};
    Users.forEach(function(user) {
      users[user] = {};
    });
    
    // fill that object with any users already in the database
    dbUsers.forEach(function(dbUser) {
      users[dbUser.username] = dbUser;
    });
    
    // convert the object back into an array, setting the 'username' key
    var usersArray = [];
    for(var username in users) {
      users[username].username = username;
      usersArray.push(users[username]);
    }
    
    res.json(usersArray);
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
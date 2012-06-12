var User   = require('../models/user')
  , Plant  = require('../models/plant')
  , Update = require('../models/update');


exports.getIndex = function(req, res){  
  Plant.find()
       .sort('updatedAt', -1)
       .fields('owner', 'status')
       .run(function(err, plants){
         
    plants = plants.map(function(plants) {
           return plants.toObject();
    });
    
    res.render('users/index', { 
       title: 'Welcome to Civics Garden' 
     , plants: plants
    });
    
  });
  
  // if (req.session.passport.user) {
  //    res.render('users/index', { 
  //       title: 'Create new Plant' 
  //     , recentUsers: recentUsers
  //    });
  // });
  // else {
  //   req.flash('error', 'You are not logged in!');
  //   res.redirect('/'); // Redirect back home
  // }
};

//
// POST: Create a new Plant
//
exports.postCreate =function(req, res) {
  if (req.session.passport.user) {
    var user = req.session.passport.User;
    var Plant = req.mongoose.models.Plant;
    
    var plant = new Plant({
        type          : 'bamboo'
      // , description   : req.body.plant.description || ''
      , status        : 'seed'
      , owner         : {
          username    : user.username
        , avatarUrl   : user.avatarUrl
      }
    });

    plant.save(function (err, plant) {
      // Update the session user

      req.flash('info', 'Your plant has been saved');
      res.redirect('/users/' + user.username); // Redirect back home
    });
  }
  else {
    req.flash('error', 'You are not logged in!');
    res.redirect('/'); // Redirect back home
  }
}

//
// POST: Update an existing Plant
//
exports.postUpdate = function(req, res) {
  var user = req.session.passport.user;

  if (req.session.passport.user) {    
    Plant.findOne()
         .where('owner.username', user.username)
         .run(function(err, plant){
      plant.water(req.body.update.description).save(function() {
        res.redirect('/users/' + user.username); // Redirect back home
      })
    });
  }
  else {
    req.flash('error', 'You are not logged in!');
    res.redirect('/'); // Redirect back home
  }
}
var User   = require('../models/user')
  , Plant  = require('../models/plant')
  , Update = require('../models/update');


exports.getIndex = function(req, res){  
  Plant.find()
       .sort('withersAt', -1)
       .fields('owner', 'status')
       .run(function(err, plants){
         
    plants = plants.map(function(plant) {
      return plant.toObject();
    });

    Update.find()
       .sort('createdAt', -1)
       .limit(20)       
       .run(function(err, updates){

      updates = updates.map(function(update) {
        return update.toObject();
      });
    
      res.render('users/index', { 
         title: 'Welcome to Civics Garden' 
       , plants: plants
       , updates: updates
      });
    });
  });
};

//
// POST: Create a new Plant
//
exports.update = function(req, res) {
  if (req.session.passport.user) {
    var user = req.session.passport.user;

    Plant.findOne()
         .where('owner.username', user.username)
         .run(function(err, plant){
      if (plant) {
        switch(plant.get('status')) {
          case 'seed':
          case 'healthy':
          case 'withered':
            if (req.body.update.type === 'water') {
              plant.water(req.body.update.description).save(function() {
                req.flash('info', 'Your plant has been watered');
                res.redirect('/users/' + user.username); // Redirect back home
              });
            }
            else {
              // seed/healthy/withered plants can only be watered
              req.flash('error', "Whoops! We can't do that to your plant");
              res.redirect('/users/' + user.username); // Redirect back home
            }
            break;
          case 'dead':
            if (req.body.update.type === 'water') {
              plant.reseed().water(req.body.update.description).save(function() {
                req.flash('info', 'Your plant has been reseeded and watered.');
                res.redirect('/users/' + user.username); // Redirect back home
              });
            }
            else if (req.body.update.type === 'reseed') {
              plant.reseed().save(function() {
                req.flash('info', 'Your plant has been reseeded.');
                res.redirect('/users/' + user.username); // Redirect back home
              });
            }
            else {
              // dead plants can only be watered or reseaded
              req.flash('error', "Whoops! We can't do that to your plant");
              res.redirect('/users/' + user.username); // Redirect back home
            }
            break;
        }
      }
      else {
        // if no plant  
        var plant = new Plant({
            type          : 'bamboo'
          // , description   : req.body.plant.description || ''
          , status        : 'seed'
          , owner         : {
              username    : user.username
            , avatarUrl   : user.avatarUrl
          }
        });

        plant.seed();

        if (req.body.update.type === 'water') {
          plant.water(req.body.update.description);
        }

        plant.save(function (err, plant) {
          req.flash('info', 'Your plant has been seeded.');
          res.redirect('/users/' + user.username); // Redirect back home
        });     
      }
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
        req.flash('info', 'Your plant has been watered');
        res.redirect('/users/' + user.username); // Redirect back home
      })
    });
  }
  else {
    req.flash('error', 'You are not logged in!');
    res.redirect('/'); // Redirect back home
  }
}
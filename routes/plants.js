exports.getIndex = function(req, res){
  var Plant = req.mongoose.models.Plant;
  
  Plant.find()
       .sort('updatedAt', -1)
       .fields('owner', 'status')
       .run(function(err, plants){
         
    plants = plants.map(function(plant) {
           return plant.toObject();
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
    var user = req.session.passport.user;
    
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
      res.redirect('/' ); // Redirect back home
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
  if (req.session.passport.user) {
    var user = req.session.passport.user;
    var Plant = req.mongoose.models.Plant;
    
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
/*
 * GET users.
 */

exports.getIndex = function(req, res){
   var Users = req.mongoose.models.User;
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
    var Plant = req.mongoose.models.Plant;
    var User = req.mongoose.models.User;

    Plant.findOne()
         .where('owner.username', req.params.user)
         .run(function(err, plant){
      User.findOne()
          .where('username', req.params.user)
          .run(function(err, user){
      
        if (user != null) {

          if (plant) {
            plant = plant.toObject();
            plant.updates.reverse(); // newest updates first
          }
          res.render('users/user', { 
             title: 'Welcome to Civics Garden'
           , user: user
           , plant: plant
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
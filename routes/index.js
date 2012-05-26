
/*
 * GET home page.
 */
 
module.exports = function(req, res){
  var Users = req.mongoose.models.User;
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
var express         = require('express')
  , app             = module.exports = express.createServer();
  
var routes          = {
   index : require('./routes/index')
 , users : require('./routes/users')
 , plants : require('./routes/plants')
};
    
  
                    
var mongoose        = require('mongoose')
  , Schema          = mongoose.Schema
  , ObjectId        = Schema.ObjectId;
                    
var passport        = require('passport')
  , TwitterStrategy = require('passport-twitter').Strategy;

// Ensure environment variables

if ( !( process.env.TWITTER_CONSUMER_KEY 
     && process.env.TWITTER_CONSUMER_SECRET
     && process.env.TWITTER_CALLBACK_URL
     && process.env.MONGOHQ
   ) ) {
  console.log("You're missing environment variables. See `sample.env`");
}

var PORT = process.env.PORT || 3000;

// Connect to the DB
mongoose.connect(process.env.MONGOHQ);

var UpdateSchema = new Schema({
    source        : String
  , type          : String // pot, seed, healthy, withered, dead
  , createdAt     : { type: Date, default: Date.now }
  , description   : String
  , data          : String
  , owner         : {
     username  : String
   , avatarUrl : String
  }
});

var UserSchema = new Schema({
    id            : ObjectId
  , provider_id   : Number
  , username      : String
  , displayName   : String
  , avatarUrl     : String
  , createdAt     : { type: Date, default: Date.now }
  , updatedAt     : { type: Date, default: Date.now }
  , auth          : {
      provider      : { type: String, default: 'twitter' }
    , token         : String
    , token_secret  : String 
  }
});

var PlantSchema = new Schema({
    type          : String
  , description   : String
  , status        : { type: String, default: 'seed' } // seed, healthy, withered, dead
  , createdAt     : { type: Date, default: Date.now }
  , updatedAt     : { type: Date, default: Date.now }
  , withersAt     : Date
  , diesAt        : Date
  , owner         : {
      username    : String
    , avatarUrl   : String
  }
});

PlantSchema.methods.water = function (description) {
  // append the update
  var update = new Update({
     description: description
   , type: 'water'
   , owner: {
      username: this.owner.username
    , avatarUrl: this.owner.avatarUrl
   }
  })
  update.save();
  
  console.log(update);
  
  //seed, healthy, withered, dead
  switch(this.status) {
    case 'seed':
    case 'healthy':
    case 'withered':
    case 'dead':
      this.status    = 'healthy';
      this.updatedAt = new Date ;
      this.withersAt = new Date(this.updatedAt.getTime() + 2 * 24 * 60 * 60 * 100); // 1 days
      this.diesAt    = new Date(this.updatedAt.getTime() + 4 * 24 * 60 * 60 * 100); // 3 days
      break;
  }
  return this;
}

PlantSchema.methods.checkStatus = function (cb) {
  // Find plants to wither
  this.find()
      .where('status', 'healthy')
      .where('withersAt').lte(new Date)
      .run(function(err, plants) {
    
    for (i = 0; i < plants.length; i++) {
      var plant = plants[i];
      
      plant.status.set( 'withered' ); // change the type to wither
      
      // Save the update
      var update = new Update({
         description: description
       , type: 'withered'
      })
      update.save();
      
      plant.save(cb); // run the callback for each and every newly withered plant
    }
  });
  // Find plants to die
  this.find()
      .where('status', 'withered')
      .where('diesAt').lte(new Date)
      .run(function(err, plants) {
  
    for (i = 0; i < plants.length; i++) {
      var plant = plants[i];
    
      plant.status    = 'dead';
      plant.updatedAt = new Date;

      // Save the update
      var update = new Update({
         description: description
       , type: 'dead'
      })
      update.save();

      plant.save(cb); // run the callback for each and every newly dead plant
    }
  });
};


var User = mongoose.model('User', UserSchema);
var Plant = mongoose.model('Plant', PlantSchema);
var Update = mongoose.model('Update', UpdateSchema);

passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: process.env.TWITTER_CALLBACK_URL
  },
  function(token, tokenSecret, profile, done) {
    // Save the user to the database
    User.findOne({providerId: profile.id}, function(err, user) {
      if(!err) {
        if(!user) {
          user = new User({
              providerId  : profile.id
            , username    : profile.username
            , displayName : profile.displayName
            , avatarUrl   : profile._json.profile_image_url
            , auth        : {
                provider    : 'twitter'
              , token       : token
              , tokenSecret : tokenSecret
            }
          });
        }
        
        user.save(function(err) {
          if(!err) {
            console.log("User " + user.username + " logged in and saved/updated.");
            return done(null, user);
          }
          else {
            console.log("Error: could not save user " + user.username);
            return done(err);
          }
        });
      }
      else {
        console.log("Database Error:", err);
        return done(err);
      }
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  User.findById(obj._id, function (err, user) {
    done(err, user);
  });
});


// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.cookieParser());  
  app.use(express.bodyParser());
  app.use(express.session({ secret: 'keyboard cat' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Always include the Session in the View
app.dynamicHelpers({
  userSession: function(req, res){
    return req.session.passport.user;
  }
});

// Database Middleware to include our DB in routes
var includeDB = function (req, res, next) {
  req.mongoose = mongoose;
  next();
}


// Redirect the user to Twitter for authentication.  When complete, Twitter
// will redirect the user back to the application at
// /auth/twitter/callback
app.get('/auth/twitter', passport.authenticate('twitter'));

// Twitter will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
app.get('/auth/twitter/callback', function(req, res, next) {
  passport.authenticate('twitter', function(err, user, info) {
     if (err) { return next(err) }
     if (!user) { return res.redirect('/login') }
     req.logIn(user, function(err) {
       if (err) { return next(err); }
       return res.redirect('/users/' + user.username);
     });
  })(req, res, next);        
});


app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// Routes
app.get('/'             , includeDB , routes.plants.getIndex);
app.get('/users/:user'  , includeDB , routes.users.getUser);
app.post('/plants'      , includeDB , routes.plants.postCreate );
app.post('/plants/:user/update' , includeDB , routes.plants.postUpdate);




app.listen(PORT, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
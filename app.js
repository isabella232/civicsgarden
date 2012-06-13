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

var User   = require('./models/user')
  , Plant  = require('./models/plant')
  , Update = require('./models/update');


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
  },
  flash: function(req, res) {
    var flash = req.flash();
    if (flash.info || flash.error) {
      return flash;
    }
    else {
      return null;
    }
  }
});


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

       req.flash('info', 'You have been logged in.');
       return res.redirect('/users/' + user.username);
     });
  })(req, res, next);        
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// Routes
app.get('/'             , routes.plants.getIndex);
app.get('/users/:user'  , routes.users.getUser);
app.post('/plants'      , routes.plants.postCreate );
app.post('/plants/:user/update' , routes.plants.postUpdate);


/** Set up our Scheduler **/
var Schedule = require('node-schedule');
// schedule every minute
var scheduleUpdates = Schedule.scheduleJob({ minute: new Schedule.Range(0, 59) }, function(){
  Plant.checkStatus(function(err, plants) {
    // console.log('Scheduled: ', plants);
  });
});


app.listen(PORT, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
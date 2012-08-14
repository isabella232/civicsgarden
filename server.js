var express         = require('express')
  , app             = module.exports = express();
                    
var mongoose        = require('mongoose')
  , Schema          = mongoose.Schema
  , ObjectId        = Schema.ObjectId;


// Ensure environment variables
if ( !( process.env.TWITTER_CONSUMER_KEY 
     && process.env.TWITTER_CONSUMER_SECRET
     && process.env.TWITTER_CALLBACK_URL
     && process.env.MONGO_URI
   ) ) {
  console.log("You're missing environment variables. See `sample.env`");
}

var PORT = process.env.PORT || 3000;

// Connect to the DB
mongoose.connect(process.env.MONGO_URI);

// var User   = require('./models/user')
//   , Plant  = require('./models/plant')
//   , Activity = require('./models/activity');
  

var nTwitter = require('ntwitter')
var twitter = new nTwitter({
  consumer_key: process.env.SUPER_TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.SUPER_TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.SUPER_TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.SUPER_TWITTER_ACCESS_TOKEN_SECRET
});

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');  
  app.use(express.cookieParser());  
  app.use(express.bodyParser());
  app.use(express.session({ secret: 'keyboard cat' }));
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

// // Always include the Session in the View
// app.dynamicHelpers({
//   flash: function(req, res) {
//     var flash = req.flash();
//     if (flash.info || flash.error) {
//       return flash;
//     }
//     else {
//       return null;
//     }
//   }
// });


// Routes
// app.get('/'             , routes.plants.getIndex);
app.get('/api/users/:user?'  , require('./routes/users').all);
app.get('/api/tasks'         , require('./routes/tasks').all);
app.post('/api/activities'   , require('./routes/activities').create);



// /** Set up our Scheduler **/
// var Schedule = require('node-schedule');
// // schedule every minute
// var scheduleUpdates = Schedule.scheduleJob({ minute: new Schedule.Range(0, 59) }, function(){
//   Plant.checkStatus(function(err, plants) {
//     // For each of the WITHERED plants
//     plants.withered.forEach(function(plant) {});
// 
//     // For each of the DEAD plants
//     plants.dead.forEach(function(plant) {});
//   });
// });


app.listen(PORT, function(){
  // console.log(app.locals());
  // console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
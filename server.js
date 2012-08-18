var fs          = require('fs'),
    express     = require('express'),
    app         = module.exports = express(),
    server      = app.listen(process.env.PORT || 3000);
                
var mongoose    = require('mongoose'),
    Schema      = mongoose.Schema,
    ObjectId    = Schema.ObjectId;

// Ensure environment variables
if ( !( process.env.TWITTER_CONSUMER_KEY && 
    process.env.TWITTER_CONSUMER_SECRET && 
    process.env.TWITTER_CALLBACK_URL &&
    process.env.MONGO_URI
   ) ) {
  console.log("You're missing environment variables. See `sample.env`");
  process.exit();
}

// Connect to the DB
mongoose.connect(process.env.MONGO_URI);  

var NTwitter = require('ntwitter');
var twitter = new NTwitter({
  consumer_key        : process.env.SUPER_TWITTER_CONSUMER_KEY,
  consumer_secret     : process.env.SUPER_TWITTER_CONSUMER_SECRET,
  access_token_key    : process.env.SUPER_TWITTER_ACCESS_TOKEN,
  access_token_secret : process.env.SUPER_TWITTER_ACCESS_TOKEN_SECRET
});

/**
 * Express Configuration
 */
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');  
  app.use(express.cookieParser());  
  app.use(express.bodyParser());
  app.use(express.session({ secret: 'keyboard cat' }));
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public')); // put this before the router
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

/**
 * Routing
 */
app.get('/api/users/:user?'  , require('./routes/users').all);
app.get('/api/tasks'         , require('./routes/tasks').all);
app.get('/api/activities'    , require('./routes/activities').all);
app.post('/api/activities'   , require('./routes/activities').create);
app.get('*', function(req, res) {
  fs.readFile(__dirname + '/public/index.html', 'utf8', function(err, text){
    res.send(text);
  });
});

/**
 * Log it!
 */
console.log("Express server listening on port %d in %s mode", server.address().port, app.settings.env);
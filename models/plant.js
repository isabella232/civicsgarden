var mongoose        = require('mongoose')
  , Schema          = mongoose.Schema
  , ObjectId        = Schema.ObjectId;

var async           = require('async');

var Update = require('./update');

var PlantSchema = new Schema({
    type          : { type: String, default: 'bamboo' }
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

PlantSchema.methods.seed = function () {
  // append the update
  var update = new Update({
     type: 'seed'
   , createdAt: this.get('createdAt')
   , owner: {
      username: this.get('owner.username')
    , avatarUrl: this.get('owner.avatarUrl')
   }
  })
  update.save();

  this.set('status', 'seed'); // possible redundant because it's set initially in the schema
    
  return this;
};

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
    
  //seed, healthy, withered, dead
  switch(this.status) {
    case 'seed':
    case 'healthy':
    case 'withered':
    case 'dead':
      this.set('status'     , 'healthy');
      this.set('updatedAt'  , new Date);
      this.set('withersAt'  , new Date(this.get('updatedAt').getTime() + 2 * 24 * 60 * 60 * 1000) ); // 2 days
      this.set('diesAt'     , new Date(this.get('updatedAt').getTime() + 4 * 24 * 60 * 60 * 1000) ); // 4 days
      break;
  }
  return this;
};

PlantSchema.methods.wither = function () {
  // append the update
  var update = new Update({
     type: 'withered'
   , createdAt: this.get('withersAt')
   , owner: {
      username: this.get('owner.username')
    , avatarUrl: this.get('owner.avatarUrl')
    }
  });
  update.save();

  this.set('status', 'withered');
  this.set('updatedAt', new Date);

  // if we're late withering it (i.e. if the server was sleeping)
  // give the user 1 day before we kill their plant to prevent
  // them being told it died immediately after being told
  // that it withered.
  var oneDayFromNow = (new Date()).getTime() + 1*24*60*60*1000;
  if ( this.get('diesAt').getTime() < oneDayFromNow ) {
    this.set('diesAt', new Date(oneDayFromNow)); 
  }

  return this;
};

PlantSchema.methods.die = function () {
  // append the update
  var update = new Update({
     type: 'dead'
   , owner: {
      username: this.get('owner.username')
    , avatarUrl: this.get('owner.avatarUrl')
   }
  })
  update.save();

  this.set('status', 'dead');
  this.set('updatedAt', this.get('diesAt'));

  return this;
};

PlantSchema.methods.reseed = function () {
  // append the update
  var update = new Update({
     type: 'reseed'
   , createdAt: new Date()
   , owner: {
      username: this.get('owner.username')
    , avatarUrl: this.get('owner.avatarUrl')
   }
  })
  update.save();

  this.set('status', 'seed');
  this.set('updatedAt', new Date());

  return this;
};

PlantSchema.statics.checkStatus = function (cb) {
  var self = this;
  // first check for withering plants,
  // then check for 
  async.series({
      withered: function(seriesCallback){
        self.find()
            .where('status', 'healthy')
            .where('withersAt').lte(new Date)
            .run(function(err, plants) {
          
          async.map(
            plants, 
            function(plant, mapCallback) {
              // wither the plant
              plant.wither().save(function(err, plant) {
                mapCallback(null, plant); // return the withered plant to the callback
              });
            },
            function(err, plants) {
              seriesCallback(null, plants);
            }
          );
        });
      },
      dead: function(seriesCallback){
        self.find()
            .where('status', 'withered')
            .where('diesAt').lte(new Date)
            .run(function(err, plants) {
    
          async.map(
            plants, 
            function(plant, mapCallback) {
              // wither the plant
              plant.die().save(function(err, plant) {
                mapCallback(null, plant); // return the withered plant to the callback
              });
            },
            function(err, plants) {
              seriesCallback(null, plants);
            }
          );
        });
      },
    },
    function(err, results){
      cb(err, results);
    }
  );
};

module.exports = mongoose.model('Plant', PlantSchema);
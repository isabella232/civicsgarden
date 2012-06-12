var mongoose        = require('mongoose')
  , Schema          = mongoose.Schema
  , ObjectId        = Schema.ObjectId;

var Update = require('./update');

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
    
  //seed, healthy, withered, dead
  switch(this.status) {
    case 'seed':
    case 'healthy':
    case 'withered':
    case 'dead':
      this.status    = 'healthy';
      this.updatedAt = new Date ;
      this.withersAt = new Date(this.updatedAt.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days
      this.diesAt    = new Date(this.updatedAt.getTime() + 4 * 24 * 60 * 60 * 1000); // 4 days
      break;
  }
  return this;
};

PlantSchema.statics.checkStatus = function (cb) {
  // Find plants to wither
  this.find()
      .where('status', 'healthy')
      .where('withersAt').lte(new Date)
      .run(function(err, plants) {
    
    for (i = 0; i < plants.length; i++) {
      var plant = plants[i];
      plant.set('status', 'withered' ); // change the type to wither
      plant.set('updatedAt', new Date);
      plant.save();

      // Save the update
      var update = new Update({
         type: 'withered'
       , createdAt: plant.get('withersAt')
       , owner: {
           username: plant.get('owner.username')
         , avatarUrl: plant.get('owner.avatarUrl')
        }
      });
      update.save(function(err, docs) {


        cb(err, docs); // return the update to the callback
      })
    }
  });
  // Find plants to die
  this.find()
      .where('status', 'withered')
      .where('diesAt').lte(new Date)
      .run(function(err, plants) {
  
    for (i = 0; i < plants.length; i++) {
      var plant = plants[i];

      plant.set('status', 'dead');
      plant.set('updatedAt', new Date);
      plant.save(); 

      // Save the update
      var update = new Update({
         type: 'dead'
       , createdAt: plant.get('diesAt')
       , owner: {
           username: plant.get('owner.username')
         , avatarUrl: plant.get('owner.avatarUrl')
        }
      });
      update.save(function(err, docs) {
        cb(err, docs); // return the update to the callback
      });
    }
  });
};

module.exports = mongoose.model('Plant', PlantSchema);
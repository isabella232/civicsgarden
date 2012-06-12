var mongoose        = require('mongoose')
  , Schema          = mongoose.Schema
  , ObjectId        = Schema.ObjectId;

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

module.exports = mongoose.model('Update', UpdateSchema);

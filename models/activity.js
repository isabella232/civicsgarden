var mongoose        = require('mongoose')
  , Schema          = mongoose.Schema
  , ObjectId        = Schema.ObjectId;

var ActivitySchema = new Schema({
    task          : String // pot, seed, healthy, withered, dead
  , action        : String
  , createdAt     : { type: Date, default: Date.now }
  , username      : String
});

module.exports = mongoose.model('Activity', ActivitySchema);

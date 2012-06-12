var mongoose        = require('mongoose')
  , Schema          = mongoose.Schema
  , ObjectId        = Schema.ObjectId;

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

module.exports = mongoose.model('User', UserSchema);

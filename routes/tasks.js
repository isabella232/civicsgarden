var User   = require('../models/user')
  , Plant  = require('../models/plant')
  , Activity = require('../models/activity');

var Tasks = require('../config/tasks.json');

exports.all = function(req, res) {
  res.json(Tasks);
}
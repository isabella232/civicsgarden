var User   = require('../models/user')
  , Plant  = require('../models/plant')
  , Activity = require('../models/activity');

//
// POST: Update an existing Plant
//
exports.create = function(req, res) {
  var activity = new Activity({
      task       : req.body.activity.task
    , action     : req.body.activity.action
    , username  : req.body.activity.username
  });
  activity.save(function(activity) {
    res.json(activity);
  });
};
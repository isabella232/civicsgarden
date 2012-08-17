var User   = require('../models/user')
  , Plant  = require('../models/plant')
  , Activity = require('../models/activity');

//
// POST: Save an activity
//
exports.create = function(req, res) {
  var activity = new Activity({
      task       : req.body.task
    , action     : req.body.action
    , username  : req.body.username
  });
  activity.save(function(err, activity) {
    res.json(activity);
  });
};

//
// POST: Save an activity
//
exports.all = function(req, res) {
  Activity.find()
          .sort('-createdAt')
          .lean()
          .exec(function(err, activities) {
    res.json(activities);
  });
};
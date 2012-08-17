var async  = require('async');

var User   = require('../models/user')
  , Plant  = require('../models/plant')
  , Activity = require('../models/activity');

var Tasks = require('../config/tasks.json');

exports.all = function(req, res) {
  
  
  // for each action, look up the last activity
  var eachAction = function(action, done) {
    Activity.findOne()
            .where('action').equals(action.action)
            .sort('-createdAt')
            .lean()
            .exec(function(err, activity) {
      // append it onto the action
      action.last_activity = activity;
      done();       
    });
  }
  
  var eachTask = function(taskKey, done) {
    async.forEach(Tasks[taskKey].actions, eachAction, function(err) {
      done(); 
    })
  };
  
  async.forEach(Object.keys(Tasks), eachTask, function(err) {
    res.json(Tasks);
  });
}
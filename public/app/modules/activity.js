define([
  // Global application context.
  "app",

  // Third-party libraries.
  "backbone",

],

function(app, Backbone) {

  var Activity = app.module();

  Activity.Model = Backbone.Model.extend({
    url: "/api/activities",
    
    idAttribute: "_id",
    
    defaults: {
		  task     : '',
		  action   : '',
		  username : '',
		}
		
  });

  Activity.Collection = Backbone.Collection.extend({
    url: "/api/activities",

    model: Activity.Model,
    
    getTasks: function() {
      var self = this;
      $.ajax({
        dataType: 'json',
        url: 'api/tasks',
        statusCode: {
          404: function() {
            self.tasks = {};
            self.trigger('reset');
          },
        },
        success: function(data) {
          self.tasks = data;
          self.trigger('reset');
        },
        error: function(req, type, err) {
          return; // do nothing
        }
      })
      return this;
    },

    initialize: function(models, options) {
      this.getTasks().fetch();
    }
  });
  
  Activity.Views.create = Backbone.View.extend({
    template: "activities/add",
    
    activity: {}, // space for our new activity
    
    events: {
      "click #select-task a": "selectTask",
      "click #select-user a": "selectUser"
    },
    
    selectTask: function(task) {
      // load the task data into our activity
      this.activity.task = $(task.currentTarget).attr('data-type');
      this.activity.action = $(task.currentTarget).attr('data-action');
      
      // select the task
      var tasks = $('#select-task a');
      for(var i = 0; i < tasks.length; i++) {
        $(tasks[i]).addClass('btn-primary').removeClass('btn-success'); // in case something was previously selected
      }
      $(task.currentTarget).addClass('btn-success').removeClass('btn-primary');
      
      // change the page
      $(".page-1").hide();
      $(".page-2").show();
      console.log($("ul#pager li").slice(1));
      $("ul#pager li").first().removeClass("active");
      $("ul#pager li").slice(1).addClass("active");
    },
    
    selectUser: function(user) {
      var self = this;
            
      this.activity.username = $(user.target).attr('data-username');
      
      var users = $('#select-user a');
      for(var i = 0; i < users.length; i++) {
        $(users[i]).addClass('btn-primary').removeClass('btn-success'); // in case something was previously selected
      }
      $(user.target).addClass('btn-success').removeClass('btn-primary');
      
      // save the Activity to the Collection
      self.activities.create(this.activity, {
        success: function(model, resp) {
          console.log(self.activities);
        },
        error: function() {
          new App.Views.Error();
        }
      });
      
      // reset our activity
      this.activity = {};
    },
    
    serialize: function() {
      return { 
        tasks: this.activities.tasks || [],
        users: this.users.models || []
      };
    },
    
    initialize: function() {
      this.activities.on('add', this.render, this);
      this.activities.on('reset', this.render, this);
      this.users.on('reset', this.render, this);
    },
  });
  
  Activity.Views.newSelectUserList = Backbone.View.extend({
    template: "user/item",
    
    serialize: function() {
        console.log(this.model);
        return { model: this.model };
    },
  });

  return Activity;

});
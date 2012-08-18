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
		  _id      : null,
		  task     : '',
		  action   : '',
		  username : '',
		  createdAt: null
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
      "click .select-task a": "selectTask",
      "click .select-user a": "selectUser",
      "click .reset"        : "reset"
    },
    
    selectTask: function(task) {
      // load the task data into our activity
      this.activity.task = $(task.currentTarget).attr('data-type');
      this.activity.action = $(task.currentTarget).attr('data-action');
      
      // select the task
      var tasks = $('.select-task a');
      for(var i = 0; i < tasks.length; i++) {
        $(tasks[i]).addClass('btn-primary').removeClass('btn-success'); // in case something was previously selected
      }
      $(task.currentTarget).addClass('btn-success').removeClass('btn-primary');
      
      // change the page
      $(".page-1").hide();
      $(".page-2").show();
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
        success: function(activity, resp) {
          self.afterAdd(activity);
        },
        error: function() {
          new App.Views.Error();
        }
      });
      
      // reset our activity
      this.activity = {};
    },
    
    afterAdd: function(model) {
      var self = this;
      var tasks, task, activity, action, i, j;
      
      activity = model.toJSON();
      
      tasks = this.activities.tasks;
      for(i = 0; i < tasks.length; i++) {
        task = tasks[i];
        // match up the task
        if(task.type === activity.task) {
          for (j = 0; j < task.actions.length; j++) {
           action = task.actions[j];
           
           // match up the action
           if (action.action === activity.action) {
             // update the Tasks's Action's last activity
             action.last_activity = activity;
           }
          }
        }
      }
      this.activities.trigger('reset');
    },
    
    updateSoil: function() {
      var self, tasks, task, action, anchor, progress, percent;
      self = this;
      
      var expires = 24 * 60 * 60 * 1000; // how long does it take for things to expire
      
      function escape(string) { 
        return string.replace(/(\[|\]|\")/g,'\\$1');
      }
      
      tasks = this.activities.tasks;
      if (tasks) {
        for(i = 0; i < tasks.length; i++) {
          task = tasks[i];
          for (j = 0; j < task.actions.length; j++) {
            action = task.actions[j];
            
            if (action.last_activity === null) {
              percent = 0;
            }
            else {
              percent = 100 * (1 - (((new Date()).getTime() - (new Date(action.last_activity.createdAt)).getTime()) / expires));
            }

            anchor = $('a[data-type*="'+escape(task.type)+'"][data-action*="'+action.action +'"]')[0];
            progress = $(anchor).siblings().find('div.progress div.bar').css('width', percent + '%');
          }
        }
      }
    },
    
    afterRender: function() {
      this.updateSoil();
    },
    
    reset: function() {
      this.activities.trigger('reset'); // not sure why I can't just re-render stuff, but this works too apparently
    },
    
    serialize: function() {
      return { 
        tasks: this.activities.tasks || [],
        users: this.users.models || []
      };
    },
    
    initialize: function() {
      this.activities.on('reset', this.render, this);
      this.users.on('reset', this.render, this);
      
      // setInterval(this.updateSoil.bind(this), 1*60*1000);
    },
  });
  
  // Activity.Views.newSelectUserList = Backbone.View.extend({
  //   template: "user/item",
  //   
  //   serialize: function() {
  //       console.log(this.model);
  //       return { model: this.model };
  //   },
  // });

  return Activity;

});
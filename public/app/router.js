define([
  // Application.
  "app",

  // Modules.
  "modules/user",
  "modules/activity",
],

function(app, User, Activity) {

  // Defining the application router, you can attach sub routers here.
  var Router = Backbone.Router.extend({
    routes: {
      "": "index",
      "activities/new": "newActivityUser",
      "activities/:user/new": "newActivityTask"
    },
    
    index: function() {
      // Use the main layout.
      app.useLayout("main").render();
      
      app.layout.setViews({
        "#body": new Activity.Views.create({
          activities: this.activities,
          users: this.users
        }),
      }).render();
      
      app.layout.render();
    },

    initialize: function() {
      app.useLayout("main");
      
      // Load our initial data
      this.users      = new User.Collection();
      this.activities = new Activity.Collection();
            
      app.layout.setViews({
        "#navbar": new Backbone.View({
          template: 'navbar/navbar'
        }),
      });
    }

  });

  return Router;

});

define([
  // Application.
  "app",

  // Modules.
  "modules/user",
],

function(app, User) {

  // Defining the application router, you can attach sub routers here.
  var Router = Backbone.Router.extend({
    routes: {
      "": "index",
      "activities/new": "newActivity"
    },

    index: function() {
      // Use the main layout.
      app.useLayout("main").render();
    },
    
    newActivity: function() {
      // Use the main layout.
      app.useLayout("main");
      
      app.layout.setViews({
        "#navbar": new Backbone.View({
          template: 'navbar/navbar'
        }),
        // "#status": new Endpoint.Views.Meta({
        //   collection: this.endpoints
        // }),
        // "#endpoints": new Endpoint.Views.List({
        //   collection: this.endpoints
        // }),
      });
      
      app.layout.render();
    },

    initialize: function() {
      app.useLayout("main");
      
      // Load our initial data
      this.users = new User.Collection();
            
      app.layout.setViews({
        "#navbar": new Backbone.View({
          template: 'navbar/navbar'
        }),
        // "#status": new Endpoint.Views.Meta({
        //   collection: this.endpoints
        // }),
        // "#endpoints": new Endpoint.Views.List({
        //   collection: this.endpoints
        // }),
      });
    }

  });

  return Router;

});

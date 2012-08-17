define([
  // Global application context.
  "app",

  // Third-party libraries.
  "backbone",

],

function(app, Backbone) {

  var User = app.module();

  User.Collection = Backbone.Collection.extend({
    url: function() {
      return "/api/users";
    },

    initialize: function(models, options) {
      this.fetch();
    }
  });
  
  // User.Views.SelectUserItem = Backbone.View.extend({
  //   template: "users/select-item",
  //       
  //   tagName: "div",
  //   
  //   serialize: function() {
  //     return { model: this.model.attributes };
  //   },
  // 
  //   
  // });
  // 
  // User.Views.SelectUserList = Backbone.View.extend({   
  //   template: "users/select-list",
  // 
  //   serialize: function() {
  //     return { collection: this.collection };
  //   },
  // 
  //   beforeRender: function(manage) {
  //     this.collection.each(function(user) {
  //       this.insertView("#select-user", new User.Views.SelectUserItem({
  //         model: user
  //       }));
  //     }, this);
  //   },
  // 
  //   initialize: function() {
  //     this.collection.on("reset", this.render, this);
  //   }
  // });
  
  // Endpoint.Views.Meta = Backbone.View.extend({
  //     template: "endpoint/meta",
  //   
  //     serialize: function() {
  //       return { meta: this.collection.meta || {} };
  //     },
  // 
  //     initialize: function() {
  //       // console.log(this.collection);
  //       this.collection.on("reset", this.render, this);
  //     }
  //   });

  return User;

});
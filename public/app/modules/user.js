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

    cache: false,

    parse: function(obj) {
      return obj;
    },

    initialize: function(models, options) {
      this.fetch();
    }
  });
  
  User.Views.SelectList = Backbone.View.extend({
    template: "endpoint/item",
    
    serialize: function() {
        console.log(this.model);
        return { model: this.model };
    },
    

  });

  // Endpoint.Views.Item = Backbone.View.extend({
  //   template: "endpoint/item",
  // 
  //   tagName: "tr",
  // 
  //   serialize: function() {
  //     console.log(this.model);
  //     return { model: this.model };
  //   },
  // 
  //   afterRender: function() {
  //     this.servicesTooltip();
  //     this.responsesTooltip();
  //   },
  //   
  //   servicesTooltip: function() {
  //     var tooltip = "Server response: " + this.model.get('ping').services.response_time + 'ms';
  //     this.$(".services-info").tooltip({title: tooltip});    
  //   },
  //   
  //   responsesTooltip: function() {
  //     var tooltip = "Server response: " + this.model.get('ping').requests.response_time + 'ms';
  //     this.$(".requests-info").tooltip({title: tooltip});    
  //   },
  //   
  // });
  // 
  // Endpoint.Views.List = Backbone.View.extend({   
  //   template: "endpoint/list",
  // 
  //   serialize: function() {
  //     return { collection: this.collection };
  //   },
  // 
  //   beforeRender: function(manage) {
  //     this.collection.each(function(endpoint) {
  //       this.insertView("tbody", new Endpoint.Views.Item({
  //         model: endpoint
  //       }));
  //     }, this);
  //   },
  // 
  //   initialize: function() {
  //     this.collection.on("reset", this.render, this);
  //   }
  // });
  // 
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
( function() {

  var includes = {}; // Setup container for all the includes we'll be using in node.

  includes.express = require("express");
  includes.app = includes.express();
  includes.http = require("http").Server(includes.app);
  includes.io = require("socket.io")(includes.http);
  includes.fs = require("fs");
  includes.path = require("path");
  includes.bodyParser = require("body-parser");

  includes.apis = require("./includes/api.js");
  includes.appLoader = require("./includes/apploader.js");
  includes.settingsController = require("./includes/settingscontroller.js");
  includes.gameLogic = require("./includes/gamelogic.js");

  var settings = null; //To store our app settings.

  function init() {

    includes.settingsController = includes.settingsController(includes, settings); //Instantiate settings controller

    settings = includes.settingsController.readSettings("settings.json"); //Load settings from settings file.

    if (!settings) { //Exit if settings are not loaded.
      console.log("Error: Couldn't read settings file. ", e);
      console.log("Exiting... ");
      process.exit(1);
    }

    includes.app.set('json spaces', settings.outputs.jsonSpaces); // For easier reading. Set this to 0 in the settings.json file to disable

  }

  function setupApps() {

    includes.appLoader(includes, settings).init(); //This scans the apps/ directory and loads them into the node router.

  }

  function startServer() { // This code starts the HTTP and websocket listener
    includes.http.listen(settings.servePort, function() {
      console.log("");
      console.log(Math.round(new Date().getTime()/1000).toString(), " | startServer(): Listening on *:", settings.servePort);
      console.log("");
      console.log("-----------------");
      console.log("");
    });
  }

  function setupAPIEndPoints() { // This sets up express to use certain plugins that allow for JSON parsing among others
    includes.app.use(includes.bodyParser.urlencoded({ extended: true }));
    includes.app.use(includes.bodyParser.json());
    includes.apis = includes.apis(includes, settings);
    includes.apis.init();
  }

  function startGame() {
    includes.gameLogic = includes.gameLogic(includes, settings);
    includes.gameLogic.init();
    includes.gameLogic.startGameTimer();
  }


  init();
  setupApps();
  setupAPIEndPoints();
  startServer();

  startGame();

})();

module.exports = {};

// This file handles the REST and websocket endpoints.

//var appLoader = require("./apploader.js");

var endPoints = function(includes, settings) {

  var connectedSockets = [];

  this.initREST = function() {

    console.log(Math.round(new Date().getTime()/1000).toString(), " | endPoints::setupAPIEndPoints(): Loading API Endpoints");

    var sendStr = null;

    includes.app.get('/', function(req, res) {  // Default route
      sendStr = '';
      sendStr += "REST API Endpoints: \n";
      sendStr += " [GET] \t \t /test \t \t \t - Sends a test response \n";
      sendStr += " [GET] \t \t /apps \t \t \t - List apps \n";
      sendStr += " [GET] \t \t /apps/* \t \t - Top level directory for apps. \n";
      sendStr += " [GET | POST] \t /settings \t \t - Update/retrieve settings \n";

      sendStr += "\n";
      sendStr += "\n";
      sendStr += "Websocket API Endpoints: \n";
      sendStr += " 'test' \t \t \t - Replies with sent payload. \n";
      sendStr += " 'server.socket.status' \t - Get list of connected websocket clients. \n";
      sendStr += " 'changeScreen' \t \t - Make a view change status from payload (Can specify one or all). \n";
      sendStr += " 'updateServerSettings' \t - Make the server reload the settings file. \n";
      sendStr += " 'updateScreenSettings' \t - Make views reload their settings (Can specify one or all). \n";

      res.header("Content-Type", "text/plain");
      res.status(200);
      res.send(sendStr);
    });
    console.log("  /");

    includes.app.get('/apps', function(req, res) {
      var appsList = includes.appLoader(includes, settings).getDirectories(settings.servingAppsPath);
      sendStr = {"appsList": appsList}
      res.status(200);
      res.json(sendStr);
    });
    console.log("  /apps");

    includes.app.get('/test', function(req, res) {
      sendStr = {'test':'test'}
      res.status(200);
      res.json(sendStr);
    });
    console.log("  /test");


    includes.app.get('/settings', function(req, res) {
      res.status(200);
      res.json(settings);
    });

    includes.app.post('/settings', function(req, res) {
      try {
        settings = JSON.parse(JSON.stringify(req.body));
      } catch (e) {
        console.log(Math.round(new Date().getTime()/1000).toString(), " | endPoints::initREST() [POST: settings] Error: Couldn't read new settings: ", e);
        return false;
      }

      includes.settingsController.updateSettings(req.body);
      res.status(200);
      res.json(settings);
    });
    console.log("  /settings");

  }

  this.initSockets = function() {
    includes.io.on('connection', function(socket) {
      connectedSockets.push(socket.id);
      socket.emit("connection"); // Some clients are not triggering locally when they have connected. This ensures they do.

      console.log(Math.round(new Date().getTime()/1000).toString(), " | endPoints::initSockets() [Connected]: Websocket connection established to: ", socket.handshake.address, "  from URL:", socket.request.headers.referer);

      socket.on('disconnect', function() {
        var socketIndex = connectedSockets.indexOf(socket.id);
        if (socketIndex > -1) {
          connectedSockets.splice(socketIndex, 1);
          console.log(Math.round(new Date().getTime()/1000).toString(), " | endPoints::initSockets() [Disconected]: Websocket connection terminated with: ", socket.handshake.address);
        } else {
          console.log(Math.round(new Date().getTime()/1000).toString(), " | endPoints::initSockets() [Disconected]: Websocket connection terminated with, but couldn't find client in socket list: ", socket.handshake.address);
        }

      });

      socket.on('test', function(payload) {
        console.log(Math.round(new Date().getTime()/1000).toString(), " | endPoints::initSockets() [Test]: Websocket test command with", socket.handshake.address, "  ", payload);
        socket.emit('test', {"test":payload} );
      });

      socket.on('server.socket.status', function() {
        socket.emit('server.socket.status',  {
          "socketClientCount" : connectedSockets.length,
          "webClientReferrer" : socket.request.headers.referer
        });
      });

      socket.on('requestGame', function(){
        socket.emit('requestGameACK', {
          "objGame" : includes.gameLogic.getGameState()
        });
      });

      socket.on('updateServerSettings', function(payload) {
        console.log(Math.round(new Date().getTime()/1000).toString(), " | endPoints::initSockets() [updateServerSettings]: Command from ", socket.handshake.address, "  - ", payload);
        if (payload) {
          if (payload.settingsFile) {
            settings = includes.settingsController.readSettings(payload.settingsFile);
            return true;
          }
        }
        settings = includes.settingsController.readSettings("settings.json");
      });

    });

    console.log(Math.round(new Date().getTime()/1000).toString(), " | endPoints::initSockets()");

  };

  this.createGame = function(payload) {
    includes.io.emit('createGame', {
      "objGame" : includes.gameLogic.getGameState()
    });
  };

  this.updateClientGames = function(payload) {
    includes.io.emit('incomingUpdate', {
      "objGame" : includes.gameLogic.getGameState()
    });
  };

  this.init = function() {
    this.initREST();
    this.initSockets();
    console.log(Math.round(new Date().getTime()/1000).toString(), " | endPoints::setupAPIEndPoints(): Completed");
    console.log("");
  };

  return this;

};

module.exports = endPoints;

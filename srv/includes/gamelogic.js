module.exports = {};

var gameLogic = function(includes, settings) {

  var gamePaused = false;
  var objTimer = null;

  var gameObjects = [];

  var gameState = null;
  var gameUpdating = false;
  var gameLastUpdate = -1;
  var lastExecTime = 0;

  var clientGameState = {};

  this.init = function() {

    clientGameState = {
      "gameObjects":gameObjects,
      "gameState":"0"
    };

    gameState = "1";

    console.log(Math.round(new Date().getTime()/1000).toString(), " | gameLogic::init(): Completed");
    console.log("");
  };

  this.startGameTimer = function() {
    gameLastUpdate = new Date().getMilliseconds();
    objTimer = setTimeout(function() { includes.gameLogic.updateGame(); }, settings.gameTickRate);
  };

  this.getGameState = function() {
    return clientGameState;
  };

  this.changeGamePauseState = function(pausedState) {
    pausedState = (pausedState == null || pausedState === undefined ? false : pausedState);
    pausedState = gamePaused;
    console.log(Math.round(new Date().getTime()/1000).toString(), " | gameLogic::changeGamePauseState(): Pause State Change:", pausedState);
  };

  this.updateGame = function() {
    //Main Game Loop

    var timeNow = 0;

    includes.apis.updateClientGames(clientGameState); // Push latest frame to clients.

    if (gameUpdating) {
      if (settings.warnGameTickOverlap) {
        console.log(Math.round(new Date().getTime()/1000).toString(), " | gameLogic::updateGame(): Warning: Game ticks are attempting to overlap! Slow down the tickrate to avoid skipping. (Tick Rate: ", settings.gameTickRate, ", Exec Epoch:", lastExecTime, "). (State:", gameState, ")");
      }
      gameUpdating = false;

      process.nextTick(function(){ // Give the process time to catch up by skipping a tick.
        if (!gamePaused) {
          objTimer = setTimeout(includes.gameLogic.updateGame, settings.gameTickRate);
        }
      });

      return false;
    } else {
      gameUpdating = true;
    }

    if (!gamePaused) {
      objTimer = setTimeout(includes.gameLogic.updateGame, settings.gameTickRate);
    }

    if (gameState == "1") {
      console.log(Math.round(new Date().getTime()/1000).toString(), " | gameLogic::updateGame(): Initiating... (State:", gameState, ")");

      gameState = "2";

      includes.gameLogic.createSpaceGame();

      console.log(Math.round(new Date().getTime()/1000).toString(), " | gameLogic::updateGame(): Initiation Complete (Tick Rate: ", settings.gameTickRate, "). (State:", gameState, ")");

    } else if (gameState == "2") {

      function updatePhysics() {
        // The redraw efficiency could greatly be increased if the list of stars is not calculated each frame and instead calculated once at the start, but this allows for adjusting the amount of stars dynamically if new stars are push to the object list.
        var gameStars = getGameObject("star", gameObjects);

        function moveStars(gameStars, ratioAmount) {
          for (var i = 0; i < gameStars.length; i++) {

            // Workout distance deltas based off time, velocity and angle.
            var dX = (((Math.cos(gameStars[i].gameProperties.vector.angle * Math.PI / 180) * (gameStars[i].gameProperties.vector.velocity * ratioAmount)) + gameStars[i].x) - gameStars[i].x);
            var dY = (((Math.sin(gameStars[i].gameProperties.vector.angle * Math.PI / 180) * (gameStars[i].gameProperties.vector.velocity * ratioAmount)) + gameStars[i].y) - gameStars[i].y);

            if (clientGameState.gameState == "1") {
              var minXCreateStar = (borderBufferZone * -1);
              var maxXCreateStar = (settings.game.worldSize[0] + borderBufferZone);
              var minYCreateStar = (borderBufferZone * -1);
              var maxYCreateStar = (settings.game.worldSize[1] + borderBufferZone);

              var starPositionX = Math.floor((Math.random() * (maxXCreateStar - minXCreateStar)) + minXCreateStar);
              var starPositionY = Math.floor((Math.random() * (maxYCreateStar - minYCreateStar)) + minYCreateStar);

              // If the stars go too far outside of the view area.
              if (gameStars[i].x > settings.game.worldSize[0] + borderBufferZone) {
                gameStars[i].x = starPositionX;
                gameStars[i].y = starPositionY;
              } else if (gameStars[i].x < -borderBufferZone) {
                gameStars[i].x = starPositionX;
                gameStars[i].y = starPositionY;
              } else if (gameStars[i].y < -borderBufferZone) {
                gameStars[i].x = starPositionX;
                gameStars[i].y = starPositionY;
              } else if (gameStars[i].y > settings.game.worldSize[1] + borderBufferZone) {
                gameStars[i].x = starPositionX;
                gameStars[i].y = starPositionY;
              }

              var newStarDistance = Math.sqrt((gameStars[i].x - mouseCoords[0]) * (gameStars[i].x - mouseCoords[0]) + (gameStars[i].y - mouseCoords[1]) * (gameStars[i].y - mouseCoords[1]));
              var newAngle = ((Math.atan2(mouseCoords[1] - gameStars[i].y, mouseCoords[0] - gameStars[i].x) * 180) / Math.PI);

              // Centre screen warping
              // var newStarDistance = Math.sqrt((gameStars[i].x - (gameDimensions[0] / 2)) * (gameStars[i].x - (gameDimensions[0] / 2)) + (gameStars[i].y - (gameDimensions[1] / 2)) * (gameStars[i].y - (gameDimensions[1] / 2)));
              // var newAngle = ((Math.atan2((gameDimensions[1] / 2) - gameStars[i].y, (gameDimensions[0] / 2) - gameStars[i].x) * 180) / Math.PI);

              gameStars[i].gameProperties.vector.velocity = gameStars[i].gameProperties.distance * newStarDistance * 0.02;
              gameStars[i].gameProperties.vector.angle = newAngle + 180;

            } else {

              // If the stars go too far outside of the view area, warp them back around, and add how far they had moved ontop of the new location.
              if (gameStars[i].x > settings.game.worldSize[0] + borderBufferZone) {
                gameStars[i].x = ((borderBufferZone * -1) + dX);
              } else if (gameStars[i].x < -borderBufferZone) {
                gameStars[i].x = ((settings.game.worldSize[0] + borderBufferZone) - dX);
              } else if (gameStars[i].y < -borderBufferZone) {
                gameStars[i].y = ((settings.game.worldSize[1] + borderBufferZone) - dY);
              } else if (gameStars[i].y > settings.game.worldSize[1] + borderBufferZone) {
                gameStars[i].y = ((borderBufferZone * -1) + dY);
              }

            }

            // Move stars
            gameStars[i].x += dX;
            gameStars[i].y += dY;

          }
        }

        timeNow = (timeNow < 1 ? timeNow = new Date().getTime() : timeNow);
        var newDistanceRatio = ((timeNow - gameLastUpdate) / 1000);

        moveStars(gameStars, newDistanceRatio);

      }

      function getGameObject(gameClass, objectList) {
        var filteredObjectList = [];
        for (objectIndex in objectList) {
          if (objectList[objectIndex].gameProperties.class === gameClass) {
            (function(objectToAdd){
              filteredObjectList.push(objectToAdd);
            })(objectList[objectIndex]);
          }
        }

        return filteredObjectList;
      }

      updatePhysics();

    }

    // for (var i = 0; i < 100000; i++) { // Simulate some load
    //   (function(j) {
    //     var x=j;
    //   })(i);
    // }

    // We need to check server time after the timer has been set, to avoid the date functions using lots of resources.
    timeNow = (timeNow < 1 ? timeNow = new Date().getTime() : timeNow);

    var execTime = (timeNow - gameLastUpdate);

    if ((execTime - settings.gameTickRate) > settings.gameTickRate) {
      gameUpdating = true;
      lastExecTime = execTime;
    } else {
      gameUpdating = false;
    }

    gameLastUpdate = timeNow;

  };

  this.createSpaceGame = function() {

    createStars(gameObjects, settings.game.stars.minimumStars, settings.game.stars.maximumStars);

    includes.apis.createGame(clientGameState);

    function createStars(objectList, minimumStars, maximumStars, minStarDistance, maxStarDistance) {

      maximumStars = (!maximumStars || maximumStars < 0 ? 200 : maximumStars);
      minimumStars = (!minimumStars || minimumStars < 0 || minimumStars > maximumStars ? maximumStars - 1 : minimumStars);

      borderBufferZone = settings.game.borderBufferZone;

      var initialStarCount = Math.floor((Math.random() * (maximumStars - minimumStars)) + minimumStars);

      for (var i = 0; i < initialStarCount; i++) {
        var minXCreateStar = (borderBufferZone * -1);
        var maxXCreateStar = (settings.game.worldSize[0] + borderBufferZone);
        var minYCreateStar = (borderBufferZone * -1);
        var maxYCreateStar = (settings.game.worldSize[1] + borderBufferZone);

        var starPositionX = Math.floor((Math.random() * (maxXCreateStar - minXCreateStar)) + minXCreateStar);
        var starPositionY = Math.floor((Math.random() * (maxYCreateStar - minYCreateStar)) + minYCreateStar);
        var starPositionZ = ((Math.random() * 50) + 0.01);
        var starSize = ((Math.random() * 2.01) + 0.01);
        var randomAngle = ((Math.random() * 359) + 0);

         // Workout 3 numbers between 0 and 255, and concatenate them together for the color of a star
        var starColor = "#" + Math.floor((Math.random() * 255) + 1).toString(16) + Math.floor((Math.random() * 255) + 1).toString(16) + Math.floor((Math.random() * 255) + 1).toString(16);

        var newStar = {
          "x":starPositionX,
          "y":starPositionY,
          "r":starSize,
          "shape":"arc",
          "gameProperties": {
            "class":"star",
            "color":starColor,
            "starSize":starSize,
            "distance":starPositionZ,
            "vector": {
              "angle":randomAngle,
              "velocity":starPositionZ
            }
          },

          "visible":true
        }

        objectList.push(newStar);
      }

      console.log(Math.round(new Date().getTime()/1000).toString(), " | gameLogic::createGame(): Completed");

    }
  };

  return this;

};

module.exports = gameLogic;

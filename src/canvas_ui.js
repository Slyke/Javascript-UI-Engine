/*
  By: Steven Lawler (Slyke)
  Email: steven.lawler777@gmail.com
  Creation Date: 21/09/2014
  Version: 1.2a
  Description:
    This is a simple canvas control class for Javascript. This class can be used as an instantiated object or as a singleton.
  Example Usage:
    //------ Code
      var canvasControl = new CanvasControl(); //Create the class
      var c = document.getElementById("canvasDraw"); //Get the canvas as an object.
      objCanvas=canvasControl.setupCanvas(c); //Setup the canvas for drawing.
      c.addEventListener('click', function(e) { //Add click event listener.
        canvasControl.mouseEventHandler(e, "Click");
      });
      c.addEventListener('mousemove', function(e) { //Add mouse move event listener.
        canvasControl.mouseEventHandler(e, "Move");
      });
      var newSquare = { //Create a new object
        "x":50,
        "y":50,
        "w":250,
        "h":250,
        "shape":"rect", //This lets the click and mouse move handler know what type of object it is.
        "render":function(self) {
          canvasControl.drawSquare(self.x, self.y, self.w, self.h);
        },
        "clickEvent":function(x, y, self) {
          console.log(x, y, self, "click");
        },
        "moveEvent":function(x, y, self) {
          console.log(x, y, self, "move");
        },
        "visible":true
      }
      canvasControl.canvasObjects.push(newSquare); //Add object to object list
      canvasControl.refreshScreen(); //Redraw screen.
    //------ Code
    
    License:
    The MIT License (MIT)

      Copyright (c) 2014 Steven Lawler (Slyke)

      Permission is hereby granted, free of charge, to any person obtaining a copy
      of this software and associated documentation files (the "Software"), to deal
      in the Software without restriction, including without limitation the rights
      to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
      copies of the Software, and to permit persons to whom the Software is
      furnished to do so, subject to the following conditions:

      The above copyright notice and this permission notice shall be included in
      all copies or substantial portions of the Software.

      THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
      IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
      FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
      AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
      LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
      OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
      THE SOFTWARE.
    
  */ 

var CanvasControl = function() {

  defaultBackgroundObject= {
    "backgroundColor":"#FFFFFF"
  };
  
  debugConsole=511; //Setting to 2048 turns on all debug messages for all functions. 511 for all but mouse events.
  
  canvasContext=null;
  canvasObject=null;
  canvasObjects=[];
  
  Math.TAU = (2 * Math.PI); //Add in Tau compatibility
  
  /*
    setupCanvas() sets up the canvas area for drawing.
    You must provide the canvas object from the DOM.
    You can optionally provide an object list, an empty one will be created if you don't.
    It returns the canvas context once it's completed.
    You can also use CanvasControl.canvasContext for the canvas if you want to use this as a singleton once this function executes.
  // */
  this.setupCanvas = function(objCanvas, objectList) {
    objectList = (objectList === undefined || objectList == null ? this.canvasObjects : objectList);
    this.canvasObject = objCanvas;
    objectList=[];
    objectList.push();
    this.canvasObjects = objectList;
    this.canvasContext = objCanvas.getContext("2d");
    if (debugConsole & 1) {console.log("setupCanvas(objCanvas, objectList): ", objCanvas, objectList);}
    return this.canvasContext;
  };
  
  /*
    renderObjects() cycles through each object and runs its render function.
    You can optionally provide an object list, it will use the class's list if you don't
    It returns true when completed.
  // */
  this.renderObjects = function(objectList) {
    objectList = (objectList === undefined || objectList == null ? this.canvasObjects : objectList);
    this.clearCanvas();
    for (canvasObject in objectList) {
      if (objectList[canvasObject].visible!==undefined && objectList[canvasObject].visible!=null) {
        if (objectList[canvasObject].visible!=false) {
          objectList[canvasObject].render(objectList[canvasObject]);
        }
      }
    }
    if (debugConsole & 2) {console.log("renderObjects(objectList): ", objectList);}
    return true;
  };
  
  /*
    drawSquare() will draw a square to the canvas.
    You can optionally pass in the x, y, width, and height of the square of you want. They default to 0.
    The render type is a canvas context function that specifies if the square is filled, or just the border is drawn.
    The context is optional and is what it will be drawing to. If it's null, or not specified, it will use the one from the class.
    Style is another optional parameter that allows the fill color, the line thickness and the line color to be specified.
  // */
  this.drawSquare = function (x, y, w, h, renderType, context, style) {
    context = (context === undefined || context == null ? this.canvasContext : context);
    x = (x === undefined || x == null || x == "" ? 0 : x);
    y = (y === undefined || y == null || y == "" ? 0 : y);
    w = (w === undefined || w == null || w == "" ? 0 : w);
    h = (h === undefined || h == null || h == "" ? 0 : h);
    originalFillStyle = context.fillStyle;
    if (style!==undefined && style!=null) {
      style.fillStyle = (style.fillStyle === undefined ? "000000" : style.fillStyle);
      style.strokeStyle = (style.strokeStyle === undefined ? "000000" : style.strokeStyle);
      style.lineWidth = (style.lineWidth === undefined ? "1" : style.lineWidth);
    }
    renderType = (renderType === undefined || renderType == null ? function(){ context.stroke(); } : renderType);
    if (style!==undefined && style!=null) {
      context.fillStyle=(style.fillStyle===undefined || style.fillStyle==null ? context.fillStyle : style.fillStyle);
      context.strokeStyle=(style.strokeStyle===undefined || style.strokeStyle==null ? context.strokeStyle : style.strokeStyle);
      context.lineWidth=(style.lineWidth===undefined || style.lineWidth==null ? context.lineWidth : style.lineWidth);
    }
    context.beginPath();
    context.rect(x, y, w, h);
    renderType();
    context.closePath();
    context.fillStyle=originalFillStyle;
    if (debugConsole & 4) {console.log("drawSquare(x, y, w, h, renderType, context, style): ", x, y, w, h, renderType, context, style);}
  };
  
    /*
      drawText() will write text to the canvas.
      You can optionally pass in the x and y of the text of you want. They default to 0.
      You can also optionally set the width and height of the text of you want. It will be calclated for you if you don't (based off text size).
      You should pass in the text object that you are drawing into self, so that it can determine heights, and apply some styles.
      The renderText the canvas context function that will draw the text to the canvas. You can choose between context.fillText() and context.strokeText().
      The context is optional and is what it will be drawing to. If it's null, or not specified, it will use the one from the class.
      Style is another optional parameter that allows the fill color, the font, text base line, max width and the text stroke color to be specified.
    // */
    this.drawText = function (x, y, text, self, renderText, context, style) {
      context = (context === undefined || context == null ? this.canvasContext : context);
      x = (x === undefined || x == null || x == "" ? 0 : x);
      y = (y === undefined || y == null || y == "" ? 0 : y);
      self.w = (self.w === undefined || self.w == null || self.w == "" ? context.measureText(text).width : self.w);
      self.h = (self.h === undefined || self.h == null || self.h == "" ? context.measureText(text).height : self.h);
      originalFillStyle = context.fillStyle;
      if (style!==undefined && style!=null) {
        context.fillStyle=(style.fillStyle===undefined || style.fillStyle==null ? context.fillStyle : style.fillStyle);
        context.strokeStyle=(style.strokeStyle===undefined || style.strokeStyle==null ? context.strokeStyle : style.strokeStyle);
        style.textBaseline = (style.textBaseline === undefined ? "hanging" : style.textBaseline);
        style.font = (style.font === undefined ? "" : style.font);
        style.maxWidth = (style.maxWidth === undefined ? null : style.maxWidth);
      } else {
        style={};
      }
      renderText = (renderText === undefined || renderText == null ? function(x, y, text, maxWidth){ context.fillText(text, x, y); } : renderText);
      if (style!==undefined && style!=null) {
        context.fillStyle=(style.fillStyle===undefined || style.fillStyle==null ? context.fillStyle : style.fillStyle);
        context.strokeStyle=(style.strokeStyle===undefined || style.strokeStyle==null ? context.strokeStyle : style.strokeStyle);
        context.textBaseline = (style.textBaseline === undefined ? context.textBaseline : style.textBaseline);
        context.font = (style.font === undefined ? context.font : style.font);
        style.maxWidth = (style.maxWidth === undefined ? context.maxWidth : style.maxWidth);
      }
      context.beginPath();
      renderText(x, y, text, style.maxWidth);
      context.closePath();
      context.fillStyle=originalFillStyle;
      if (debugConsole & 8) {console.log("drawText(x, y, text, renderText, context, style): ", x, y, text, renderText, context, style);}
    };
    
  /*
    drawArc() will draw an arc to the canvas. Tau (2 * PI) will draw a full circle.
    You can optionally pass in the x, y, s, r and f of the arc of you want. They default to 0.
    x and y is the position of the centre point of the arc. s and f are the starting and finishing angle of the arc (0 and Tau is a full circle).
    The render type is a canvas context function that specifies if the square is filled, or just the border is drawn.
    The context is optional and is what it will be drawing to. If it's null, or not specified, it will use the one from the class.
    Style is another optional parameter that allows the fill color, the line thickness and the line color to be specified.
  // */
  this.drawArc = function (x, y, r, s, f, renderType, context, style) {
    context = (context === undefined || context == null ? this.canvasContext : context);
    x = (x === undefined || x == null || x == "" ? 0 : x);
    y = (y === undefined || y == null || y == "" ? 0 : y);
    s = (s === undefined || s == null || s == "" ? 0 : s);
    r = (r === undefined || r == null || r == "" ? 0 : r);
    f = (f === undefined || f == null || f == "" ? 2 * Math.PI : f);
    originalFillStyle = context.fillStyle;
    if (style!==undefined && style!=null) {
      style.fillStyle = (style.fillStyle === undefined ? "000000" : style.fillStyle);
      style.strokeStyle = (style.strokeStyle === undefined ? "000000" : style.strokeStyle);
      style.lineWidth = (style.lineWidth === undefined ? "1" : style.lineWidth);
    }
    renderType = (renderType === undefined || renderType == null ? function(){ context.stroke(); } : renderType);
    if (style!==undefined && style!=null) {
      context.fillStyle=(style.fillStyle===undefined || style.fillStyle==null ? context.fillStyle : style.fillStyle);
      context.strokeStyle=(style.strokeStyle===undefined || style.strokeStyle==null ? context.strokeStyle : style.strokeStyle);
      context.lineWidth=(style.lineWidth===undefined || style.lineWidth==null ? context.lineWidth : style.lineWidth);
    }
    context.beginPath();
    context.arc(x, y, r, s, f);
    renderType();
    context.closePath();
    context.fillStyle=originalFillStyle;
    if (debugConsole & 16) {console.log("drawArc(x, y, r, s, f, renderType, context, style): ", x, y, r, s, f, renderType, context, style);}
  };
  
  /*
    drawLine() will draw a line between 2 points.
    You can optionally pass in the x1, y1, x2, y2. They default to 0.
    The render type is a canvas context function that specifies if the square is filled, or just the border is drawn.
    The context is optional and is what it will be drawing to. If it's null, or not specified, it will use the one from the class.
    Style is another optional parameter that allows the line thickness and the line color to be specified.
  // */
  this.drawLine = function (x1, y1, x2, y2, context, style) {
    context = (context === undefined || context == null ? this.canvasContext : context);
    x1 = (x1 === undefined || x1 == null || x1 == "" ? 0 : x1);
    y1 = (y1 === undefined || y1 == null || y1 == "" ? 0 : y1);
    x2 = (x2 === undefined || x2 == null || x2 == "" ? 0 : x2);
    y2 = (y2 === undefined || y2 == null || y2 == "" ? 0 : y2);
    originalFillStyle = context.fillStyle;
    if (style!==undefined && style!=null) {
      style.strokeStyle = (style.strokeStyle === undefined ? "000000" : style.strokeStyle);
      style.lineWidth = (style.lineWidth === undefined ? "1" : style.lineWidth);
    }
    if (style!==undefined && style!=null) {
      context.strokeStyle=(style.strokeStyle===undefined || style.strokeStyle==null ? context.strokeStyle : style.strokeStyle);
      context.lineWidth=(style.lineWidth===undefined || style.lineWidth==null ? context.lineWidth : style.lineWidth);
    }
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.closePath();
    context.fillStyle=originalFillStyle;
    if (debugConsole & 32) {console.log("drawLine(x1, y1, x2, y2, context, style): ", x1, y1, x2, y2, context, style);}
  };
  
  
  /*
    drawPolygon() will draw a polygon from a list.
    polygonPoints is an array of 2 points, X and Y in that order. For example: [[25, 30], [12, 50], [12, 65], ... [X, Y]]
    autoArrange will order the polygon list so that it is a single point. It calculates this using the Graham Scan algorithm.
    The render type is a canvas context function that specifies if the square is filled, or just the border is drawn.
    The context is optional and is what it will be drawing to. If it's null, or not specified, it will use the one from the class.
    Style is another optional parameter that allows the line thickness and the line color to be specified.
  // */
  this.drawPolygon = function (polygonPoints, autoArrange, renderType, context, style) {
    context = (context === undefined || context == null ? this.canvasContext : context);
    x1 = (x1 === undefined || x1 == null || x1 == "" ? 0 : x1);
    y1 = (y1 === undefined || y1 == null || y1 == "" ? 0 : y1);
    x2 = (x2 === undefined || x2 == null || x2 == "" ? 0 : x2);
    y2 = (y2 === undefined || y2 == null || y2 == "" ? 0 : y2);
    autoArrange = (autoArrange === undefined || autoArrange == null || autoArrange == "" ? true : autoArrange);
   originalFillStyle = context.fillStyle;
    if (style!==undefined && style!=null) {
      style.fillStyle = (style.fillStyle === undefined ? "000000" : style.fillStyle);
      style.strokeStyle = (style.strokeStyle === undefined ? "000000" : style.strokeStyle);
      style.lineWidth = (style.lineWidth === undefined ? "1" : style.lineWidth);
    }
    renderType = (renderType === undefined || renderType == null ? function(){ context.stroke(); } : renderType);
    if (style!==undefined && style!=null) {
      context.fillStyle=(style.fillStyle===undefined || style.fillStyle==null ? context.fillStyle : style.fillStyle);
      context.strokeStyle=(style.strokeStyle===undefined || style.strokeStyle==null ? context.strokeStyle : style.strokeStyle);
      context.lineWidth=(style.lineWidth===undefined || style.lineWidth==null ? context.lineWidth : style.lineWidth);
    }
    
    if (autoArrange) {
      polygonPoints = arrangePolygons(polygonPoints);
    }
    
    context.beginPath();
    context.moveTo(polygonPoints[0][0], polygonPoints[0][1]);
    for (var i = 1; i < polygonPoints; i++) {
      context.lineTo(polygonPoints[i][0], polygonPoints[i][0]);
    }
    context.closePath();
    context.fillStyle=originalFillStyle;
    if (debugConsole & 32) {console.log("drawLine(x1, y1, x2, y2, renderType, context, style): ", x1, y1, x2, y2, renderType, context, style);}
  };
  
  
    /*
      drawImage() will draw an image to the canvas. The image drawn can be an image, canvas, or video.
      srcImage is the source of the image.
      You can optionally pass in the x, y. They default to 0.
      If w, h, are not specified, they will default to the specified image's dimensions.
      If sx, sy, sw, sh are not specified, they will default to null.
      The sx and sy parameters are for clipping the source image (the top left of the source image).
      The sw and sh parameters are for clipping the source image (the width and height that should be grabbed, from sx and sy).
      These can be used to scale the image.
      The context is optional and is what it will be drawing to. If it's null, or not specified, it will use the one from the class.
      
      Note:
        If a width and height is not specified in the image object, then the mouse events will not fire.
    // */
    this.drawImage = function (srcImage, x, y, w, h, sx, sy, sw, sh, context) {
      context = (context === undefined || context == null ? this.canvasContext : context);
      x = (x === undefined || x == null || x == "" ? 0 : x);
      y = (y === undefined || y == null || y == "" ? 0 : y);
      w = (w === undefined ? srcImage.width : w);
      h = (h === undefined ? srcImage.height : h);
      sx = (h === undefined ? null : sx);
      sy = (h === undefined ? null : sy);
      sw = (h === undefined ? null : sw);
      sh = (h === undefined ? null : sh);
      originalFillStyle = context.fillStyle;
      srcImage.objImage.onload = function() {
        srcImage.w = (srcImage.w <= 0 ? srcImage.objImage.width : srcImage.w);
        srcImage.h = (srcImage.h <= 0 ? srcImage.objImage.height : srcImage.h);
        context.beginPath();
        if (sx == null && sy == null && sw == null && sh == null) {
          context.drawImage(srcImage.objImage, x, y);
        } else {
          context.drawImage(srcImage.objImage, sx, sy, sw, sh, x, y, w, h);
        }
        context.closePath();
      }
      context.fillStyle=originalFillStyle;
      if (debugConsole & 64) {console.log("drawImage(srcImage, x, y, w, h, sx, sy, sw, sh, context): ", srcImage, x, y, w, h, sx, sy, sw, sh, context);}
    };
    
  /*
    clearCanvas() will draw over the entire canvas with a specified color.
    If a background color is not supplied, it will use defaultBackgroundObject.backgroundColor. If this is also not specified, it defaults to #FFFFFF
    The context is optional and is what it will be drawing to. If it's null, or not specified, it will use the one from the class.
  // */
  this.clearCanvas = function(backgroundColor, context) {
    context = (context === undefined || context == null ? this.canvasContext : context);
    originalFillStyle = context.fillStyle;
    if (defaultBackgroundObject!==undefined && defaultBackgroundObject!=null) {
      backgroundColor = (backgroundColor === undefined || backgroundColor == null ? defaultBackgroundObject.backgroundColor : backgroundColor);
    } else {
      backgroundColor = (backgroundColor === undefined || backgroundColor == null ? "#FFFFFF" : backgroundColor);
    }
    this.drawSquare(0, 0, this.canvasObject.width, this.canvasObject.height, function(){ context.fill(); }, context, {"fillStyle":defaultBackgroundObject.backgroundColor});
    context.fillStyle=originalFillStyle;
    console.log("Cleared Canvas: ", this.canvasObject.width, this.canvasObject.height);
    if (debugConsole & 128) {console.log("clearCanvas(backgroundColor, context): ", backgroundColor, context);}
  };
  
  /*
    refreshScreen() will clear the canvas using clearCanvas() and then redraw all objects. This is used as an update.
    You must call this function each time you add, remove to change an object if you want to see the changes.
    Both context and objectList are optional and will default to the class's if not specified.
  // */
  this.refreshScreen = function(context, objectList) {
    context = (context === undefined || context == null ? this.canvasContext : context);
    objectList = (objectList === undefined || objectList == null ? this.canvasObjects : objectList);
    this.clearCanvas(context);
    this.renderObjects(objectList);
    if (debugConsole & 256) {console.log("refreshScreen(context, objectList): ", context, objectList);}
  };
  
  /*
    mouseEventHandler() will run checkMouseCollision() to determine which object the mouse is over, and then execute all objects in that list.
    This function should be called from the JavaScript event listeners.
    You can optionally pass the object list. If you don't the class' one will be used.
  // */
  this.mouseEventHandler = function(e, eventType, objectList) {
    objectList = (objectList === undefined || objectList == null ? this.canvasObjects : objectList);
    var clickObject = null;
    triggedObjectList = this.checkMouseCollision(e.offsetX, e.offsetY);
    for (var triggeredObject in triggedObjectList) {
      if (triggedObjectList[triggeredObject]!=null) {
        if (eventType=="Click") {
          if (triggedObjectList[triggeredObject].clickEvent!==undefined && triggedObjectList[triggeredObject].clickEvent!=null) {
            if (triggedObjectList[triggeredObject].enabled !== undefined && triggedObjectList[triggeredObject].enabled != null) {
              if (triggedObjectList[triggeredObject].enabled == true) {
                triggedObjectList[triggeredObject].clickEvent(e.offsetX, e.offsetY, triggedObjectList[triggeredObject]);
              }
            } else {
              triggedObjectList[triggeredObject].clickEvent(e.offsetX, e.offsetY, triggedObjectList[triggeredObject]);
            }
          }
        } else if (eventType=="Move") {
          if (triggedObjectList[triggeredObject].moveEvent!==undefined && triggedObjectList[triggeredObject].moveEvent!=null) {
            if (triggedObjectList[triggeredObject].enabled !== undefined && triggedObjectList[triggeredObject].enabled != null) {
              if (triggedObjectList[triggeredObject].enabled == true) {
                triggedObjectList[triggeredObject].moveEvent(e.offsetX, e.offsetY, triggedObjectList[triggeredObject]);
              }
            } else {
              triggedObjectList[triggeredObject].moveEvent(e.offsetX, e.offsetY, triggedObjectList[triggeredObject]);
            }
          }
        }
      }
    }
    if (debugConsole & 512) {console.log("mouseEventHandler(e, eventType, objectList): ", e, eventType, objectList);}
  };
  
  /*
    checkMouseCollision() cycles through a list of objects and determines whether the mouseX and mouseY point is inside that object.
    This function currently doesn't support polygons. Only circles and squares.
    mouseX and mouseY is the point of interest.
    The objectList is optional and the class' default one will be used if it's not specified.
  // */
  this.checkMouseCollision = function(mouseX, mouseY, objectList) {
    objectList = (objectList === undefined || objectList == null ? this.canvasObjects : objectList);
    clickedObjects = [];
    for (var objectIndex in objectList) {
      if (objectList[objectIndex]!=null && typeof objectList[objectIndex]!==undefined) {
        if (objectList[objectIndex].shape!=null && typeof objectList[objectIndex].shape!==undefined) {
          if (objectList[objectIndex].shape=="rect") {
            if ((objectList[objectIndex].x!==undefined && objectList[objectIndex].x!=null) && (objectList[objectIndex].w!==undefined && objectList[objectIndex].w!=null) && (objectList[objectIndex].y!==undefined && objectList[objectIndex].y!=null) && (objectList[objectIndex].h!==undefined && objectList[objectIndex].h!=null) ) {
              if (objectList[objectIndex].x <= mouseX && (objectList[objectIndex].x+objectList[objectIndex].w) >= mouseX && objectList[objectIndex].y <= mouseY && (objectList[objectIndex].y+objectList[objectIndex].h) >= mouseY) {
                clickedObjects.push(objectList[objectIndex]);
              }
            }
          } else if (objectList[objectIndex].shape=="arc") { 
            //Warning: This assume it's a full circle, not an arc.
            if ((objectList[objectIndex].x!==undefined && objectList[objectIndex].x!=null) && (objectList[objectIndex].y!==undefined && objectList[objectIndex].y!=null) && (objectList[objectIndex].r!==undefined && objectList[objectIndex].r!=null)) {
              if (Math.sqrt((mouseX-objectList[objectIndex].x)*(mouseX-objectList[objectIndex].x) + (mouseY-objectList[objectIndex].y)*(mouseY-objectList[objectIndex].y)) < objectList[objectIndex].r) {
                clickedObjects.push(objectList[objectIndex]);
              }
            }
          } else if (objectList[objectIndex].shape=="image") { 
            //Warning: Image height and width must be set for this to work.
            if ((objectList[objectIndex].x!==undefined && objectList[objectIndex].x!=null) && (objectList[objectIndex].w!==undefined && objectList[objectIndex].w!=null) && (objectList[objectIndex].y!==undefined && objectList[objectIndex].y!=null) && (objectList[objectIndex].h!==undefined && objectList[objectIndex].h!=null) ) {
              if (objectList[objectIndex].x <= mouseX && (objectList[objectIndex].x+objectList[objectIndex].w) >= mouseX && objectList[objectIndex].y <= mouseY && (objectList[objectIndex].y+objectList[objectIndex].h) >= mouseY) {
                clickedObjects.push(objectList[objectIndex]);
              }
            }
          } else if (objectList[objectIndex].shape=="text") { 
            //Warning: This treats the text as a rectangle block. Doesn't work if width and height aren't set.
            if ((objectList[objectIndex].x!==undefined && objectList[objectIndex].x!=null) && (objectList[objectIndex].w!==undefined && objectList[objectIndex].w!=null) && (objectList[objectIndex].y!==undefined && objectList[objectIndex].y!=null) && (objectList[objectIndex].h!==undefined && objectList[objectIndex].h!=null) ) {
              if (objectList[objectIndex].x <= mouseX && (objectList[objectIndex].x+objectList[objectIndex].w) >= mouseX && objectList[objectIndex].y <= mouseY && (objectList[objectIndex].y+objectList[objectIndex].h) >= mouseY) {
                clickedObjects.push(objectList[objectIndex]);
              }
            }
          } else if (objectList[objectIndex].shape=="polygon") { 
            // This is based off the algorithm and code from here: http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
            var isInside = false;
            for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
              var xi = vs[i][0];
              var yi = vs[i][1];
              var xj = vs[j][0];
              var yj = vs[j][1];
              
              var intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
              if (intersect) isInside = !isInside;
            }
            if (isInside) {
              clickedObjects.push(objectList[objectIndex]);
            }
          }
        }
      }
    }
      if (debugConsole & 1024) {console.log("checkMouseCollision(mouseX, mouseY, objectList): ", mouseX, mouseY, objectList);}
      return clickedObjects;
  };
  
  
  /*
    This is an internal function that arranges a polygon list so that it is a single shape, instead of being multiple polygons connected up by vertices.
    It calculates a list of coordinates by figuring out the centre of mass and using that as the central point.
  
    // Modified from: http://stackoverflow.com/questions/2855189/sort-latitude-and-longitude-coordinates-into-clockwise-ordered-quadrilateral
  // */
  var arrangePolygons = function (polygonPoints) {
      polygonPoints = polygonPoints.slice(0); // Copy the array, since sort() modifies it
      var avg_points = function(pts) {
          var x = 0;
          var y = 0;
          for(var i = 0; i < pts.length; i++) {
              x += pts[i][0];
              y += pts[i][1];
          }
          return [x / pts.length, y / pts.length];
      }
      var center = avg_points(polygonPoints);

      // Calculate the angle between each point and the centre point, and sort by those angles
      for(var i = 0; i < polygonPoints.length; i++) {
          polygonPoints[i][2] = Math.atan2(polygonPoints[i][0] - center[0], polygonPoints[i][1] - center[1]);
      }

      polygonPoints = polygonPoints.sort(function(p1, p2) {
          return p1[2] - p2[2];
      });
      return polygonPoints;
  };
  
}

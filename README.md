# Javascript-UI-Engine

This was just a simple Javascript library I put together for myself to help make the HTML5 Canvas use objects so that it can be somewhat event driven.

Feel free to use this library and if you find any bugs please let me know and I will fix them.

  Creation Date: 21/09/2014

  URL: https://github.com/Slyke/Javascript-UI-Engine

  NPM: `npm install js-ui-engine`

  Version: `1.20170407.6`

##Description:
    This is a simple canvas control class for Javascript. This class can be used as an instantiated object or as a singleton.

##Example Usage:
```
      var canvasControl = new CanvasControl(); //Create the class
      var c = document.getElementById("canvasDraw"); //Get the canvas as an object.
      objCanvas = canvasControl.setupCanvas(c); //Setup the canvas for drawing.
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
          canvasControl.drawRect(self.x, self.y, self.w, self.h);
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
```

Checkout the examples folder for more.

##License:
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

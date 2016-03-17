
/*
 *  TODO
 *  3. Solver and hints
*/

var ii = {

  currentTimeframe: 0,

  epsilon: 1,
  animationSpeed: 4,

  levelSize: 4,
  tempPointId: null,

  height: 480,
  width: 320,
  ratio: null,

  currentWidth: null,
  currentHeight: null,

  canvas: null,
  ctx: null,

  circleRadius: null,
  circleSpacing: null,
  alphaSpacing: null,

  stageOffsetX: null,
  stageOffsetY: null,

  points: null,
  levelData: null,

  hotColor: 'rgb(255, 53, 94)', /* Radical Red */
  coldColor: 'rgb(93, 138, 168)', /* Air Force Blue */

  /*
   *  one of: 'title', 'game'.
   */
  currentStage: 'title',

  Point: function(x, y, color, alpha) {
    'use strict';

    this.x = x;
    this.y = y;
    this.color = color;
    this.alpha = alpha;

    this.destX = this.x;
    this.destY = this.y;
    this.destAlpha = this.alpha;

    this.draw = function() {
      'use strict';

      ii.drawAntialiasedCircle(
        this.x,
        this.y,
        ii.circleRadius,
        this.color ? ii.hotColor : ii.coldColor,
        'white',
        this.alpha
      );
    };

    this.setMoveDestination = function(destX, destY) {
      'use strict';

      this.destX = destX;
      this.destY = destY;
    };

    this.setAlphaDestination = function(destAlpha) {
      'use strict';

      this.destAlpha = destAlpha;
    };

    this.updateMove = function() {
      'use strict';

      if (Math.abs(this.x - this.destX) > ii.epsilon) {
        var velocity = Math.abs(this.x - this.destX) / (ii.circleSpacing / 8);
        var dirX = (this.x > this.destX) ? -velocity : velocity;
        this.x += dirX;
      } else {
        this.x = this.destX;
      }

      if (Math.abs(this.y - this.destY) > ii.epsilon) {
        var velocity = Math.abs(this.y - this.destY) / (ii.circleSpacing / 8);
        var dirY = (this.y > this.destY) ? -velocity : velocity;
        this.y += dirY;
      } else {
        this.y = this.destY;
      }

    };

    this.updateAlpha = function() {
      'use strict';

      if (Math.abs(this.alpha - this.destAlpha) > ii.epsilon) {
        var velocity = Math.abs(this.alpha - this.destAlpha) / (ii.alphaSpacing / 16);
        var dirAlpha = (this.alpha > this.destAlpha) ? -velocity : velocity;
        this.alpha += dirAlpha;
      } else {
        this.alpha = this.destAlpha;
      }
    };

    this.update = function() {
      'use strict';

      this.updateMove();
      this.updateAlpha();
    };
  },

  moveColumn: function(col, direction) {
    if (ii.currentStage != 'game') {
      return;
    }

    if ((col < 0) || (col >= ii.levelSize)) {
      return;
    }

    if (direction == 'up') {
      ii.points[ii.tempPointId] = new ii.Point(
        ii.stageOffsetX + col * ii.circleSpacing,
        ii.stageOffsetY + ii.levelSize * ii.circleSpacing,
        ii.levelData[col][0],
        0
      );
    }

    if (direction == 'down') {
      ii.points[ii.tempPointId] = new ii.Point(
        ii.stageOffsetX + col * ii.circleSpacing,
        ii.stageOffsetY - ii.circleSpacing,
        ii.levelData[col][ii.levelSize - 1],
        0
      );
    }

    var movementOffset = 0;
    if (direction == 'up') {
      movementOffset = -ii.circleSpacing;
      for (var i = 0; i < ii.levelSize; i++) {
        ii.points[col * ii.levelSize + i].setMoveDestination(
          ii.points[col * ii.levelSize + i].x,
          ii.points[col * ii.levelSize + i].y + movementOffset
        );
      }
      ii.points[col * ii.levelSize].setAlphaDestination(0);
      ii.points[ii.tempPointId].setMoveDestination(ii.points[ii.tempPointId].x, ii.points[ii.tempPointId].y + movementOffset);
      ii.points[ii.tempPointId].setAlphaDestination(ii.alphaSpacing);

      var temp = ii.levelData[col][0];
      for (var i = 0; i < ii.levelSize - 1; i++) {
        ii.levelData[col][i] = ii.levelData[col][i+1];
      }
      ii.levelData[col][ii.levelSize - 1] = temp;
    }

    if (direction == 'down') {
      movementOffset = ii.circleSpacing;
      for (var i = 0; i < ii.levelSize; i++) {
        ii.points[col * ii.levelSize + i].setMoveDestination(
          ii.points[col * ii.levelSize + i].x,
          ii.points[col * ii.levelSize + i].y + movementOffset
        );
      }
      ii.points[col * ii.levelSize + ii.levelSize - 1].setAlphaDestination(0);
      ii.points[ii.tempPointId].setMoveDestination(ii.points[ii.tempPointId].x, ii.points[ii.tempPointId].y + movementOffset);
      ii.points[ii.tempPointId].setAlphaDestination(ii.alphaSpacing);

      var temp = ii.levelData[col][ii.levelSize - 1];
      for (var i = ii.levelSize - 1; i > 0; i--) {
        ii.levelData[col][i] = ii.levelData[col][i-1];
      }
      ii.levelData[col][0] = temp;
    }
  },

  moveRow: function(row, direction) {
    if (ii.currentStage != 'game') {
      return;
    }

    if ((row < 0) || (row >= ii.levelSize)) {
      return;
    }

    if (direction == 'right') {
      ii.points[ii.tempPointId] = new ii.Point(
        ii.stageOffsetX - ii.circleSpacing,
        ii.stageOffsetY + row * ii.circleSpacing,
        ii.levelData[ii.levelSize - 1][row],
        0
      );
    }
    if (direction == 'left') {
      ii.points[ii.tempPointId] = new ii.Point(
        ii.stageOffsetX + ii.levelSize * ii.circleSpacing,
        ii.stageOffsetY + row * ii.circleSpacing,
        ii.levelData[0][row],
        0
      );
    }

    var movementOffset = 0;
    if (direction == 'right') {
      movementOffset = ii.circleSpacing;
      for (var i = 0; i < ii.levelSize; i++) {
        ii.points[row + ii.levelSize * i].setMoveDestination(
          ii.points[row + ii.levelSize * i].x + movementOffset,
          ii.points[row + ii.levelSize * i].y
        );
      }
      ii.points[row + ii.levelSize * (ii.levelSize - 1)].setAlphaDestination(0);
      ii.points[ii.tempPointId].setMoveDestination(ii.points[ii.tempPointId].x + movementOffset, ii.points[ii.tempPointId].y);
      ii.points[ii.tempPointId].setAlphaDestination(ii.alphaSpacing);

      var temp = ii.levelData[ii.levelSize - 1][row];
      for (var i = ii.levelSize - 1; i > 0; i--) {
        ii.levelData[i][row] = ii.levelData[i - 1][row];
      }
      ii.levelData[0][row] = temp;
    }
    if (direction == 'left') {
      movementOffset = -ii.circleSpacing;
      for (var i = 0; i < ii.levelSize; i++) {
        ii.points[row + ii.levelSize * i].setMoveDestination(
          ii.points[row + ii.levelSize * i].x + movementOffset,
          ii.points[row + ii.levelSize * i].y
        );
      }
      ii.points[row].setAlphaDestination(0);
      ii.points[ii.tempPointId].setMoveDestination(ii.points[ii.tempPointId].x + movementOffset, ii.points[ii.tempPointId].y);
      ii.points[ii.tempPointId].setAlphaDestination(ii.alphaSpacing);

      var temp = ii.levelData[0][row];
      for (var i = 0; i < ii.levelSize - 1; i++) {
        ii.levelData[i][row] = ii.levelData[i + 1][row];
      }
      ii.levelData[ii.levelSize - 1][row] = temp;
    }
  },

  createLevel: function() {
    ii.points = [];
    ii.levelData = [];
    for (var i = 0; i < ii.levelSize; i++) {
      ii.levelData[i] = [];
      for (var j = 0; j < ii.levelSize; j++) {
        ii.points.push(new ii.Point(
          ii.stageOffsetX + i * ii.circleSpacing,
          ii.stageOffsetY + j * ii.circleSpacing,
          (i + j) % 2,
          //ii.circleSpacing /* hack, makes alpha synchronized with movement */
          0
        ));

        ii.levelData[i][j] = (i + j) % 2;
      }
    }

    for (var k = 0; k < 10; k++) {
      if (Math.random() >= 0.5) {
        /*  move column */
        if (Math.random() >= 0.5) {
          /*  move up */
          console.log('up');
          var col = Math.floor(Math.random() * ii.levelSize);
          var temp = ii.levelData[col][0];
          for (var i = 0; i < ii.levelSize - 1; i++) {
            ii.levelData[col][i] = ii.levelData[col][i + 1];
          }
          ii.levelData[col][ii.levelSize - 1] = temp;
        } else {
          /*  move down */
          console.log('down');
          var col = Math.floor(Math.random() * ii.levelSize);
          var temp = ii.levelData[col][ii.levelSize - 1];
          for (var i = ii.levelSize - 1; i > 0; i--) {
            ii.levelData[col][i] = ii.levelData[col][i - 1];
          }
          ii.levelData[col][0] = temp;
        }
      } else {
        /*  move row */
        if (Math.random() >= 0.5) {
          /*  move left */
          console.log('left');
          var row = Math.floor(Math.random() * ii.levelSize);
          var temp = ii.levelData[0][row];
          for (var i = 0; i < ii.levelSize - 1; i++) {
            ii.levelData[i][row] = ii.levelData[i + 1][row];
          }
          ii.levelData[ii.levelSize - 1][row] = temp;
        } else {
          /*  move right */
          console.log('right');
          var row = Math.floor(Math.random() * ii.levelSize);
          var temp = ii.levelData[ii.levelSize - 1][row];
          for (var i = ii.levelSize - 1; i > 0; i--) {
            ii.levelData[i][row] = ii.levelData[i - 1][row];
          }
          ii.levelData[0][row] = temp;
        }
      }
    }
    ii.updatePoints();

  },

  updateLevelSize: function(levelSize) {
    ii.levelSize = levelSize;
    ii.circleSpacing = Math.floor(ii.width / (ii.levelSize + 1));
    ii.alphaSpacing = ii.circleSpacing * 3;
    ii.circleRadius = Math.floor(ii.circleSpacing * 0.35);
    ii.stageOffsetX = Math.floor(ii.width / (ii.levelSize + 1)); //+ (ii.levelSize - 4) * ii.circleSpacing;
    ii.stageOffsetY = Math.floor(ii.height * 0.25) + ii.circleRadius;

    ii.tempPointId = (ii.levelSize * ii.levelSize);

    ii.createLevel();
    ii.updatePoints();

    for (var i = 0; i < ii.points.length; i++) {
      ii.points[i].alpha = 0;
      ii.points[i].setAlphaDestination(ii.alphaSpacing);
    }
  },

  init: function() {
    'use strict';

    ii.canvas = document.getElementById('mainCanvas');
    ii.ctx = ii.canvas.getContext('2d');
    ii.ratio = ii.width / ii.height;
    ii.canvas.width = ii.width;
    ii.canvas.height = ii.height;

    ii.updateLevelSize(4);

    var Hammertime = new Hammer(ii.canvas);
    Hammertime.get('swipe').set({ direction: Hammer.DIRECTION_ALL, threshold: 0, velocity: 0.0 });
    Hammertime.get('tap').set({ pointers: 1, taps: 1 });

    Hammertime.on('tap', function(event) {
      var yValues = [];

      for (var i = 4; i < 8; i++) {
        yValues[i - 4] = ii.height / 2
          + (i - 3) * ii.circleSpacing
          - ii.circleSpacing / (4 / (i - 5))
          - ii.circleSpacing;
      }

      if ((event.srcEvent.clientY > yValues[0]) &&
          (event.srcEvent.clientY < yValues[1])) {
        ii.updateLevelSize(4);
        ii.currentStage = 'game';
      }

      if ((event.srcEvent.clientY > yValues[1]) &&
          (event.srcEvent.clientY < yValues[2])) {
        ii.updateLevelSize(5);
        ii.currentStage = 'game';
      }

      if ((event.srcEvent.clientY > yValues[2]) &&
          (event.srcEvent.clientY < yValues[3])) {
        ii.updateLevelSize(6);
        ii.currentStage = 'game';
      }
    });

    Hammertime.on('swipeup', function(event) {
      if (ii.currentStage != 'game') {
        return;
      }

      var col = Math.floor((event.center.x - ii.canvas.offsetLeft - ii.stageOffsetX + ii.circleSpacing/2) / ii.circleSpacing);
      ii.updatePoints();
      ii.moveColumn(col, 'up');
      console.log(ii.checkWin());

      if (ii.checkWin()) {
        for (var i = 0; i < ii.points.length; i++) {
          ii.points[i].setAlphaDestination(0);
        }

        ii.createLevel();
        for (var i = 0; i < ii.points.length; i++) {
          ii.points[i].alpha = 0;
        }
        setTimeout(1000, function() {
          for (var i = 0; i < ii.points.length; i++) {
            ii.points[i].setAlphaDestination(ii.alphaSpacing);
          }
        });
      }
    });

    Hammertime.on('swipedown', function(event) {
      if (ii.currentStage != 'game') {
        return;
      }

      var col = Math.floor((event.center.x - ii.canvas.offsetLeft - ii.stageOffsetX + ii.circleSpacing/2) / ii.circleSpacing);
      ii.updatePoints();
      ii.moveColumn(col, 'down');
      console.log(ii.checkWin());

      if (ii.checkWin()) {
        for (var i = 0; i < ii.points.length; i++) {
          ii.points[i].setAlphaDestination(0);
        }

        ii.createLevel();
        for (var i = 0; i < ii.points.length; i++) {
          ii.points[i].alpha = 0;
        }
        setTimeout(1000, function() {
          for (var i = 0; i < ii.points.length; i++) {
            ii.points[i].setAlphaDestination(ii.alphaSpacing);
          }
        });
      }
    });

    Hammertime.on('swipeleft', function(event) {
      if (ii.currentStage != 'game') {
        return;
      }

      var row = Math.floor((event.center.y - ii.canvas.offsetTop - ii.stageOffsetY + ii.circleSpacing/2) / ii.circleSpacing);
      ii.updatePoints();
      ii.moveRow(row, 'left');
      console.log(ii.checkWin());

      if (ii.checkWin()) {
        for (var i = 0; i < ii.points.length; i++) {
          ii.points[i].setAlphaDestination(0);
        }

        ii.createLevel();
        for (var i = 0; i < ii.points.length; i++) {
          ii.points[i].alpha = 0;
        }
        setTimeout(1000, function() {
          for (var i = 0; i < ii.points.length; i++) {
            ii.points[i].setAlphaDestination(ii.alphaSpacing);
          }
        });
      }
    });

    Hammertime.on('swiperight', function(event) {
      if (ii.currentStage != 'game') {
        return;
      }

      var row = Math.floor((event.center.y - ii.canvas.offsetTop - ii.stageOffsetY + ii.circleSpacing/2) / ii.circleSpacing);
      ii.updatePoints();
      ii.moveRow(row, 'right');
      console.log(ii.checkWin());

      if (ii.checkWin()) {
        for (var i = 0; i < ii.points.length; i++) {
          ii.points[i].setAlphaDestination(0);
        }

        ii.createLevel();
        for (var i = 0; i < ii.points.length; i++) {
          ii.points[i].alpha = 0;
        }
        setTimeout(1000, function() {
          for (var i = 0; i < ii.points.length; i++) {
            ii.points[i].setAlphaDestination(ii.alphaSpacing);
          }
        });
      }
    });

    ii.resize();

    ii.loop();
  },

  checkWin: function() {
    var countNeighbours = function(x, y, type) {
      var res = 0;
      if ((x - 1 >= 0) && (ii.levelData[x - 1][y] == type)) res++;
      if ((x + 1 <  ii.levelSize) && (ii.levelData[x + 1][y] == type)) res++;
      if ((y - 1 >= 0) && (ii.levelData[x][y - 1] == type)) res++;
      if ((y + 1 <  ii.levelSize) && (ii.levelData[x][y + 1] == type)) res++;
      return res;
    }

    for (var i = 0; i < ii.levelSize; i++) {
      for (var j = 0; j < ii.levelSize; j++) {
        if (countNeighbours(i, j, ii.levelData[i][j]) > 0) {
          return false;
        }
      }
    }

    return true;
  },

  updatePoints: function() {
    ii.points = [];
    for (var i = 0; i < ii.levelSize; i++) {
      for (var j = 0; j < ii.levelSize; j++) {
        ii.points.push(new ii.Point(
          ii.stageOffsetX + i * ii.circleSpacing,
          ii.stageOffsetY + j * ii.circleSpacing,
          ii.levelData[i][j],
          ii.alphaSpacing
        ));
      }
    }
  },

  resize: function() {
    'use strict';

    ii.currentHeight = window.innerHeight;
    ii.currentWidth = ii.currentHeight * ii.ratio;
    ii.canvas.style.width = ii.currentWidth + ' px';
    ii.canvas.style.height = ii.currentHeight + ' px';
  },

  loop: function() {
    'use strict';

    ii.currentTimeframe++;
    requestAnimationFrame(ii.loop);
    ii.update();
    ii.render();
  },

  update: function() {
    'use strict';

    if (ii.currentStage != 'game') {
      return;
    }

    for (var i = 0; i < ii.points.length; i++) {
      ii.points[i].update();
    }
  },

  renderGameScreen: function() {
    'use strict';

    ii.ctx.clearRect(0, 0, ii.width, ii.height);

    ii.ctx.fillStyle = 'black';
    ii.ctx.font = (ii.height / 6) + 'px Open Sans';
    ii.ctx.fillText('i!', ii.width * 0.5 - (ii.height / 24), (ii.height / 5.5));

    for (var i = 0; i < ii.points.length; i++) {
      ii.points[i].draw();
    }
  },

  renderTitleScreen: function() {
    'use strict';

    ii.ctx.clearRect(0, 0, ii.width, ii.height);

    ii.ctx.fillStyle = 'black';
    ii.ctx.font = (ii.height / 3) + 'px Open Sans';
    ii.ctx.fillText('i!', ii.width * 0.5 - (ii.height / 12), (ii.height / 2));

    for (var i = 4; i <= 6; i++) {
      for (var j = 0; j < i; j++) {
        /*ii.drawAntialiasedCircle(
          ii.width * 0.1 + j * ii.circleSpacing * (4 / i) + ii.circleSpacing * (4 / i) / 2,
          ii.height / 2 + (i - 3) * ii.circleSpacing - ii.circleSpacing / (4 / (i - 5)) - ii.circleSpacing / 2,
          ii.circleRadius * (4 / i),
          (j % 2) ? ii.hotColor : ii.coldColor,
          'white',
          (j % 2) ?
            ii.alphaSpacing * (0.5 + 0.5 * Math.sin(2.0 * Math.PI * (ii.currentTimeframe * (i + j / 100) / 500))) :
            ii.alphaSpacing * (0.5 + 0.5 * Math.cos(2.0 * Math.PI * (ii.currentTimeframe * (i + j / 100) / 500)))
        );*/
        ii.drawAntialiasedCircle(
          ii.width * 0.1
            + j * ii.circleSpacing * (4 / i)
            + ii.circleSpacing * (4 / i) / 2
            + (ii.circleSpacing * (4 / i) / 2) * Math.sin(2.0 * Math.PI * (ii.currentTimeframe / 500)),
          ii.height / 2
            + (i - 3) * ii.circleSpacing
            - ii.circleSpacing / (4 / (i - 5))
            - ii.circleSpacing / 2,
          ii.circleRadius * (4 / i),
          (j % 2) ? ii.hotColor : ii.coldColor,
          'white',
          ii.alphaSpacing
        );
      }
    }
  },

  render: function() {
    'use strict';

    if (ii.currentStage == 'title') {
      return ii.renderTitleScreen();
    }

    if (ii.currentStage == 'game') {
      return ii.renderGameScreen();
    }
  },

  drawAntialiasedCircle: function(x, y, r, fillStyle, strokeStyle, alpha) {
    'use strict';

    ii.ctx.globalAlpha = (alpha / ii.alphaSpacing);
    if (ii.ctx.globalAlpha < 0.0) {
      ii.ctx.globalAlpha = 0.0;
    }
    if (ii.ctx.globalAlpha > 1.0) {
      ii.ctx.globalAlpha = 1.0;
    }

    ii.ctx.fillStyle = fillStyle;
    ii.ctx.beginPath();
    ii.ctx.arc(x, y, r, 0, 2*Math.PI);
    ii.ctx.fill();

    ii.ctx.strokeStyle = strokeStyle;
    ii.ctx.beginPath();
    ii.ctx.arc(x, y, r, 0, 2*Math.PI);
    ii.ctx.stroke();

    ii.ctx.globalAlpha = 1.0;
  }

};


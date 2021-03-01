// entry points for various scenarios to test
'use strict';

function Scenario() {
    start = function () { };
    stop = function () { };
    update = function () { };
}

class IdealTrack {

    constructor() {
        this.scene = new Scene();
        this.tracker = new Cursor("red", 0, 0);
        this.mouseCursor = new Dot(DOT_SIZE, "green", 0, 0);
        this.INTERVAL = 20;

    }

    start() {

        this.scene.canvas.addEventListener("mousemove", (event) => {

            var mouse = getCursorPosition(this.scene.canvas, event);
            this.mouseCursor.x = mouse['x'];
            this.mouseCursor.y = mouse['y'];
        })

        // https://stackoverflow.com/a/2749272/14591588        
        this.interval = setInterval(
            (function (self) {
                return function () {
                    self.update();
                }
            })(this),
            this.INTERVAL
        );
    }

    update() {
        this.scene.clear();
        this.tracker.newPos(this.mouseCursor.x, this.mouseCursor.y);
        this.tracker.render(this.scene.context);
        this.mouseCursor.render(this.scene.context);

    }

    stop() {
        clearInterval(this.interval);
    }

}



class CreateAreaScenario {
    constructor() {
        this.scene = new Scene();
        this.points = [];
        this.selected;
        this.INTERVAL = 20;
    }

    start = function () {

        this.scene.canvas.addEventListener('mousemove', (event) => {

            var mouse = getCursorPosition(this.scene.canvas, event);

            if (this.selected != null) {
                this.selected.setPos(mouse)
            }

            for (let i = 0; i < this.points.length; i++) {
                if (inCircle(mouse, this.points[i], this.points[i].radius)) {
                    this.points[i].color = 'green'
                }
                else {
                    this.points[i].color = 'grey'
                }
            }
        })

        // handle mousedown event
        this.scene.canvas.addEventListener('mousedown', (event) => {

            var mouse = getCursorPosition(this.scene.canvas, event);

            if (this.selected != null) {
                this.selected = null;
                return;
            }

            for (let i = 0; i < this.points.length; i++) {
                if (inCircle(mouse, this.points[i], this.points[i].radius)) {
                    this.selected = this.points[i]
                    return;
                }
            }
            this.points.push(new Dot(5, 'grey', mouse['x'], mouse['y']));

        })


        // https://stackoverflow.com/a/2749272/14591588        
        this.interval = setInterval(
            (function (self) {
                return function () {
                    self.update();
                }
            })(this),
            this.INTERVAL
        );
    }

    stop = function () {
        clearInterval(this.interval);
    }

    update = function () {
        this.scene.clear();

        if (this.points.length >= 2) {

            this.scene.context.save();
            this.scene.context.fillStyle = 'red';
            this.scene.context.strokeStyle = 'black';
            this.scene.context.beginPath();
            this.scene.context.moveTo(this.points[0].x, this.points[0].y);

            for (let i = 1; i < this.points.length; i++) {
                this.scene.context.lineTo(this.points[i].x, this.points[i].y);
            }

            this.scene.context.lineTo(this.points[0].x, this.points[0].y);
            this.scene.context.stroke();
            this.scene.context.fill();
            this.scene.context.restore();

            for (let i = 0; i < this.points.length; i++) {
                this.points[i].render(this.scene.context);
            }

        }
        else if (this.points.length == 1) {
            this.points[0].render(this.scene.context);
        }
    }
}
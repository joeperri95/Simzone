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
        this.speed = 5;
        this.mouseCursor = new Dot(DOT_SIZE, "green", 0, 0);
        this.controls = document.getElementById('control-panel');
        this.INTERVAL = 20;

    }

    start() {

        this.speedSlider = new Slider('speed', 1, 10);
        this.speedSlider.slider.value = 5;
        this.speedSlider.slider.addEventListener('change', (event) => {
            this.speed = event.target.value;
        })
        
        this.controls.innerHTML = '<h2>Control Panel</h2>';
        this.controls.appendChild(this.speedSlider.container);

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

    newpos(x, y) {
        let dx = x - this.tracker.x;
        let dy = y - this.tracker.y;
        
        const MIN_DISTANCE = 5;
        if(Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)) > MIN_DISTANCE){

            this.tracker.angle = Math.atan2(dy, dx)       
            this.tracker.x += this.speed * Math.cos(this.tracker.angle);
            this.tracker.y += this.speed * Math.sin(this.tracker.angle);
        }
    }

    update() {
        this.scene.clear();
        this.newpos(this.mouseCursor.x, this.mouseCursor.y);
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

class BeaconTestScenario {    

    constructor() {
        this.mouseCursor = new Dot(DOT_SIZE, "green", 10, 10);
        this.obstacles = [];
        this.beacons = [];        
        this.scene = new Scene();
        this.frameNo = 0;
        this.gamestate = 'normal';
        this.INTERVAL = 20;
    }

    async start() {

        // place beacons in random locations
        for (var i = 0; i < 20; i++) {
            this.beacons[i] = new beacon(20 * i + 100, 300, 2);
            await sleep(20) // there must be another way
            this.beacons[i].start();
        }

        var self = this

        var clear = document.getElementById('clear-button');

        clear.addEventListener('click', function () {
            for (let i = 0; i < self.beacons.length; i++) {
                self.beacons[i].stop();
                delete self.beacons[i];
            }

            for (let i = 0; i < self.obstacles.length; i++) {
                delete self.obstacles[i];
            }

            self.beacons = [];
            self.obstacles = [];
        })

        // handle control panel selction
        var tool = document.getElementById('tool');

        if (tool.value == 'normal') {
            self.mouseCursor = new Dot(5, "green", self.mouseCursor.x, self.mouseCursor.y);
            self.gamestate = 'normal';
        }
        else if (tool.value == 'beacon') {
            self.mouseCursor = new Dot(5, "blue", self.mouseCursor.x, self.mouseCursor.y);
            self.gamestate = 'beacon';
        }
        else if (tool.value == 'obstacle') {
            self.mouseCursor = new Rectangle('grey', self.mouseCursor.x, self.mouseCursor.y, 50, 30);
            self.gamestate = 'obstacle'
        }
        else if (tool.value == 'polygon') {
            self.mouseCursor = new Dot(5, "grey", self.mouseCursor.x, self.mouseCursor.y);
            self.gamestate = 'polygon'
        }
        else {
            self.mouseCursor = new Dot(5, "green", self.mouseCursor.x, self.mouseCursor.y);
        }

        tool.addEventListener('change', function () {
            let value = tool.value;
            if (value == 'normal') {
                self.mouseCursor = new Dot(5, "green", self.mouseCursor.x, self.mouseCursor.y);
                self.gamestate = 'normal';
            }
            else if (value == 'beacon') {
                self.mouseCursor = new Dot(5, "blue", self.mouseCursor.x, self.mouseCursor.y);
                self.gamestate = 'beacon';
            }
            else if (value == 'obstacle') {
                self.mouseCursor = new Rectangle('grey', self.mouseCursor.x, self.mouseCursor.y, 50, 30);
                self.gamestate = 'obstacle'
            }
            else if (value == 'polygon') {
                self.mouseCursor = new Dot(5, "grey", self.mouseCursor.x, self.mouseCursor.y);
                self.gamestate = 'polygon'
            }
            else {
                self.mouseCursor = new Dot(5, "green", self.mouseCursor.x, self.mouseCursor.y);
            }
        })

        // handle mousedown event
        this.scene.canvas.addEventListener('mousedown', (event) => {
            var mouse = getCursorPosition(this.scene.canvas, event);

            if (this.gamestate == 'obstacle') {
                this.obstacles.push(new Rectangle('grey', mouse.x, mouse.y, 50, 30));
            }
            else if (this.gamestate == 'beacon') {
                this.beacons.push(new beacon(mouse.x, mouse.y, 2));
                this.beacons[this.beacons.length - 1].start();
            }
            else if (this.gamestate == 'polygon') {
                // this.points.push(new Dot(5, "grey", self.mouseCursor.x, self.mouseCursor.y));
                // move area construction stuff here
            }
        })

        // handle mousemove event
        this.scene.canvas.addEventListener("mousemove", (event) => {
            var mouse = getCursorPosition(this.scene.canvas, event);
            this.mouseCursor.x = mouse['x'];
            this.mouseCursor.y = mouse['y'];
        })

        // set update interval
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
        this.frameNo += 1;

        for (var i = 0; i < this.beacons.length; i++) {
            // This checks if cursor is within beacon radius                        

            var collisions = [];
            var firstCollide = {};

            // check line of sight occulusion with obstacles
            for (var k = 0; k < RAYS; k++) {

                var angels = (this.beacons[i].endAngle * k) / RAYS + this.beacons[i].startAngle;
                let pointonline = { x: (this.beacons[i].x + this.beacons[i].pulses[this.beacons[i].pulses.length - 1] * Math.cos(angels)), y: (this.beacons[i].y + this.beacons[i].pulses[this.beacons[i].pulses.length - 1] * Math.sin(angels)) };
                var rayCollisions = [];

                for (var j = 0; j < this.obstacles.length; j++) {

                    // check if mouse is obstructed
                    var coll = lineToBox(this.beacons[i], this.mouseCursor, this.obstacles[j].x, this.obstacles[j].y, this.obstacles[j].width, this.obstacles[j].height);
                    if (coll.collision) {
                        collisions.push(coll)
                    }

                    // check if rays are obstructed
                    var raycoll = lineToBox(this.beacons[i], pointonline, this.obstacles[j].x, this.obstacles[j].y, this.obstacles[j].width, this.obstacles[j].height);

                    if (raycoll.collision) {
                        if (raycoll.l0.collision) {
                            rayCollisions.push(raycoll.l0)
                        }
                        if (raycoll.l1.collision) {
                            rayCollisions.push(raycoll.l1)
                        }
                        if (raycoll.l2.collision) {
                            rayCollisions.push(raycoll.l2)
                        }
                        if (raycoll.l3.collision) {
                            rayCollisions.push(raycoll.l3)
                        }
                    }
                }


                if (rayCollisions.length > 0) {
                    var dist = Infinity;

                    for (let l = 0; l < rayCollisions.length; l++) {
                        dist = dist > getDistance(this.beacons[i], rayCollisions[l]) ? getDistance(this.beacons[i], rayCollisions[l]) : dist;
                    }


                    firstCollide[k] = { x: (this.beacons[i].x + dist * Math.cos(angels)), y: (this.beacons[i].y + dist * Math.sin(angels)) };
                }

                if (firstCollide[k] != null) {
                    drawline(this.scene.context, this.beacons[i], firstCollide[k], 'black')
                }
                else {
                    drawline(this.scene.context, this.beacons[i], pointonline, 'black')
                }
            }

            let minDistance = Infinity;
            var minLine;
            for (let k = 0; k < collisions.length; k++) {
                if (minDistance > getDistance(this.beacons[i], collisions[k].l0)) {
                    minLine = collisions[k].l0;
                    minDistance = getDistance(this.beacons[i], collisions[k].l0);
                }
                if (minDistance > getDistance(this.beacons[i], collisions[k].l1)) {
                    minLine = collisions[k].l1;
                    minDistance = getDistance(this.beacons[i], collisions[k].l1);
                }
                if (minDistance > getDistance(this.beacons[i], collisions[k].l2)) {
                    minLine = collisions[k].l2;
                    minDistance = getDistance(this.beacons[i], collisions[k].l2);
                }
                if (minDistance > getDistance(this.beacons[i], collisions[k].l3)) {
                    minLine = collisions[k].l3;
                    minDistance = getDistance(this.beacons[i], collisions[k].l3);
                }

            }

            if (collisions.length > 0) {
                drawline(this.scene.context, this.beacons[i], { x: minLine.x, y: minLine.y }, 'black')
                this.beacons[i].color = 'red'
            }
            else {
                drawline(this.scene.context, this.beacons[i], this.mouseCursor, 'black');
            }

            this.beacons[i].render(this.scene.context)
        }

        for (var i = 0; i < this.obstacles.length; i++) {
            this.obstacles[i].render(this.scene.context);
        }

        this.mouseCursor.render(this.scene.context);
    }

    stop() {
        clearInterval(this.interval);
    }
}

function beacon(x, y, period) {

    // controller class for a beacon which emanates pulses
    // period in seconds

    this.view = new Dot(5, 'blue', x, y)
    this.x = x;
    this.y = y;
    this.period = period;
    this.pulses = [];
    this.active = true;
    this.interval;
    this.ticks = 0;
    this.INTERVAL = 20;

    this.startAngle = 0;
    this.endAngle = 2 * Math.PI;

    this.start = function () {
        this.interval = setInterval(
            (function (self) {
                return function () {
                    self.update();
                }
            })(this),
            this.INTERVAL
        );
    }

    this.update = function () {

        for (let i = 0; i < this.pulses.length; i++) {
            this.pulses[i] += SPEED;
        }

        this.ticks += 1;

        if (this.ticks > this.period * 1000 / this.INTERVAL) {
            this.ticks = 0;
            if (this.active) {
                this.pulses.push(0);
                console.log('ping')
            }
        }

        if (this.pulses[0] >= Math.sqrt(Math.pow(CANVAS_WIDTH, 2) + Math.pow(CANVAS_HEIGHT, 2))) {
            this.pulses.splice(0, 0)
        }

    }

    this.render = function (ctx) {
        this.view.render(ctx)
        for (let i = 0; i < this.pulses.length; i++) {
            //drawArc(ctx, this.view, this.pulses[i], this.startAngle, this.endAngle);
            drawCircle(ctx, this.view, this.pulses[i])
        }

    }

    this.stop = function () {
        clearInterval(this.interval);
    }
}
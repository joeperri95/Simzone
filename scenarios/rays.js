class Occlusion {

    constructor() {
                
        this.mouseCursor = new Dot(DOT_SIZE, "green", 10, 10);
        this.stations = [];
        this.obstacles = [];
        this.rad = 0;
        this.scene = new Scene();
        this.gamestate = 'normal';
        this.INTERVAL = 20;

    }

    start() {

        var radtick = setInterval(
            (function (self) {
                return function () {
                    if (self.stations.length > 0) {
                        self.rad += SPEED;
                        if (self.rad >= Math.sqrt(Math.pow(CANVAS_WIDTH, 2) + Math.pow(CANVAS_HEIGHT, 2))) {
                            self.rad = 0;
                        }
                    }
                    else {
                        self.rad = 0;
                    }
                }
            })(this),
            100
        );

        // place beacons in random locations
        for (var i = 0; i < NUM_STATIONS; i++) {
            this.stations[i] = new Dot(DOT_SIZE, "blue", Math.floor(Math.random() * this.scene.width), Math.floor(Math.random() * this.scene.height));
        }

        // handle control panel selction
        var tool = document.getElementById('tool');
        var self = this

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
                this.stations.push(new Dot(5, 'blue', mouse.x, mouse.y));
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

        for (var i = 0; i < this.stations.length; i++) {
            // This checks if cursor is within beacon radius            
            drawCircle(this.scene.context, this.stations[i], this.rad);

            if (inCircle(this.mouseCursor, this.stations[i], this.rad)) {
                this.stations[i].color = 'green';
            }
            else {
                this.stations[i].color = 'blue';
            }
            
            var collisions = [];            
            var rayCollisions = [];

            // check line of sight occulusion with obstacles
            for (var j = 0; j < this.obstacles.length; j++) {

                var coll = lineToBox(this.stations[i], this.mouseCursor, this.obstacles[j].x, this.obstacles[j].y, this.obstacles[j].width, this.obstacles[j].height);
                if(coll.collision){
                    collisions.push(coll)
                }

                for (var k = 0; k < RAYS; k++) {
                    let angels = (2.0 * k) / RAYS * Math.PI;
                    let pointonline = { x: (this.stations[i].x + this.rad * Math.cos(angels)), y: (this.stations[i].y + this.rad * Math.sin(angels)) };

                    var raycoll = lineToBox(this.stations[i], pointonline, this.obstacles[j].x, this.obstacles[j].y, this.obstacles[j].width, this.obstacles[j].height);
                    if (raycoll.collision) {
                        rayCollisions.push(raycoll);
                    }

                    let minRayDistance = Infinity;
                    var minRayLine;            
                    for(let l = 0; l < rayCollisions.length; l++){               
                        if(minRayDistance > getDistance(this.stations[i], rayCollisions[l].l0)){
                            minRayLine = rayCollisions[l].l0;
                            minRayDistance = getDistance(this.stations[i], rayCollisions[l].l0);
                        } 
                        if(minRayDistance > getDistance(this.stations[i], rayCollisions[l].l1)){
                            minRayLine = rayCollisions[l].l1;
                            minRayDistance = getDistance(this.stations[i], rayCollisions[l].l1);
                        }
                        if(minRayDistance > getDistance(this.stations[i], rayCollisions[l].l2)){
                            minRayLine = rayCollisions[l].l2;
                            minRayDistance = getDistance(this.stations[i], rayCollisions[l].l2);
                        }
                        if(minRayDistance > getDistance(this.stations[i], rayCollisions[l].l3)){
                            minRayLine = rayCollisions[l].l3;
                            minRayDistance = getDistance(this.stations[i], rayCollisions[l].l3);
                        }   
                    }

                    if (rayCollisions.length > 0) {
                        drawline(this.scene.context, this.stations[i], { x: minRayLine.x, y: minRayLine.y }, 'black')
                    }
                }
            }

            let minDistance = Infinity;
            var minLine;            
            for(let k = 0; k < collisions.length; k++){               
                if(minDistance > getDistance(this.stations[i], collisions[k].l0)){
                    minLine = collisions[k].l0;
                    minDistance = getDistance(this.stations[i], collisions[k].l0);
                } 
                if(minDistance > getDistance(this.stations[i], collisions[k].l1)){
                    minLine = collisions[k].l1;
                    minDistance = getDistance(this.stations[i], collisions[k].l1);
                }
                if(minDistance > getDistance(this.stations[i], collisions[k].l2)){
                    minLine = collisions[k].l2;
                    minDistance = getDistance(this.stations[i], collisions[k].l2);
                }
                if(minDistance > getDistance(this.stations[i], collisions[k].l3)){
                    minLine = collisions[k].l3;
                    minDistance = getDistance(this.stations[i], collisions[k].l3);
                }
                
            }

            if (collisions.length > 0) {
                drawline(this.scene.context, this.stations[i], { x: minLine.x, y: minLine.y }, 'black')
                this.stations[i].color = 'red'
            }
            else {
                drawline(this.scene.context, this.stations[i], this.mouseCursor, 'black');
            }

            this.stations[i].render(this.scene.context)
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
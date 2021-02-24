// entry points for various scenarios to test
'use strict';

function Scenario() {
    start = function () { };
    stop = function () { };
    update = function () { };
}

class IdealTrack {
    
    constructor()
    {
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
            (function(self) {         
                return function() {   
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

class Occlusion {

    constructor(){

        // context for scenario        
        //this.tracker = new Tracker("red", 225, 225);
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
            (function(self) {         
                return function() {   
                    if(self.stations.length > 0){
                self.rad += SPEED;
                if(self.rad >= Math.sqrt(Math.pow(CANVAS_WIDTH, 2) + Math.pow(CANVAS_HEIGHT, 2))){
                    self.rad = 0;
                }
            }
            else{
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
        
        var tool = document.getElementById('tool');
        var self = this
        
        tool.addEventListener('change', function() {
            let value = tool.value;
            if(value == 'normal')
            {
                self.mouseCursor = new Dot(5, "green", self.mouseCursor.x, self.mouseCursor.y);        
                self.gamestate = 'normal';
            }
            else if(value == 'beacon')
            {
                self.mouseCursor = new Dot(5, "blue", self.mouseCursor.x, self.mouseCursor.y);        
                self.gamestate = 'beacon';
            }
            else if(value == 'obstacle')
            {
                self.mouseCursor = new Rectangle('grey', self.mouseCursor.x, self.mouseCursor.y, 50, 30);
                self.gamestate = 'obstacle'
            }
            else
            {
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


        // https://stackoverflow.com/a/2749272/14591588        
        this.interval = setInterval(
            (function(self) {         
                return function() {   
                    self.update(); 
                }
            })(this),
            this.INTERVAL
        );
    }

    update() {

        this.scene.clear();    
            
        for(var i = 0; i < this.stations.length;i++){
            
            // This checks if cursor is within beacon radius
            // This is not currently working
            drawCircle(this.scene.context, this.stations[i], this.rad);
            
            if(inCircle(this.mouseCursor, this.stations[i] , this.rad))
            {
                this.stations[i].color = 'green';
                
                if(this.stations[i].firstTime){
                    this.stations[i].firstTime = false;
                }
                
            }
            else
            {
                this.stations[i].color = 'blue';
            }        
    
            var nocollides = 0;
            
            // check line of sight occulusion with obstacles
            for(var j=0; j< this.obstacles.length; j++){
    
                var coll = lineToBox(this.stations[i], this.mouseCursor,  this.obstacles[j].x, this.obstacles[j].y, this.obstacles[j].width, this.obstacles[j].height);                        
                            
                for(var k = 0; k < RAYS; k++){
                    let angels = (2.0 * k) / RAYS * Math.PI; 
                    let pointonline = {x: (this.stations[i].x + this.rad * Math.cos(angels)), y: (this.stations[i].y + this.rad * Math.sin(angels))};          
    
                    var raycoll = lineToBox(this.stations[i], pointonline,  this.obstacles[j].x, this.obstacles[j].y, this.obstacles[j].width, this.obstacles[j].height);                        
                    if( raycoll.collision){
                        
                        if(raycoll.l0.collision){
                            drawline(this.scene.context, this.stations[i], {x : raycoll.l0.x, y : raycoll.l0.y }, 'black')
                        }
                        if(raycoll.l1.collision){
                            drawline(this.scene.context, this.stations[i], {x : raycoll.l1.x, y : raycoll.l1.y }, 'black')
                        }
                        if(raycoll.l2.collision){
                            drawline(this.scene.context, this.stations[i], {x : raycoll.l2.x, y : raycoll.l2.y }, 'black')
                        }
                        if(raycoll.l3.collision){
                            drawline(this.scene.context, this.stations[i], {x : raycoll.l3.x, y : raycoll.l3.y }, 'black')
                        }
                    }
                    else{
                        //drawline(scene.context, stations[i], pointonline, 'black')
                    }
                }
    
                if(coll.collision)
                {
                    
                    /*
                        There is a bug here. If there are multiple occlusions the line may stop at the wrong one
                        Need to find the smallest distance before drawing the line
                    */
                    if(coll.l0.collision){
                        drawline(this.scene.context, this.stations[i], {x : coll.l0.x, y : coll.l0.y }, 'black')
                    }
                    if(coll.l1.collision){
                        drawline(this.scene.context, this.stations[i], {x : coll.l1.x, y : coll.l1.y }, 'black')
                    }
                    if(coll.l2.collision){
                        drawline(this.scene.context, this.stations[i], {x : coll.l2.x, y : coll.l2.y }, 'black')
                    }
                    if(coll.l3.collision){
                        drawline(this.scene.context, this.stations[i], {x : coll.l3.x, y : coll.l3.y }, 'black')
                    }
                    
                    this.stations[i].color = 'red'
                    
                }
    
                // This keeps track to see if there is a line of sight
                else{
                    nocollides += 1;
                }
            }
    
            if(nocollides == this.obstacles.length)
            {
                drawline(this.scene.context,  this.stations[i], this.mouseCursor, 'black');
            }
                        
            this.stations[i].render(this.scene.context)
        }
    
        for(var i=0;i<this.obstacles.length;i++){
            this.obstacles[i].render(this.scene.context);
        }    
            
        this.mouseCursor.render(this.scene.context);        
    }

    stop() {
        clearInterval(this.interval);
    }
}

class ModelScenario{
    constructor()
    {
        this.scene = new Scene();
        this.tracker = new Tracker();
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
            (function(self) {         
                return function() {   
                    self.update(); 
                }
            })(this),
            this.INTERVAL
        );        
    }

    update() {
        this.scene.clear();
        this.tracker.update();
        this.tracker.render(this.scene.context);
        this.mouseCursor.render(this.scene.context);
        
    }

    stop() {
        clearInterval(this.interval);
    }
}

class RayTracing{
    constructor()
    {

    }

    start = function () { };
    stop = function () { };
    update = function () { };
}
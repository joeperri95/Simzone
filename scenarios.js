// entry points for various scenarios to test

function Scenario() {
    start = function () { };
    stop = function () { };
    update = function () { };
}

function models() {

    start = function () {

        tracker = new Cursor("red", 0, 0);
        // tracker2 = new Tracker();
        mouseCursor = new Dot(DOT_SIZE, "green", 0, 0);
        initialize();

        for (i = 0; i < NUM_STATIONS; i++) {
            stations[i] = new Dot(DOT_SIZE, "blue", Math.floor(Math.random() * CANVAS_WIDTH), Math.floor(Math.random() * CANVAS_HEIGHT))
        }

        obstacle = new Rectangle('grey', 200, 150, 50, 25);

        scene = new Scene();
        scene.start();
        setInterval(function () {
            rad += 1
        }, 10);

        this.interval = setInterval(this.update, 20);

        scene.canvas.addEventListener("mousemove", (event) => {

            var mouse = getCursorPosition(scene.canvas, event);
            mouseCursor.x = mouse['x'];
            mouseCursor.y = mouse['y'];
        })
    }

    update = function () {
        scene.clear();
        tracker.newPos(mouseCursor.x, mouseCursor.y);
        tracker.render(scene.context);

        for (i = 0; i < NUM_STATIONS; i++) {
            stations[i].render(scene.context)
            drawline(scene.context, stations[i], mouseCursor, 'black');
            drawCircle(scene.context, stations[i], rad); //getDistance(stations[i], mouseCursor));
        }
        mouseCursor.render(scene.context);
        obstacle.render(scene.context);
    }

    stop = function () {
        clearInterval(this.interval);
    }

}


function dev() {
    this.start = function () {

        gamestate = 'normal'
        tracker = new Tracker("red", 225, 225);
        mouseCursor = new Dot(5, "green", 10, 10);

        // place beacons in random locations
        for (i = 0; i < NUM_STATIONS; i++) {
            stations[i] = new Dot(5, "blue", Math.floor(Math.random() * 600), Math.floor(Math.random() * 400))
        }


        setInterval(function () {
            rad += 1;
        }, 100)

        scene = new Scene();
        scene.start();

        this.interval = setInterval(this.update, 20);

        scene.canvas.addEventListener('mousedown', (event) => {

            var mouse = getCursorPosition(scene.canvas, event);

            if (gamestate == 'obstacle') {
                obstacles.push(new Obstacle(mouse.x, mouse.y, 50, 30));
            }
            else if (gamestate == 'beacon') {
                stations.push(new Dot(5, 'blue', mouse.x, mouse.y));
            }
        })

        scene.canvas.addEventListener("mousemove", (event) => {

            var mouse = getCursorPosition(scene.canvas, event);
            mouseCursor.x = mouse['x'];
            mouseCursor.y = mouse['y'];
        })
    }

    this.update = function() {
    
        if(gamestate == 'paused'){
            return;
        }
    
        scene.frameNo += 1;
        scene.clear();    
        
        // lines that update the tracker which is a separate thing right now
        //tracker.newPos(mouseCursor.x, mouseCursor.y);
        //tracker.render(scene.context);
    
        for(i=0;i<stations.length;i++){
            
            // This checks if cursor is within beacon radius
            // This is not currently working
            drawCircle(scene.context, stations[i], rad);
            if(inCircle(stations[i], mouseCursor, rad))
            {
                stations[i].color = 'green';
                
                if(stations[i].firstTime){
                    console.log({station: stations[i], frame: scene.frameNo});                
                    stations[i].firstTime = false;
                }
                
            }
            else
            {
                stations[i].color = 'blue';
            }        
    
            var nocollides = 0;
            
            // check line of sight occulusion with obstacles
            for(j=0; j<obstacles.length; j++){
    
                var coll = lineToBox(stations[i], mouseCursor,  obstacles[j].x, obstacles[j].y, obstacles[j].width, obstacles[j].height);                        
                            
                for(k = 0; k < RAYS; k++){
                    let angels = (2.0 * k) / RAYS * Math.PI; 
                    let pointonline = {x: (stations[i].x + rad * Math.cos(angels)), y: (stations[i].y + rad * Math.sin(angels))};          
    
                    var raycoll = lineToBox(stations[i], pointonline,  obstacles[j].x, obstacles[j].y, obstacles[j].width, obstacles[j].height);                        
                    if( raycoll.collision){
                        
                        if(raycoll.l0.collision){
                            drawline(scene.context, stations[i], {x : raycoll.l0.x, y : raycoll.l0.y }, 'black')
                        }
                        if(raycoll.l1.collision){
                            drawline(scene.context, stations[i], {x : raycoll.l1.x, y : raycoll.l1.y }, 'black')
                        }
                        if(raycoll.l2.collision){
                            drawline(scene.context, stations[i], {x : raycoll.l2.x, y : raycoll.l2.y }, 'black')
                        }
                        if(raycoll.l3.collision){
                            drawline(scene.context, stations[i], {x : raycoll.l3.x, y : raycoll.l3.y }, 'black')
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
                        drawline(scene.context, stations[i], {x : coll.l0.x, y : coll.l0.y }, 'black')
                    }
                    if(coll.l1.collision){
                        drawline(scene.context, stations[i], {x : coll.l1.x, y : coll.l1.y }, 'black')
                    }
                    if(coll.l2.collision){
                        drawline(scene.context, stations[i], {x : coll.l2.x, y : coll.l2.y }, 'black')
                    }
                    if(coll.l3.collision){
                        drawline(scene.context, stations[i], {x : coll.l3.x, y : coll.l3.y }, 'black')
                    }
    
                    stations[i].color = 'red'
                    
                }
    
                // This keeps track to see if there is a line of sight
                else{
                    nocollides += 1;
                }
            }
    
            if(nocollides == obstacles.length)
            {
                drawline(scene.context,  stations[i], mouseCursor, 'black');
            }
            //drawCircle(scene.context, stations[i], getDistance(stations[i], mouseCursor));
            stations[i].render(scene.context)
        }
    
        for(i=0;i<obstacles.length;i++){
            obstacles[i].render(scene.context);
        }    
    
        // drawCircle(scene.context, mouseCursor, rad);
        mouseCursor.render(scene.context);        
    }

    this.stop = function () {
        clearInterval(this.interval);
    }



}

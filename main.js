var tracker;
var scene;
var mouseCursor;
var keys = [];
var stations = [];
var obstacles = [];
var scenario;
    
var rad = 1;

const NUM_STATIONS = 5
const NUM_OBSTACLES = 1;
const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 400
const DOT_SIZE = 5;

function startGame() {
    let scenarioChoice = document.getElementById('scenario').value;
    if(scenarioChoice == 'model'){
        models();
    }
    else if(scenarioChoice == 'dev'){
        this.scenario = dev();
    }
}

function Scene() {
    this.canvas = document.getElementById("the-zone"),
    this.start = function() {
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;
        this.context = this.canvas.getContext("2d");                
        
    }
    
        
    this.clear = function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function scenarioChange(newScenario)
{
    
}

function updateScene() {
    scene.clear();    
    tracker.newPos(mouseCursor.x, mouseCursor.y);
    tracker.render(scene.context);
 
    for(i=0;i<NUM_STATIONS;i++){
        stations[i].render(scene.context)
        drawline(scene.context,  stations[i], mouseCursor, 'black');
        drawCircle(scene.context, stations[i],  rad); //getDistance(stations[i], mouseCursor));
    }
    mouseCursor.render(scene.context);
    obstacle.render(scene.context);
 
}
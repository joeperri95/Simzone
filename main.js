var tracker;
var scene;
var mouseCursor;
var keys = [];
var stations = [];
var obstacles = [];

var rad = 1;

const NUM_STATIONS = 5
const NUM_OBSTACLES = 1;
const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 400
const DOT_SIZE = 5;

function startGame() {
    tracker = new Cursor("red", 0, 0);
    // tracker2 = new Tracker();
    mouseCursor = new Dot(DOT_SIZE, "green", 0, 0);

    for(i = 0; i < NUM_STATIONS; i++)
    {
        stations[i] = new Dot(DOT_SIZE, "blue", Math.floor(Math.random() * CANVAS_WIDTH), Math.floor(Math.random() * CANVAS_HEIGHT))
    }

    obstacle = new Rectangle('grey', 200, 150, 50, 25);

    scene = new Scene();
    scene.start();
    setInterval(function() {
        rad += 1
    }, 10);
 
    scene.canvas.addEventListener("mousemove", (event) => {

        var mouse = getCursorPosition(scene.canvas, event);
        mouseCursor.x = mouse['x'];
        mouseCursor.y = mouse['y'];        
    })

}

function Scene() {
    this.canvas = document.getElementById("the-zone"),
    this.start = function() {
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;
        this.context = this.canvas.getContext("2d");                
        this.interval = setInterval(updateScene, 20);        
        
    }
    this.stop = function() {
        clearInterval(this.interval);
    }    
    this.clear = function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
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
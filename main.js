var RAYS = 50;
var SPEED = 10;
const NUM_STATIONS = 5
const NUM_OBSTACLES = 1;
const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 400
const DOT_SIZE = 5;

var scenario;
var scenarioChoice

function startGame() {

    if (window.location.hash != "") {
        let value = window.location.hash.replace(/#/g, '');        
        newScenario(value);
    }
    else {
        scenarioChoice = document.getElementById('scenario')
        let value = scenarioChoice.value;
        newScenario(value);
    }
}

function Scene() {

    this.canvas = document.getElementById("the-zone");
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;
    this.width = CANVAS_WIDTH;
    this.height = CANVAS_HEIGHT;
    this.context = this.canvas.getContext("2d");

    this.clear = function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function ControlPanel() {

    this.panel = document.getElementById("control-panel")

}

function scenarioChange() {
    let value = scenarioChoice.value;
    newScenario(value);
}


function newScenario(value) {
    if (scenario != null) {
        scenario.stop();
        delete scenario;
    }

    if (value == 'ideal') {
        scenario = new IdealTrack();
        scenario.start()
    }
    else if (value == 'occlusion') {
        scenario = new Occlusion();
        scenario.start()
    }
    else if (value == 'model') {
        scenario = new ModelScenario();
        scenario.start();
    }
    else if (value == 'area') {
        scenario = new CreateAreaScenario();
        scenario.start();
    }
    else if (value == 'graph') {
        scenario = new GraphScenario();
        scenario.start();
    }
    else if (value == 'beacons') {
        scenario = new BeaconTestScenario();
        scenario.start();
    }
    else if (value == 'dev') {
        // scenario.start();
    }
}
'use-strict'

class ModelScenario {
    constructor() {
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
        this.tracker.update();
        this.tracker.render(this.scene.context);
        console.log(this.tracker.state)
        this.mouseCursor.render(this.scene.context);
    }

    stop() {
        clearInterval(this.interval);
    }
}


function Tracker()
{
    // controller class for a physical model and it's visual representation

    this.view = new Dot(5, 'red', 0, 0);
    this.timestep = 20;
    this.model = new Model(this.timestep, [100, 100, 0, 0, 0, 0], [0, 9.8]);
    this.state;

    this.update = function() {
        this.model.update();
        this.state = this.model.getOutput();  
        this.view.setPos(this.state);        
    }

    this.render = function(ctx){
        const SCALE = 5;
        drawArrow(ctx, this.state, {x: this.state.x + SCALE * this.model.state[4], y: this.state.y + SCALE * this.model.state[5]}, 'black');
        this.view.render(ctx)
    }
}

function Model(timestep, initialState, initialInput)
{
    // input is Fx, Fy
    this.input = initialInput;
    this.timestep = timestep / 1000.0;
    this.state = [];
    // Physical parameters of the model
    this.mass = 10;
    this.drag = 1;
    this.hooke = 5;

    // A matrix describes system
    this.A = [
        [1, 0, this.timestep, 0, 0, 0],
        [0, 1, 0, this.timestep,0 ,0],
        [0, 0, 1, 0, this.timestep, 0],
        [0, 0, 0, 1, 0, this.timestep],
        [0, 0, Math.exp (- this.drag / this.mass * this.timestep), 0, 0, 0],
        [0, - (this.hooke / this.mass * this.timestep), 0, Math.exp (- this.drag / this.mass * this.timestep), 0, 0],
    ];

    // B matrix translates input to state
    this.B = [
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
        [this.timestep / this.mass, 0],
        [0, this.timestep / this.mass]
    ];

    // C matrix translates state to ouput
    // This can be used to scale output to the display
    this.C = [
        0.001, 0.001, 0.001, 0.001, 1, 1
    ];

    // state is x, y, vx, vy
    for(let i = 0; i < this.C.length; i++)
    {
        // Undo the C transformation
        this.state[i] = 1.0 / this.C[i] * initialState[i];
    }

    this.getOutput = function() {       
        var result = {
            x: this.C[0] * this.state[0],
            y: this.C[1] * this.state[1],
            vx: this.C[2] * this.state[2],
            vy: this.C[3] * this.state[3]
        }
        return result;
    }

    this.update = function() {
        var oldState = [];
        var worldcoords = [100, 100, 0, 0, 0, 0]
        var acc;

        // deep copy the state
        for(i = 0; i < this.state.length; i++){
            oldState[i] = this.state[i];
        }
        for(i = 0; i < this.state.length; i++)
        {
            acc = 0;

            // Multiply by dynamic matrix
            for(j = 0; j < this.state.length; j++)
            {
                acc += this.A[i][j] * (oldState[j]);                
            }
         
            // Add inputs
            for(k = 0; k < this.input.length; k++)
            {
                acc += this.B[i][k] * this.input[k];
            }
 
            this.state[i] = acc;
        }
    }

}
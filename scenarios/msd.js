'use-strict'

var scale = 10;

class MSDScenario {
    constructor() {
        this.scene = new Scene();
        this.tracker = new Tracker([100, 100]);        
        this.controls = document.getElementById('control-panel');
        this.INTERVAL = 20;
    }
    start() {

        this.massRange = new Slider('mass', 1, 100);
        this.dragRange = new Slider('drag', 1, 100);
        this.hookeRange = new Slider('hooke', 1, 100);        

        this.controls.innerHTML = '<h2>Control Panel</h2>';
        this.controls.appendChild(this.massRange.container);
        this.controls.appendChild(this.dragRange.container);
        this.controls.appendChild(this.hookeRange.container);        
        
        this.massRange.slider.addEventListener('change', (event) => {            
            this.tracker.model.mass = event.target.value;
        })

        this.dragRange.slider.addEventListener('change', (event) => {            
            this.tracker.model.drag = event.target.value;
        })

        this.hookeRange.slider.addEventListener('change', (event) => {            
            this.tracker.model.hooke = event.target.value;
        })

        this.scene.canvas.addEventListener('wheel', (event) => {
            if(event.deltaY > 0){
                scale += 1
            }
            else if(event.deltaY < 0){
                scale -= 1
            }
            event.preventDefault();
            console.log(scale);
        }, false)

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
        // console.log(this.tracker.state);        
    }

    stop() {
        clearInterval(this.interval);
    }
}


function Tracker(wordCoords)
{
    // controller class for a physical model and it's visual representation

    this.view = new Dot(5, 'red', 0, 0);
    this.timestep = 20;
    this.worldCoords = wordCoords;
    this.previousPoints = [];
    this.model = new Model(this.timestep, [0, 0, 0, 0, 0, 0], [0, 9.8 * 10]);
    this.state;

    this.update = function() {
        this.model.update();
        this.state = this.model.getOutput();  
        this.state.x += this.worldCoords[0];
        this.state.y += this.worldCoords[1];
        this.previousPoints.push(this.state);
        this.view.setPos(this.state);        
    }

    this.render = function(ctx){
        const SCALE = 1 //* this.model.C[0];
        drawArrow(ctx, this.state, {x: this.state.x + SCALE * (- this.model.hooke * this.model.state[0]) , y: this.state.y + SCALE * (( - this.model.hooke * this.model.state[1])) }, 'red');        
        drawArrow(ctx, this.state, {x: this.state.x + SCALE * this.model.state[4] , y: this.state.y + SCALE * this.model.state[5] }, 'black');        
        drawArrow(ctx, this.state, {x: this.state.x + SCALE * this.model.input[0] , y: this.state.y + SCALE *  this.model.input[1]}, 'green');
        drawline(ctx, {x: 0, y: this.worldCoords[1]}, {x: CANVAS_WIDTH, y: this.worldCoords[1]}, 'black')

        if(this.previousPoints.length >= 2){
            for(let i = 1; i < this.previousPoints.length; i++){
                drawline(ctx, {x: this.worldCoords[0] + this.previousPoints.length -  i - 1 , y: this.previousPoints[i - 1].y}, {x: this.worldCoords[0] + this.previousPoints.length - i, y : this.previousPoints[i].y}, 'black');
            }
        }
        if(this.previousPoints.length >= CANVAS_WIDTH - this.worldCoords[1]){
            this.previousPoints.shift();
        }

        this.view.render(ctx)
    }
}

function Model(timestep, initialState, initialInput)
{
    // input is Fx, Fy
    this.input = initialInput; 
    this.timestep = timestep / 1000.0;
    this.state = initialState;
    // Physical parameters of the model
    this.mass = 10;
    this.drag = 1;
    this.hooke = 5;

    this.A = [];
    this.B = [];

    // C matrix translates state to ouput
    // This can be used to scale output to better fit the display
    // this.C = [
    //     0.001, 0.001, 0.001, 0.001, 0.001, 0.001
    // ];

    // one pixel is one m
    // this.C = [
    //     1, 1, 1, 1, 1, 1
    // ];

    // one pixel is one cm 
    this.C = [
        100, 100, 100, 100, 100, 100
    ];

    this.getOutput = function() {       
        var result = {
            x: this.C[0] * this.state[0],
            y: this.C[1] * this.state[1],
            vx: this.C[2] * this.state[2],
            vy: this.C[3] * this.state[3],
            ax: this.C[4] * this.state[4],
            ay: this.C[5] * this.state[5]
        }
        return result;
    }

    this.update = function() {
        var oldState = [];        
        var acc;

        this.input[1] = 9.8 * this.mass;

        for(let i = 0; i < this.C.length; i++){
            this.C[i] = scale;
        }

        // A matrix describes system
        // Use euler method for now
        this.A = [
            [1, 0, this.timestep, 0, 0, 0],
            [0, 1, 0, this.timestep,0 ,0],
            [0, 0, 1, 0, this.timestep, 0],
            [0, 0, 0, 1, 0, this.timestep],
            [- (this.hooke / this.mass * this.timestep), 0, (- this.drag / this.mass * this.timestep), 0, 0, 0],
            [0, - (this.hooke / this.mass * this.timestep), 0,(- this.drag / this.mass * this.timestep), 0, 0],
        ];

        // Original ODE
        // d2x/dt2 = -k/m * x - b/m * dx/dt
        // x1 = x
        // x2 = dx/dt
        // substitute
        // d(x1) / dt = x2
        // d(x2) / dt = -k/m * x1 = b/m * x2

        // 4th order runge kutta
        let h = this.timestep;
        let x1 = this.state[0];
        let x2 = this.state[1];

        let k11 = h * x1;
        let k12 = h * (- this.hooke / this.mass * x1 - this.drag / this.mass * x2 + 9.8); 

        let k21 = h * (x1 + k11 / 2);
        let k22 = h * (- this.hooke / this.mass * (x1 + k11 / 2) - this.drag / this.mass * (x2 + k12 / 2) + 9.8); 
        
        let k31 = h * (x1 + k21 / 2);
        let k32 = h * (- this.hooke / this.mass * (x1 + k21 / 2) - this.drag / this.mass * (x2 + k22 / 2) + 9.8); 
        
        let k41 = h * (x1 + k31 / 2);
        let k42 = h * (- this.hooke / this.mass * (x1 + k31 / 2) - this.drag / this.mass * (x2 + k32 / 2) + 9.8); 
        
        this.state[0] = x1 + 1.0 / 6 * (k11 + 2 * k21 + 2 * k31 + k41);
        this.state[1] = x2 + 1.0 / 6 * (k12 + 2 * k22 + 2 * k32 + k42);

        return;
        // B matrix translates input to state
        this.B = [
            [0, 0],
            [0, 0],
            [0, 0],
            [0, 0],
            [this.timestep / this.mass, 0],
            [0, this.timestep / this.mass]
        ];

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
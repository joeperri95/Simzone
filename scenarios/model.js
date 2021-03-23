
class ModelScenario {

    constructor() {
        this.scene = new Scene();
        this.tracker = new Cursor("red", 100, 100);
        this.truth = new Cursor("green", 100, 100);
        this.model = new DynamicsModel(new Point(100, 100), 0);
        this.count = 0;
        this.history = [];
        this.showVHistory = false;
        this.generateSamples = false;
        this.vsample = new Arrow('red', this.model.position, new Point(this.model.state[0] + this.model.state[1], this.model.state[2] + this.model.state[3]));
        this.vhistory = [this.vsample];
        this.samples = [this.model.position];

        this.controls = document.getElementById('control-panel');
        this.INTERVAL = 20;

    }

    start() {

        this.controls.innerHTML = '<h2>Control Panel</h2>';

        this.vhistoryCheckBox = new CheckBox("velocity history", false);
        this.samplesCheckBox = new CheckBox("position samples", false);
        this.logBox = new CheckBox("logs", true);
        this.massRange = new SliderInput("mass", 1, 100, 10);
        this.dragRange = new SliderInput("drag", 1, 100, 10);

        this.vhistoryCheckBox.checkbox.addEventListener('input', (event) => {
            this.showVHistory = this.vhistoryCheckBox.checkbox.checked;
        })

        this.samplesCheckBox.checkbox.addEventListener('input', (event)=>{
            this.generateSamples = this.samplesCheckBox.checkbox.checked;
        })

        this.logBox.checkbox.addEventListener('change', (event) => {            
            logging = this.logBox.checkbox.checked;            
        })

        this.massRange.slider.addEventListener('change', (event) => {
            this.model.mass = event.target.value;
        })
        this.dragRange.slider.addEventListener('change', (event) => {
            this.model.drag = event.target.value;
        })
        

        this.controls.appendChild(this.vhistoryCheckBox.container);
        this.controls.appendChild(this.samplesCheckBox.container);
        this.controls.appendChild(this.massRange.container);
        this.controls.appendChild(this.dragRange.container);
        this.controls.appendChild(this.logBox.container);

        window.addEventListener('keydown', (event) => {
            this.handleKeyDown(event);
        })

        window.addEventListener('keyup', (event) => {
            this.handleKeyUp(event);
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

        this.historyInterval = setInterval(
            (function (self) {
                return function () {
                    //self.history.push(self.model.position);
                    var arrow = new Arrow('red', self.model.position, new Point(self.model.state[0] + self.model.state[1], self.model.state[2] + self.model.state[3]))
                    self.vsample = arrow;
                }
            })(this),
            1000
        )

        
        this.sampleInterval = setInterval(
            (function (self) {
                return function () {
                    
                    const sigma = 10
                    let sample = new Point(GaussianNoise(self.model.position.x, sigma), GaussianNoise(self.model.position.y, sigma));
                    self.samples.push(sample);
                    
                }
            })(this),
            1000
        )
    }

    handleKeyDown(event) {
        const ACCEL = 10;
        const TORQUE = 1;
        const MAX_ACCEL = 100;
        const MAX_TORQUE = 10;


        if (event.key == 'w') {
            this.model.input = this.model.input >= MAX_ACCEL ? MAX_ACCEL : this.model.input + ACCEL;
        }
        else if (event.key == 'a') {
            this.model.torque = this.model.torque >= MAX_TORQUE ? MAX_TORQUE : this.model.torque + TORQUE;
        }
        else if (event.key == 's') {
            this.model.input = this.model.input <= - MAX_ACCEL ? - MAX_ACCEL : this.model.input - ACCEL;
        }
        else if (event.key == 'd') {
            this.model.torque = this.model.torque <= - MAX_TORQUE ? - MAX_TORQUE : this.model.torque - TORQUE;
        }
    }

    handleKeyUp(event) {

        if (event.key == 'w') {
            this.model.input = 0;
        }
        else if (event.key == 'a') {
            this.model.torque = 0;
        }
        else if (event.key == 's') {
            this.model.input = 0;
        }
        else if (event.key == 'd') {
            this.model.torque = 0;
        }
    }

    update() {
        this.scene.clear();
        
        drawImage(this.scene.context, 'resources/img/sea.jpg');
        this.model.update();


        if (this.count <= 0) {
            this.count = 50;            
        }
        else {
            this.count--;

            let start = this.vhistory[this.vhistory.length - 1].end;
            const scale = 50 / 4; // 50 frames per second * runge kutta step size  
            let newend = new Point(start.x + this.vsample.arrowLength / scale * Math.cos(this.vsample.angle), start.y + this.vsample.arrowLength / scale * Math.sin(this.vsample.angle))
            let arrow = new Arrow('red', start, newend);
            this.vhistory.push(arrow);

            // this will eventually munch all of the RAM so maybe there should be another way
        }

        if (this.showVHistory) {
            for (let i = 0; i < this.vhistory.length; i++) {
                //drawline(this.scene.context, this.history[i - 1], this.history[i], 'green');
                this.vhistory[i].render(this.scene.context);
            }
        }

        if(this.generateSamples) {
            for(let i = 0; i < this.samples.length; i++){
                let pt = new Dot(5, 'yellow', this.samples[i].x, this.samples[i].y);
                pt.render(this.scene.context);
            }
        }

        this.tracker.setPos(this.model.position);
        this.tracker.angle = this.model.angle;
        this.tracker.render(this.scene.context);
    }

    stop() {
        clearInterval(this.interval);
    }
}

function DynamicsView() {



}

function DynamicsModel(start, angle) {
    this.position = start;
    this.angle = angle;
    this.timestep = 20 / 1000;
    this.hooke = 0;
    this.drag = 1;
    this.rotDrag = 10;
    this.mass = 1;


    // state is x, vx, y, vy, theta, omega
    this.state = [start.x, 0, start.y, 0, angle, 0];
    this.input = 0;
    this.torque = 0;

    this.update = function () {

        // Governing differntial equation
        // d2x / dt2 = - k / m * x - u / m * dx/dt + input / m 

        // x1 = x
        // x2 = dx / dt

        // dx1 / dt = x2
        // dx2 / dt = -k / m * x1 - u / m * x2 + input / m

        let h = this.timestep * 4;

        let x1 = this.state[0];
        let x2 = this.state[1];
        let inputX = this.input * Math.cos(this.state[4]) / this.mass;

        let k11 = h * x2;
        let k12 = h * (- this.drag / this.mass * x2 + inputX);

        let k21 = h * (x2 + k11 / 2);
        let k22 = h * (- this.drag / this.mass * (x2 + k12 / 2) + inputX);

        let k31 = h * (x2 + k21 / 2);
        let k32 = h * (- this.drag / this.mass * (x2 + k22 / 2) + inputX);

        let k41 = h * (x2 + k31 / 2);
        let k42 = h * (- this.drag / this.mass * (x2 + k32 / 2) + inputX);

        this.state[0] = x1 + 1.0 / 6 * (k11 + 2 * k21 + 2 * k31 + k41);
        this.state[1] = x2 + 1.0 / 6 * (k12 + 2 * k22 + 2 * k32 + k42);

        // same for y

        let y1 = this.state[2];
        let y2 = this.state[3];
        let inputY = this.input * Math.sin(this.state[4]) / this.mass;

        k11 = h * y2;
        k12 = h * (- this.drag / this.mass * y2 + inputY);

        k21 = h * (y2 + k11 / 2);
        k22 = h * (- this.drag / this.mass * (y2 + k12 / 2) + inputY);

        k31 = h * (y2 + k21 / 2);
        k32 = h * (- this.drag / this.mass * (y2 + k22 / 2) + inputY);

        k41 = h * (y2 + k31 / 2);
        k42 = h * (- this.drag / this.mass * (y2 + k32 / 2) + inputY);

        this.state[2] = y1 + 1.0 / 6 * (k11 + 2 * k21 + 2 * k31 + k41);
        this.state[3] = y2 + 1.0 / 6 * (k12 + 2 * k22 + 2 * k32 + k42);

        // rotational
        // d2(theta) / dt2 = -k / I theta -u / I* d(theta) / dt - Torque / I

        // t1 = theta
        // t2 = d(theta) / dt   
        // dt1/dt = t2
        // dt2/dt = -k/I x1 - u/I x2 - Torque / I

        // use I = mass for now
        // no rotational spring        

        let t1 = this.state[4];
        let t2 = this.state[5];
        let inputT = this.torque / this.mass;

        k11 = h * t2;
        k12 = h * (- this.rotDrag / this.mass * t2 + inputT);

        k21 = h * (t2 + k11 / 2);
        k22 = h * (- this.rotDrag / this.mass * (t2 + k12 / 2) + inputT);

        k31 = h * (t2 + k21 / 2);
        k32 = h * (- this.rotDrag / this.mass * (t2 + k22 / 2) + inputT);

        k41 = h * (t2 + k31 / 2);
        k42 = h * (- this.rotDrag / this.mass * (t2 + k32 / 2) + inputT);

        this.state[4] = t1 + 1.0 / 6 * (k11 + 2 * k21 + 2 * k31 + k41);
        this.state[5] = t2 + 1.0 / 6 * (k12 + 2 * k22 + 2 * k32 + k42);

        this.position = new Point(this.state[0], this.state[2]);
        this.angle = this.state[4];

    }

}

function GaussianNoise(mean, sigma) {
    // use the box-muller transform

    const epsilon = 0.01;
    let z0, z1;
    let u1, u2;
    do {
        u1 = Math.random();
        u2 = Math.random();
    } while (u1 <= epsilon);

    z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(Math.PI * 2 * u2);
    z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(Math.PI * 2 * u2);

    // doesn't matter which one is chosen
    return z0 * sigma + mean;
}
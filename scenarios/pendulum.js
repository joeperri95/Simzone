

class PendulumScenario {
    constructor() {
        this.scene = new Scene();

        // abstract the drawing into a view class
        this.pend = new pendulum(400, 400, 0, 250, 20);
        this.motor = 0; // motor torque   
        this.model = new PendulumModel(100, 110, 250, 20, 0);        
        this.pid = new PIDController(10, 1, 1, 0);
        this.controls = document.getElementById('control-panel');
        this.INTERVAL = 20;
    }

    start = function () {

        this.momentRange = new Slider('moment', 1, 1000, 50);
        this.frictionRange = new Slider('friction', 1, 100, 10);
        this.motorRange = new Slider('motor power', 0, 100, 2);
        this.kpRange = new Slider('Kp', 1, 100, 10);
        this.kiRange = new Slider('Ki', 1, 100, 1);
        this.kdRange = new Slider('Kd', 1, 100, 2);
        this.logBox = new CheckBox('logs', logging);

        this.momentRange.slider.addEventListener('change', (event) => {
            this.model.moment = event.target.value;
        })

        this.frictionRange.slider.addEventListener('change', (event) => {
            this.model.friction = event.target.value;
        })

        this.motorRange.slider.addEventListener('change', (event) => {
            this.motor = event.target.value;
        })

        this.logBox.checkbox.addEventListener('change', (event) => {            
            logging = this.logBox.checkbox.checked;            
        })
        this.kpRange.slider.addEventListener('change', (event) => {
            this.pid.kp = event.target.value;
        })
        this.kiRange.slider.addEventListener('change', (event) => {
            this.pid.ki = event.target.value;
        })
        this.kdRange.slider.addEventListener('change', (event) => {
            this.pid.kd = event.target.value;
        })

        this.controls.innerHTML = '<h2>Control Panel</h2>';
        this.controls.appendChild(this.momentRange.container);
        this.controls.appendChild(this.frictionRange.container);        
        this.controls.appendChild(this.motorRange.container);  
        this.controls.appendChild(this.kpRange.container);
        this.controls.appendChild(this.kiRange.container);
        this.controls.appendChild(this.kdRange.container);      
        this.controls.appendChild(this.logBox.container);        
            
        this.scene.canvas.addEventListener("mousemove", (event) => {
            var mouse = getCursorPosition(this.scene.canvas, event);            
            let angle = lineAngle(new Point(400, 400), mouse);
            
            if(angle < 0){
                angle = Math.abs(angle);
            }
            else{
                angle = Math.PI * 2 - angle;
            }
            //angle = angle % Math.PI * 2;
            
            log(`angle ${angle}`);
            this.pid.target = angle;
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
    };

    stop = function () {
        clearInterval(this.interval);
    };

    update = function () {
        
        this.scene.clear();
        
        this.model.motor = this.motor;      
        this.model.input = this.pid.update(this.model.state[0]);
        
        this.model.update();          
        
        this.pend.angle = this.model.state[0];
        this.pend.update();
        this.pend.render(this.scene.context);       

        drawArrow(this.scene.context, this.pend.centerView, {x: this.pend.centerView.x, y: this.pend.centerView.y + 100}, 'red');        

    };
}

function PIDController(p, i, d, target) {

    this.kp = p;
    this.ki = i;
    this.kd = d;
    
    this.target = target;
    this.timestep = 20.0 / 1000;
    
    this.errorList = []; // list of error terms for integral controller

    this.update = function(input){
        //log(`input ${input}`)
        const ERROR_LIST_SIZE = 20;
        var integral = 0;
        var derivative = 0;
        var error = this.target - input;
        
        for(let i = 0; i < this.errorList.length; i++)
        {
            // TODO use better integration
            integral += this.timestep * this.errorList[i];            
        }

        if(this.errorList.length > 0){
            derivative = (error - this.errorList[this.errorList.length - 1]) / this.timestep;
        }        

        if(this.errorList.length >= ERROR_LIST_SIZE)
        {
            this.errorList.shift();
            this.errorList.push(error);
        }
        else{
            this.errorList.push(error);
        }

        var output = error * this.kp + integral * this.ki + derivative * this.kd;     
        //log(`output ${output}`)   
        return output;

    }

}

function PendulumModel(x, y, w, h, angle) {
    
    this.center = {x: 225, y: 110};
    this.pivot = {x, y};
    this.width = w;
    this.height = h;
    this.motor = 10;
    this.state = [angle, 0];
    this.input = 0;
    this.timestep = 20.0 / 1000;
    // moment of intertia
    this.moment = 50;
    this.friction = 10;

    this.update = function () {

        // state is theta, omega

        // Governing ode
        // here x = angle, I = moment of inertia, k = rotational spring constant, u = friction constant, T = external torques
        // d2x / d2t = -k / I * x - u / I * dx/dt + T / I
        // x1 = x
        // x2 = dx/dt
        
        // d (x1) / dt = x2
        // d (x2) / dt = -k / I * x1 - u / I * x2 + T / I

        // 4th order runge kutta
        let h = this.timestep * 4;
        this.hooke = 0;        

        let Torque = - 9.8 / (this.width / 2) * Math.sin( 3* Math.PI / 2 - this.state[0]);
        
        
        Torque += this.input / this.moment * this.motor;
        
        let x1 = this.state[0];
        let x2 = this.state[1];

        let k11 = h * x2;
        let k12 = h * (- this.friction / this.moment * x2 + Torque); 

        let k21 = h * (x2 + k11 / 2);
        let k22 = h * (- this.friction / this.moment * (x2 + k12 / 2) + Torque); 
        
        let k31 = h * (x2 + k21 / 2);
        let k32 = h * (- this.friction / this.moment * (x2 + k22 / 2) + Torque); 
        
        let k41 = h * (x2 + k31 / 2);
        let k42 = h * (- this.friction / this.moment * (x2 + k32 / 2) + Torque); 
        
        this.state[0] = x1 + 1.0 / 6 * (k11 + 2 * k21 + 2 * k31 + k41);
        this.state[1] = x2 + 1.0 / 6 * (k12 + 2 * k22 + 2 * k32 + k42);        

        this.center.x = this.pivot.x + this.width / 2 * Math.cos(this.state[0])
        this.center.y = this.pivot.y + this.width / 2 * Math.sin(this.state[0])
    }

}

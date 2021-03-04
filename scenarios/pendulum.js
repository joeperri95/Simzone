var logging = true;

class PendulumScenario {
    constructor() {
        this.scene = new Scene();

        // abstract the drawing into a view class
        this.body = new Rectangle('grey', 100, 100, 250, 20);
        this.pivot = new Dot(5, 'white', 100, 110);  
        this.center = new CentroidIndicator(5, 225, 110);      
        this.model = new PendulumModel(100, 110, 250, 20, 0);        
        this.controls = document.getElementById('control-panel');
        this.INTERVAL = 20;
    }

    start = function () {

        this.momentRange = new Slider('moment', 1, 1000);
        this.frictionRange = new Slider('friction', 1, 100);
        this.logBox = new CheckBox('logs', logging);

        this.momentRange.value = 50;
        this.frictionRange.value = 10;

        this.momentRange.slider.addEventListener('change', (event) => {
            this.model.moment = event.target.value;
        })

        this.frictionRange.slider.addEventListener('change', (event) => {
            this.model.friction = event.target.value;
        })

        this.logBox.checkbox.addEventListener('change', (event) => {            
            logging = this.logBox.checkbox.checked;            
        })

        this.controls.innerHTML = '<h2>Control Panel</h2>';
        this.controls.appendChild(this.momentRange.container);
        this.controls.appendChild(this.frictionRange.container);        
        this.controls.appendChild(this.logBox.container);        
        
        this.scene.canvas.addEventListener("mousemove", (event) => {
            var mouse = getCursorPosition(this.scene.canvas, event);            
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
        
        this.model.update();                

    
        this.body.angle = this.model.state[0];
        this.body.render(this.scene.context);
        this.pivot.render(this.scene.context);
        
        this.center.setPos(this.model.center);
        this.center.render(this.scene.context)    
        drawArrow(this.scene.context, this.center, {x: this.center.x, y: this.center.y + 100}, 'red');        

    };
}

function PendulumModel(x, y, w, h, angle) {
    
    this.center = {x: 225, y: 110};
    this.pivot = {x, y};
    this.width = w;
    this.height = h;
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

function log(str) {
    if(logging){
        console.log(str)
    }
}
var logging = true;

// I need a controller class to wrangle coords between model and view

class DoublePendulumScenario {
    constructor() {
        this.scene = new Scene();

        // abstract the drawing into a view class
        this.body1 = new Rectangle('grey', 100, 100, 250, 20);
        this.pivot1 = new Dot(5, 'white', 100, 110);  
        this.center1 = new CentroidIndicator(5, 225, 110);      
        this.body2 = new Rectangle('grey', 350, 100, 250, 20);
        this.pivot2 = new Dot(5, 'white', 350, 110);  
        this.center2 = new CentroidIndicator(5, 475, 110);      
        this.model = new DoublePendulumModel(0,0,0,0);    
        this.controls = document.getElementById('control-panel');
        
        this.INTERVAL = 20;
    }

    start = function () {

        this.momentRange = new Slider('moment', 1, 1000);
        this.frictionRange = new Slider('friction', 1, 100);
        this.logBox = new CheckBox('logs', logging);

        this.momentRange.slider.addEventListener('change', (event) => {
            //this.model.moment = event.target.value;
        })

        this.frictionRange.slider.addEventListener('change', (event) => {
            //this.model.friction = event.target.value;
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

        this.body1.angle = this.model1.state[0];
        this.body1.render(this.scene.context);
        this.pivot1.render(this.scene.context);
        
        this.center1.setPos(this.model1.center);
        this.center1.render(this.scene.context)    
        drawArrow(this.scene.context, this.center1, {x: this.center1.x, y: this.center1.y + 100}, 'red');        

        this.body2.angle = this.model2.state[0];
        this.body2.render(this.scene.context);
        this.pivot2.render(this.scene.context);
        
        this.center2.setPos(this.model2.center);
        this.center2.render(this.scene.context)    
        drawArrow(this.scene.context, this.center2, {x: this.center2.x, y: this.center2.y + 100}, 'red');   
    };
}

function DoublePendulumModel(theta1, w1, theta2, w2) {
    
    this.state = [theta1, w1, theta2, w2];
    this.input = 0;
    this.timestep = 20.0 / 1000;
    
    this.u1 = 10;
    this.u2 = 10;

    this.l1 = 10;
    this.l2 = 10;

    this.m1 = 10;
    this.m2 = 10;

    this.update = function () {

        // state is x, y, theta, omega
        // 4th order runge kutta

        let theta1 = this.state[0]
        let w1 = this.state[1]
        let theta2 = this.state[2]
        let w2 = this.state[3]

        let l1 = this.l1;
        let l2 = this.l2;

        var g = 9.8;


        let m1 = this.m1
        let m2 = this.m2;
        let x1 = this.l1/2 * Math.sin(theta1)
        let y1 = - this.l1/2 * Math.cos(theta1)
        let x2 = this.l1 * Math.sin(theta1) + this.l2/2 * Math.sin(theta2)   
        let y2 = - this.l1 * Math.cos(theta1) - this.l2/2 * Math.cos(theta2)   

        let L = w1 * w1 * l1 * l1 *(1/6 * m1 + 1/2 * m2) + w2 * w2 * (1/6 * m2 * l2^2) + (1/2 * m2 * w1 * w2 * l1 * l2 * Math.cos(theta2 - theta1)) + 1/2 * g * ( l1 * Math.cos(theta1) * (m1 + 2 * m2) + l2 * m2 * Math.cos(theta2));
    
    
    }  
}

function log(str) {
    if(logging){
        console.log(str)
    }
}

// Governing equations

// Location of centers of mass
// x1 = l1/2 * sin(theta1)
// y1 = - l1/2 * cos(theta1)
// x2 = l1 * sin(theta1) + l2/2 * sin(theta2)   
// y2 = - l1 * cos(theta1) - l2/2 * cos(theta2)   

// Translational velocity
// v1 = sqrt((dx1/dt)^2 + (dy1/dt)^2)
// v1 = sqrt( (l1 / 2 * w1 *cos(theta1)) ^ 2 + ( l1 / 2 * w1 * sin(theta1)) ^ 2)
// v1 = sqrt( 1/4 * w1^2 * l1^2 * (cos^2(theta1) + sin^2(theta1)))
// v1 = sqrt( 1/4 * w1^2 *l1 ^2)

// v2 = sqrt((dx2/dt)^2 + (dy2/dt)^2
// v2 = sqrt((w1 * l1 * cos(theta1) + l2/2 * w2 * cos(theta2))^2 + ( l1 * w1 * sin(theta1) + l2/2 * w2 * sin(theta2))^2)
// v2 = sqrt(w1^2 * l1^2 * cos^2(theta1) + w1 * w2 * l1 * l2 * cos(theta1) * cos(theta2) + 1/4 * l2^2 * w2^2*cos^2(theta2)
//         + w1^2 + l1^2 * sin^2(theta1) + w1 * w2 * l1 * l2 * sin(theta1) * sin(theta2) + 1/4 * l2^2 * w2^2*sin^2(theta2))
// v2 = sqrt(l1^2 * w1^2 + w1 * w2 * l1 * l2 *(cos(theta1)cos(theta2) + sin(theta1)sin(theta2) + 1/4 * l2^2 * w2^2))
// v2 = sqrt(l1^2 + w1^2 + w1 * w2 * l1 * l2 * cos(theta2 - theta1) + 1/4 * l2^2 * w2^2)

// Lagrangian 
// L = Tt + Tr - V
// L = 1/2 (m1 * v1^2 + m2 * v2 ^ 2) + 1/2 ( I1 * w1 ^ 2 + I2 * w2 ^ 2) - g( m1 * y1 + m2 * y2)
// L = 1/2 * (m1 * (1/4 * w1^2 * l1^2) + m2 * (w1^2 * l1^2 + w1 * w2 * l1 * l2 * cos(theta2 - theta1) + 1/4 * l2^2 * w2^2)) 
//     + 1/2 * (I1 * w1 ^ 2 + I2 * w2 ^ 2) - g(m1 * (- l1/2 * cos(theta1)) + m2 * (- l1 * cos(theta1) - l2/2 * cos(theta2)))             
// L = w1^2( 1/8 * m1 * l1^2 + 1/2 * m2 * l1^2 + 1/2 * I1) + w2^2( 1/8 * m2 * l2 ^2 + 1/2 * I2) + (1/2 * m2 * w1 * w2 * l1 * l2 * cos(theta2 - theta1)) - g(m1 * (- l1/2 * cos(theta1)) + m2 * (- l1 * cos(theta1) - l2/2 * cos(theta2)))             
// L = w1^2( 1/8 * m1 * l1^2 + 1/2 * m2 * l1^2 + 1/2 * 1/12 * m1 * l1^2) + w2^2( 1/8 * m2 * l2 ^2 + 1/2 * 1/12 * m2 * l2^2) + (1/2 * m2 * w1 * w2 * l1 * l2 * cos(theta2 - theta1)) - g(m1 * (- l1/2 * cos(theta1)) + m2 * (- l1 * cos(theta1) - l2/2 * cos(theta2)))             
// L = w1^2 * l1^2 *(1/6 * m1 + 1/2 * m2) + w2^2(1/6 * m2 * l2^2) + (1/2 * m2 * w1 * w2 * l1 * l2 * cos(theta2 - theta1)) + 1/2 * g( l1 * cos(theta1) * (m1 + 2 * m2) + l2 * m2 * cos(theta2)))

// Proof
// if m1 = m2 and l1 = l2
// L = w1^2( 1/8 * m * l^2 + 1/2 * m * l^2 + 1/2 * 1/12 * m * l^2 ) + w2^2(1/8 * m * l^2 + 1/2 * 1/12 * m * l^2) + (1/2 * m * w1 * w2 * l^2 * cos(theta2 - theta1)) - g(m * (- l/2 * cos(theta1)) + m * (- l * cos(theta1) - l/2 * cos(theta2)))                   
// L = w1^2 (ml^2 (1/8 + 1/2 + 1/24)) + w2^2(ml^2(1/8 + 1/24)) + ml^2(w1 * w2 * 1/2 * cos(theta2- theta1))) + gml/2 (3 * cos(theta1) + cos(theta2)))
// L = ml^2 (w1^2 * 2/3 + w2^2 * 1/6 +  1/2 * w1 * w2 * cos(theta2- theta1)) + gml/2 (3 * cos(theta1) + cos(theta2)))
// L = 1/6 * ml^2 (4 * w1^2 + w2^2 + 3 * w1 * w2 * cos(theta2 - theta1)) + 1/2 * gml (3 * cos(theta1) + cos(theta2))
// Which matches known equation for this problem

var logging = true;
var paused = false;

// I need a controller class to wrangle coords between model and view

class DoublePendulumScenario {
    constructor() {
        this.scene = new Scene();

        // Transform the view such that theta is the angle from straight down
        // This doesn't affect the calculations just how the objects are rendered
        this.scene.context.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        this.scene.context.rotate(Math.PI)
        this.scene.context.translate(- CANVAS_WIDTH / 2, -CANVAS_HEIGHT / 2);

        // abstract the drawing into a view class
        this.pend1 = new pendulum(400, 400, 0, 100, 20, 10);
        this.pend2 = new pendulum(400, 500, 0, 100, 20, 10);
        this.model = new DoublePendulumModel(0, 0, 0, 0);
        this.controls = document.getElementById('control-panel');

        this.INTERVAL = 20;
    }

    start = function () {

        this.theta1Range = new Slider('theta1', 1, 360);
        this.theta2Range = new Slider('theta2', 1, 360);
        this.logBox = new CheckBox('logs', logging);
        this.pauseBox = new CheckBox('pause', paused);
        this.restart = new Button("restart");

        this.theta1Range.value = 180;
        this.theta2Range.value = 180;

        this.restart.btn.addEventListener('click', (event) => {
            this.stop();
            let state = this.model.state;
            this.model = new DoublePendulumModel(state[0], state[1], 0, 0);
            this.start();
        })

        this.theta1Range.slider.addEventListener('change', (event) => {
            //this.model.moment = event.target.value;
            this.model.state[0] = Math.PI * event.target.value / 180
        })

        this.theta2Range.slider.addEventListener('change', (event) => {
            //this.model.friction = event.target.value;
            this.model.state[1] = Math.PI * event.target.value / 180
        })

        this.logBox.checkbox.addEventListener('change', (event) => {
            logging = this.logBox.checkbox.checked;
        })

        this.pauseBox.checkbox.addEventListener('change', (event) => {
            paused = this.pauseBox.checkbox.checked;
        })

        this.controls.innerHTML = '<h2>Control Panel</h2>';
        this.controls.appendChild(this.theta1Range.container);
        this.controls.appendChild(this.theta2Range.container);
        this.controls.appendChild(this.logBox.container);
        this.controls.appendChild(this.pauseBox.container);
        this.controls.appendChild(this.restart.container);

        this.scene.canvas.addEventListener("mousemove", (event) => {
            var mouse = getCursorPosition(this.scene.canvas, event);
        })
        
        this.interval = setInterval(
            (function (self) {
                return function () {
                    if (!paused) {
                        self.update();
                    }
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
/*
        let angle1 = 3 * Math.PI / 2 + this.model.state[0];
        this.body1.angle = angle1//3* Math.PI / 2 + this.model.state[0];
        this.body1.pivot = this.pivot1;
        this.body1.render(this.scene.context);
        this.pivot1.render(this.scene.context);

        this.center1.setPos({ x: this.model.x1 + this.pivot1.x, y: this.model.y1 + this.pivot1.y });
        this.center1.render(this.scene.context)
        drawArrow(this.scene.context, this.center1, { x: this.center1.x, y: this.center1.y - 100 }, 'red');

        let angle2 = 3 * Math.PI / 2 + this.model.state[1];

        this.pivot2.setPos({ x: this.pivot1.x + this.model.l1 * Math.sin(this.model.state[0]), y: this.pivot1.y - this.model.l1 * Math.cos(this.model.state[0]) })
        this.pivot2.render(this.scene.context);

        this.body2.angle = angle2 //3* Math.PI / 2 + this.model.state[2];
        this.body2.pivot = this.pivot2;
        this.body2.setPos({ x: this.pivot2.x - 10, y: this.pivot2.y - 10 })
        this.body2.render(this.scene.context);

        this.center2.setPos({ x: this.model.x2 + this.pivot1.x, y: this.model.y2 + this.pivot1.y });
        this.center2.render(this.scene.context)
        drawArrow(this.scene.context, this.center2, { x: this.center2.x, y: this.center2.y - 100 }, 'blue');
*/
        this.pend1.angle = 3 * Math.PI / 2 + this.model.state[0];
        this.pend1.rodView.color = 'red';
        this.pend1.update();

        this.pend2
        this.pend2.angle = 3 * Math.PI / 2 + this.model.state[1];
        this.pend2.update();

        this.pend2.render(this.scene.context);
        this.pend1.render(this.scene.context);

    };
}

function DoublePendulumModel(theta1, theta2, w1, w2) {

    //pendulum1, pendulum2;

    let t1 = theta1// - Math.PI
    let t2 = theta2// - Math.PI

    this.input = 0;
    this.timestep = 20.0 / 1000;

    this.u1 = 10;
    this.u2 = 10;

    this.l1 = 250;
    this.l2 = 250;

    this.m1 = 10;
    this.m2 = 10;

    let p1_0 = (1 / 3 * this.m1 + this.m2) * this.l1 * this.l1 * w1 + 1 / 2 * this.m2 * this.l1 * this.l2 * w2 * Math.cos(t1 - t2);
    let p2_0 = 1 / 3 * this.m2 * this.l2 * this.l2 * w2 + 1 / 2 * this.m2 * this.l1 * this.l2 * w1 * Math.cos(t1 - t2);

    this.state = [t1, t2, p1_0, p2_0]

    this.x1 = this.l1 / 2 * Math.sin(t1)
    this.y1 = - this.l1 / 2 * Math.cos(t1)
    this.x2 = this.l1 * Math.sin(t1) + this.l2 / 2 * Math.sin(t2)
    this.y2 = - this.l1 * Math.cos(t1) - this.l2 / 2 * Math.cos(t2)


    this.update = function () {

        // state is x, y, theta, omega
        // 4th order runge kutta

        let theta1 = this.state[0]
        let theta2 = this.state[1]


        let l1 = this.l1;
        let l2 = this.l2;

        var g = 9.8;

        let m1 = this.m1;
        let m2 = this.m2;

        this.x1 = this.l1 / 2 * Math.sin(theta1)
        this.y1 = - this.l1 / 2 * Math.cos(theta1)
        this.x2 = this.l1 * Math.sin(theta1) + this.l2 / 2 * Math.sin(theta2)
        this.y2 = - this.l1 * Math.cos(theta1) - this.l2 / 2 * Math.cos(theta2)

        // Runge kutta 

        // x1 = theta1
        // x2 = theta2
        // x3 = p1
        // x4 = p2

        // dx1 = 6 / (l1 * l1) * (2 * x3 - 3 * l1 / l2 * Math.cos(x1 - x2) * x4) / (4 *(m1 + 3 * m2) - 9 * m2 * Math.cos(x1 - x2) * Math.cos(x1 - x2))
        // dx2 = 6 / (m2 * l2 * l2) * (2 * x4 * (m1 + 3 * m2) - 3 * m2 * l2 / l1 * Math.cos(x1 - x2) * x3) / (4 *(m1 + 3 * m2) - 9 * m2 * Math.cos(x1 - x2) * Math.cos(x1 - x2))
        // dx3 = - 1/2 * m2 * l1 * l2 * w1 * w2 * Math.sin(x1 - x2) - (1/2 * m1 + m2) * g * l1 * Math.sin(x1)
        // dx4 = 1/2 * m2 * l1 * l2 * w1 * w2 * Math.sin(x1 - x2) - 1/2 * m2 * g * l2 * Math.sin(x2)


        let h = this.timestep * 4;

        let x1 = this.state[0]
        let x2 = this.state[1]
        let x3 = this.state[2]
        let x4 = this.state[3]

        let k11 = h * (6 / (l1 * l1) * (2 * x3 - 3 * l1 / l2 * Math.cos(x1 - x2) * x4) / (4 * (m1 + 3 * m2) - 9 * m2 * Math.cos(x1 - x2) * Math.cos(x1 - x2)))
        let k12 = h * (6 / (m2 * l2 * l2) * (2 * x4 * (m1 + 3 * m2) - 3 * m2 * l2 / l1 * Math.cos(x1 - x2) * x3) / (4 * (m1 + 3 * m2) - 9 * m2 * Math.cos(x1 - x2) * Math.cos(x1 - x2)))
        let k13 = h * (- 1 / 2 * m2 * l1 * l2 * k11 / h * k12 / h * Math.sin(x1 - x2) - (1 / 2 * m1 + m2) * g * l1 * Math.sin(x1))
        let k14 = h * (1 / 2 * m2 * l1 * l2 * k11 / h * k12 / h * Math.sin(x1 - x2) - 1 / 2 * m2 * g * l2 * Math.sin(x2))

        let k21 = h * (6 / (l1 * l1) * (2 * (x3 + k13 / 2) - 3 * l1 / l2 * Math.cos(x1 + k11 / 2 - (x2 + k12 / 2)) * (x4 + k14 / 2)) / (4 * (m1 + 3 * m2) - 9 * m2 * Math.cos(x1 + k11 / 2 - (x2 + k12 / 2)) * Math.cos(x1 + k11 / 2 - (x2 + k12 / 2))))
        let k22 = h * (6 / (m2 * l2 * l2) * (2 * (x4 + k14 / 2) * (m1 + 3 * m2) - 3 * m2 * l2 / l1 * Math.cos(x1 + k11 / 2 - (x2 + k12 / 2)) * (x3 + k13 / 2)) / (4 * (m1 + 3 * m2) - 9 * m2 * Math.cos(x1 + k11 / 2 - (x2 + k12 / 2)) * Math.cos(x1 + k11 / 2 - (x2 + k12 / 2))))
        let k23 = h * (- 1 / 2 * m2 * l1 * l2 * k21 / h * k22 / h * Math.sin(x1 + k11 / 2 - (x2 + k12 / 2)) - (1 / 2 * m1 + m2) * g * l1 * Math.sin(x1 + k11 / 2))
        let k24 = h * (1 / 2 * m2 * l1 * l2 * k12 / h * k22 / h * Math.sin(x1 + k11 / 2 - (x2 + k12 / 2)) - 1 / 2 * m2 * g * l2 * Math.sin(x2 + k12 / 2))

        let k31 = h * (6 / (l1 * l1) * (2 * (x3 + k23 / 2) - 3 * l1 / l2 * Math.cos(x1 + k21 / 2 - (x2 + k22 / 2)) * (x4 + k24 / 2)) / (4 * (m1 + 3 * m2) - 9 * m2 * Math.cos(x1 + k21 / 2 - (x2 + k22 / 2)) * Math.cos(x1 + k21 / 2 - (x2 + k22 / 2))))
        let k32 = h * (6 / (m2 * l2 * l2) * (2 * (x4 + k24 / 2) * (m1 + 3 * m2) - 3 * m2 * l2 / l1 * Math.cos(x1 + k21 / 2 - (x2 + k22 / 2)) * (x3 + k23 / 2)) / (4 * (m1 + 3 * m2) - 9 * m2 * Math.cos(x1 + k21 / 2 - (x2 + k22 / 2)) * Math.cos(x1 + k21 / 2 - (x2 + k22 / 2))))
        let k33 = h * (- 1 / 2 * m2 * l1 * l2 * k31 / h * k32 / h * Math.sin(x1 + k21 / 2 - (x2 + k22 / 2)) - (1 / 2 * m1 + m2) * g * l1 * Math.sin(x1 + k21 / 2))
        let k34 = h * (1 / 2 * m2 * l1 * l2 * k32 / h * k32 / h * Math.sin(x1 + k21 / 2 - (x2 + k22 / 2)) - 1 / 2 * m2 * g * l2 * Math.sin(x2 + k22 / 2))

        let k41 = h * (6 / (l1 * l1) * (2 * (x3 + k33 / 2) - 3 * l1 / l2 * Math.cos(x1 + k31 / 2 - (x2 + k32 / 2)) * (x4 + k34 / 2)) / (4 * (m1 + 3 * m2) - 9 * m2 * Math.cos(x1 + k31 / 2 - (x2 + k32 / 2)) * Math.cos(x1 + k31 / 2 - (x2 + k32 / 2))))
        let k42 = h * (6 / (m2 * l2 * l2) * (2 * (x4 + k34 / 2) * (m1 + 3 * m2) - 3 * m2 * l2 / l1 * Math.cos(x1 + k31 / 2 - (x2 + k32 / 2)) * (x3 + k33 / 2)) / (4 * (m1 + 3 * m2) - 9 * m2 * Math.cos(x1 + k31 / 2 - (x2 + k32 / 2)) * Math.cos(x1 + k31 / 2 - (x2 + k32 / 2))))
        let k43 = h * (- 1 / 2 * m2 * l1 * l2 * k41 / h * k42 / h * Math.sin(x1 + k31 / 2 - (x2 + k32 / 2)) - (1 / 2 * m1 + m2) * g * l1 * Math.sin(x1 + k31 / 2))
        let k44 = h * (1 / 2 * m2 * l1 * l2 * k42 / h * k42 / h * Math.sin(x1 + k31 / 2 - (x2 + k32 / 2)) - 1 / 2 * m2 * g * l2 * Math.sin(x2 + k32 / 2))

        this.state[0] = x1 + 1.0 / 6 * (k11 + 2 * k21 + 2 * k31 + k41);
        this.state[1] = x2 + 1.0 / 6 * (k12 + 2 * k22 + 2 * k32 + k42);
        this.state[2] = x3 + 1.0 / 6 * (k13 + 2 * k23 + 2 * k33 + k43);
        this.state[3] = x4 + 1.0 / 6 * (k14 + 2 * k24 + 2 * k34 + k44);

        log(this.state)
    }
}

function pendulum(x, y, angle, length, width, mass) {

    this.x = x;
    this.y = y;
    this.angle = angle
    
    this.length = length; // length of the rod
    this.width = width;   // width of rod
    this.mass = mass;
    this.friction= 0;     // pivot friction
    this.hooke=0;         // pivot spring constant
    
    this.pivotView = new Dot(5, 'white', this.x , this.y + this.width / 2);
    this.centerView = new CentroidIndicator(5, this.x + this.length / 2 * Math.cos(angle), this.y + this.width /2 + this.length / 2 * Math.sin(angle))
    this.rodView = new Rectangle('grey', x, y, this.length, this.width);
    this.rodView.pivot = {x: this.pivotView.x, y: this.pivotView.y};
    this.rodView.angle = angle;
    this.state = [angle, 0];

    this.setPos = function(point) {
        
    }

    this.update = function () {
        this.centerView.setPos( new Point(this.x + this.length / 2 * Math.cos(this.angle), this.y + this.width /2 + this.length / 2 * Math.sin(this.angle)));
        this.rodView.angle = this.angle;
    }

    this.render = function (ctx) {
        this.rodView.render(ctx);
        this.pivotView.render(ctx)
        this.centerView.render(ctx);
    }
}

function log(str) {
    if (logging) {
        console.log(str)
    }
}

// MATH BELOW
// you were warned

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
// v2 = sqrt(l1^2 + w1^2 + w1 * w2 * l1 * l2 * cos(theta1 - theta2) + 1/4 * l2^2 * w2^2)

// Lagrangian 
// L = Tt + Tr - V
// L = 1/2 (m1 * v1^2 + m2 * v2 ^ 2) + 1/2 ( I1 * w1 ^ 2 + I2 * w2 ^ 2) - g( m1 * y1 + m2 * y2)
// L = 1/2 * (m1 * (1/4 * w1^2 * l1^2) + m2 * (w1^2 * l1^2 + w1 * w2 * l1 * l2 * cos(theta1 - theta2) + 1/4 * l2^2 * w2^2)) 
//     + 1/2 * (I1 * w1 ^ 2 + I2 * w2 ^ 2) - g(m1 * (- l1/2 * cos(theta1)) + m2 * (- l1 * cos(theta1) - l2/2 * cos(theta2)))             
// L = w1^2( 1/8 * m1 * l1^2 + 1/2 * m2 * l1^2 + 1/2 * I1) + w2^2( 1/8 * m2 * l2 ^2 + 1/2 * I2) + (1/2 * m2 * w1 * w2 * l1 * l2 * cos(theta1 - theta2)) - g(m1 * (- l1/2 * cos(theta1)) + m2 * (- l1 * cos(theta1) - l2/2 * cos(theta2)))             
// L = w1^2( 1/8 * m1 * l1^2 + 1/2 * m2 * l1^2 + 1/2 * 1/12 * m1 * l1^2) + w2^2( 1/8 * m2 * l2 ^2 + 1/2 * 1/12 * m2 * l2^2) + (1/2 * m2 * w1 * w2 * l1 * l2 * cos(theta1 - theta2)) - g(m1 * (- l1/2 * cos(theta1)) + m2 * (- l1 * cos(theta1) - l2/2 * cos(theta2)))             
// L = w1^2 * l1^2 *(1/6 * m1 + 1/2 * m2) + w2^2(1/6 * m2 * l2^2) + (1/2 * m2 * w1 * w2 * l1 * l2 * cos(theta1 - theta2)) + 1/2 * g( l1 * cos(theta1) * (m1 + 2 * m2) + l2 * m2 * cos(theta2)))

// Proof
// if m1 = m2 and l1 = l2
// L = w1^2( 1/8 * m * l^2 + 1/2 * m * l^2 + 1/2 * 1/12 * m * l^2 ) + w2^2(1/8 * m * l^2 + 1/2 * 1/12 * m * l^2) + (1/2 * m * w1 * w2 * l^2 * cos(theta1 - theta2)) - g(m * (- l/2 * cos(theta1)) + m * (- l * cos(theta1) - l/2 * cos(theta2)))                   
// L = w1^2 (ml^2 (1/8 + 1/2 + 1/24)) + w2^2(ml^2(1/8 + 1/24)) + ml^2(w1 * w2 * 1/2 * cos(theta2- theta1))) + gml/2 (3 * cos(theta1) + cos(theta2)))
// L = ml^2 (w1^2 * 2/3 + w2^2 * 1/6 +  1/2 * w1 * w2 * cos(theta2- theta1)) + gml/2 (3 * cos(theta1) + cos(theta2)))
// L = 1/6 * ml^2 (4 * w1^2 + w2^2 + 3 * w1 * w2 * cos(theta1 - theta2)) + 1/2 * gml (3 * cos(theta1) + cos(theta2))
// Which matches known equation for this problem

// d(L)/d(w1) = w1 * l1 * l1 * (1/3 * m1 + m2) + 1/2 * m2 * w2 * l1 * l2 * Math.cos(theta1 - theta2);
// d(L)/d(w2) = w2 * (1/3 * m2 * l2 * l2) + 1/2 * m2 * w1 * l1 * l2 * Math.cos(theta1 - theta2);

//d(L)/d(theta1) = - 1/2 * m2 * w1 * w2 * l1 * l2 * Math.sin(theta1 - theta2) - 1/2 * g * l1 * (m1 + 2 * m2) * Math.sin(theta1) ; 
//d(L)/d(theta2) = 1/2 * m2 * w1 * w2 * l1 * l2 * Math.sin(theta1 - theta2) - 1/2 * g * l2 * m2 * Math.sin(theta2);

// derivatives with respect to time of the partial derivative of the lagrangian with respect to w
// a = dw / dt = angular acceleration

// d(dL/dw1)/dt = a1 * l1 * l1 * (1/3 * m1 + m2) + 1/2 * m2 * a2 * l1 * l2 * Math.cos(theta1 - theta2) - 1/2 * m2 * w2 * l1 * l2 * Math.sin(theta1 - theta2) (w1 - w2)
// d(dL/dw2)/dt = a2 * ( 1/3 * m2 * l2 * l2) + 1/2 * m2 * a1 * l1 * l2  * Math.cos(theta1 - theta2) - 1/2 * m2 * w1 * l1 * l2 * Math.sin(theta1 - theta2) * (w1 - w2);

// Euler Lagrange
// d(d(L)/d(d(qi)/dt))/dt - d(L)/d(qi) = 0

// d(L)/d(theta1) = d(dL/dw1)/dt
// a1 * l1 * l1 * (1/3 * m1 + m2) + 1/2 * m2 * a2 * l1 * l2 * Math.cos(theta1 - theta2) - 1/2 * m2 * w2 * l1 * l2 * Math.sin(theta1 - theta2) (w1 - w2) - (- 1/2 * m2 * w1 * w2 * l1 * l2 * Math.sin(theta1 - theta2) - 1/2 * g * l1 * (m1 + 2 * m2) * Math.sin(theta1)) = 0
// a1 * l1 * l1 * (1/3 * m1 + m2) + 1/2 * m2 * a2 * l1 * l2 * Math.cos(theta1 - theta2) = 1/2 * m2 * w2 * l1 * l2 * Math.sin(theta1 - theta2) (w1 - w2) - 1/2 * m2 * w1 * w2 * l1 * l2 * Math.sin(theta1 - theta2) - 1/2 * g * l1 * (m1 + 2 * m2) * Math.sin(theta1))
// a1 * l1 * (1/3 * m1 + m2) + 1/2 * m2 * a2 * l2 * Math.cos(theta1 - theta2) = 1/2 * m2 * w2 * l2 * Math.sin(theta1 - theta2) (w1 - w2) - 1/2 * m2 * w1 * w2 * l2 * Math.sin(theta1 - theta2) - 1/2 * g * (m1 + 2 * m2) * Math.sin(theta1))
// a1 * l1 * (1/3 * m1 + m2) + 1/2 * m2 * a2 * l2 * Math.cos(theta1 - theta2) = 1/2 * m2 * w2 * l2 * Math.sin(theta1 - theta2) * w1 - 1/2 * m2 * w2 * l2 * Math.sin(theta1 - theta2) * w2 - 1/2 * m2 * w1 * w2 * l2 * Math.sin(theta1 - theta2) - 1/2 * g * (m1 + 2 * m2) * Math.sin(theta1))
// a1 * l1 * (1/3 * m1 + m2) + 1/2 * m2 * a2 * l2 * Math.cos(theta1 - theta2) = - 1/2 * m2 * l2 * Math.sin(theta1 - theta2) * w2 * w2  - 1/2 * g * (m1 + 2 * m2) * Math.sin(theta1))

// d(dL/dw2)/dt - d(L)/d(theta2) = 0
// a2 * ( 1/3 * m2 * l2 * l2) + 1/2 * m2 * a1 * l1 * l2  * Math.cos(theta1 - theta2) - 1/2 * m2 * w1 * l1 * l2 * Math.sin(theta1 - theta2) * (w1 - w2) - (1/2 * m2 * w1 * w2 * l1 * l2 * Math.sin(theta1 - theta2) - 1/2 * g * l2 * m2 * Math.sin(theta2)) = 0
// a2 * ( 1/3 * m2 * l2 * l2) + 1/2 * m2 * a1 * l1 * l2 * Math.cos(theta1 - theta2) = - 1/2 * m2 * w1 * l1 * l2 * Math.sin(theta1 - theta2) * (w1 - w2) + 1/2 * m2 * w1 * w2 * l1 * l2 * Math.sin(theta1 - theta2) + 1/2 * g * l2 * m2 * Math.sin(theta2))
// a2 * ( 1/3 * m2 * l2) + 1/2 * m2 * a1 * l1 * Math.cos(theta1 - theta2) = - 1/2 * m2 * w1 * l1 * Math.sin(theta1 - theta2) * (w1 - w2) + 1/2 * m2 * w1 * w2 * l1 * Math.sin(theta1 - theta2) + 1/2 * g *  m2 * Math.sin(theta2))
// a2 * ( 1/3 * m2 * l2) + 1/2 * m2 * a1 * l1 * Math.cos(theta1 - theta2) = - 1/2 * m2 * w1 * w1 * l1 * Math.sin(theta1 - theta2) + 1/2 * g *  m2 * Math.sin(theta2))
// a2 * ( 1/3 * l2) + 1/2 * a1 * l1 * Math.cos(theta1 - theta2) = - 1/2 * w1 * w1 * l1 * Math.sin(theta1 - theta2) + 1/2 * g * Math.sin(theta2))

// get ready to sub in
// a2 * ( 1/3 * l2) + 1/2 * a1 * l1 * Math.cos(theta1 - theta2) = - 1/2 * w1 * w1 * l1 * Math.sin(theta1 - theta2) + 1/2 * g * Math.sin(theta2))
// a2 * ( 1/3 * l2) = - 1/2 * w1 * w1 * l1 * Math.sin(theta1 - theta2) + 1/2 * g * Math.sin(theta2)) - 1/2 * a1 * l1 * Math.cos(theta1 - theta2)
// a2  = (3 / l2) * (- 1/2 * w1 * w1 * l1 * Math.sin(theta1 - theta2) + 1/2 * g * Math.sin(theta2)) - 1/2 * a1 * l1 * Math.cos(theta1 - theta2))
// a2  = (1 / (2 * l2)) * (-3 * w1 * w1 * l1 * Math.sin(theta1 - theta2) + 3 * g * Math.sin(theta2)) - 3 * a1 * l1 * Math.cos(theta1 - theta2))

// sub a2 in
// a1 * l1 * (1/3 * m1 + m2) + 1/2 * m2 * a2 * l2 * Math.cos(theta1 - theta2) = - 1/2 * m2 * l2 * Math.sin(theta1 - theta2) * w2 * w2  - 1/2 * g * (m1 + 2 * m2) * Math.sin(theta1))
// a1 * l1 * (1/3 * m1 + m2) + 1/2 * m2 * ((1 / (2 * l2)) * (-3 * w1 * w1 * l1 * Math.sin(theta1 - theta2) + 3 * g * Math.sin(theta2)) - 3 * a1 * l1 * Math.cos(theta1 - theta2))) * l2 * Math.cos(theta1 - theta2) = - 1/2 * m2 * l2 * Math.sin(theta1 - theta2) * w2 * w2  - 1/2 * g * (m1 + 2 * m2) * Math.sin(theta1))

// a1 * l1 * (1/3 * m1 + m2) + (m2 * Math.cos(theta1 - theta2) / 4) * (-3 * w1 * w1 * l1 * Math.sin(theta1 - theta2) + 3 * g * Math.sin(theta2)) - 3 * a1 * l1 * Math.cos(theta1 - theta2)))  = - 1/2 * m2 * l2 * Math.sin(theta1 - theta2) * w2 * w2  - 1/2 * g * (m1 + 2 * m2) * Math.sin(theta1))
// a1 * l1 * (1/3 * m1 + m2) + (m2 * Math.cos(theta1 - theta2) / 4) *(- 3 * a1 * l1 * Math.cos(theta1 - theta2))   = - 1/2 * m2 * l2 * Math.sin(theta1 - theta2) * w2 * w2  - 1/2 * g * (m1 + 2 * m2) * Math.sin(theta1)) -  (- 3 * w1 * w1 * l1 * Math.sin(theta1 - theta2) + 3 * g * Math.sin(theta2)))) * (m2 * Math.cos(theta1 - theta2) / 4)
// a1 * l1 * (1/3 * m1 + m2) - 3/4 * m2 * cos^2(theta1 - theta2) * a1 * l1   = - 1/2 * m2 * l2 * Math.sin(theta1 - theta2) * w2 * w2  - 1/2 * g * (m1 + 2 * m2) * Math.sin(theta1)) + 3/4 * m2 * w1 * w1 * l1 * Math.sin(theta1 - theta2) * Math.cos(theta1 - theta2) - 3/4 * m2 * g *Math.cos(theta1 - theta2)*  Math.sin(theta2))
// a1 * l1 * ((1/3 * m1 + m2 - 3/4 * m2 * cos^2(theta1 - theta2)) = - 1/2 * m2 * l2 * Math.sin(theta1 - theta2) * w2 * w2  - 1/2 * g * (m1 + 2 * m2) * Math.sin(theta1)) + 3/4 * m2 * w1 * w1 * l1 * Math.sin(theta1 - theta2) * Math.cos(theta1 - theta2) - 3/4 * m2 * g *Math.cos(theta1 - theta2) * Math.sin(theta2))
// a1 * l1 * ((4 * m1 + 12 * m2 - 9 * m2 * cos^2(theta1 - theta2)) = - 6 * m2 * l2 * Math.sin(theta1 - theta2) * w2 * w2  - 6 * g * (m1 + 2 * m2) * Math.sin(theta1)) + 9 * m2 * w1 * w1 * l1 * Math.sin(theta1 - theta2) * Math.cos(theta1 - theta2) - 9 * m2 * g *Math.cos(theta1 - theta2) * Math.sin(theta2))
// a1 = (- 6 * m2 * l2 * Math.sin(theta1 - theta2) * w2 * w2  - 6 * g * (m1 + 2 * m2) * Math.sin(theta1)) + 9 * m2 * w1 * w1 * l1 * Math.sin(theta1 - theta2) * Math.cos(theta1 - theta2) - 9 * m2 * g *Math.cos(theta1 - theta2) * Math.sin(theta2))) / (l1  ((4 * m1 + 12 * m2 - 9 * m2 * cos^2(theta1 - theta2)))

// sub a1 back in
//a2  = (1 / (2 * l2)) * (-3 * w1 * w1 * l1 * Math.sin(theta1 - theta2) + 3 * g * Math.sin(theta2)) - 3 * a1 * l1 * Math.cos(theta1 - theta2))
//a2  = (1 / (2 * l2)) * (-3 * w1 * w1 * l1 * Math.sin(theta1 - theta2) + 3 * g * Math.sin(theta2)) - 3 * ((- 6 * m2 * l2 * Math.sin(theta1 - theta2) * w2 * w2  - 6 * g * (m1 + 2 * m2) * Math.sin(theta1)) + 9 * m2 * w1 * w1 * l1 * Math.sin(theta1 - theta2) * Math.cos(theta1 - theta2) - 9 * m2 * g *Math.cos(theta1 - theta2) * Math.sin(theta2))) / (l1  ((4 * m1 + 12 * m2 - 9 * m2 * cos^2(theta1 - theta2)))) * l1 * Math.cos(theta1 - theta2))
//a2  = (1 / (2 * l2)) * (-3 * w1 * w1 * l1 * Math.sin(theta1 - theta2) + 3 * g * Math.sin(theta2)) - 3 * ((- 6 * m2 * l2 * Math.sin(theta1 - theta2) * w2 * w2  - 6 * g * (m1 + 2 * m2) * Math.sin(theta1)) + 9 * m2 * w1 * w1 * l1 * Math.sin(theta1 - theta2) * Math.cos(theta1 - theta2) - 9 * m2 * g *Math.cos(theta1 - theta2) * Math.sin(theta2))) / (l1  ((4 * m1 + 12 * m2 - 9 * m2 * cos^2(theta1 - theta2)))) * l1 * Math.cos(theta1 - theta2))



// That's pretty gross but I think thats as clean as it gets
// HEY we got equations of motion
// .. kind of




/*
doesn't work

        // dx1 = x2
        // dx2 = (- 6 * m2 * l2 * Math.sin(x1 - x3) * x4 * x4 - 6 * g * (m1 + 2 * m2) * Math.sin(x1)) + 9 * m2 * x2 * x2 * l1 * Math.sin(x1 - x3) * Math.cos(x1 - x3) - 9 * m2 * g * Math.cos(x1 - x3) * Math.sin(x3))) / (l1  ((4 * m1 + 12 * m2 - 9 * m2 * Math.cos(x1 - x3) * * Math.cos(x1 - x3)))
        // dx3 = x4
        // dx4 = (1/(2 * l2)) * (-3 * x2 * x2 * l1 * Math.sin(x1 - x3) + 3 * g * Math.sin(x3)) - 3 * ((- 6 * m2 * l2 * Math.sin(x1 - x3) * x4 * x4 - 6 * g * (m1 + 2 * m2) * Math.sin(x1)) + 9 * m2 * x2 * x2 * l1 * Math.sin(x1 - x3) * Math.cos(x1 - x3) - 9 * m2 * g *Math.cos(x1 - x3) * Math.sin(x3))) / (l1  ((4 * m1 + 12 * m2 - 9 * m2 * cos^2(x1 - x3)))) * l1 * Math.cos(x1 - x3))

        let h = this.timestep;

        let x1 = this.state[0]
        let x2 = this.state[1]
        let x3 = this.state[2]
        let x4 = this.state[3]

        let k11 = h * x2;
        let k12 = h * (- 6 * m2 * l2 * Math.sin(x1 - x3) * x4 * x4 - 6 * g * (m1 + 2 * m2) * Math.sin(x1) + 9 * m2 * x2 * x2 * l1 * Math.sin(x1 - x3) * Math.cos(x1 - x3) - 9 * m2 * g * Math.cos(x1 - x3) * Math.sin(x3)) / (l1 * ((4 * m1 + 12 * m2 - 9 * m2 * Math.cos(x1 - x3) * Math.cos(x1 - x3))));
        let k13 = h * x4;
        let k14 = h * ((1/(2 * l2)) * (-3 * x2 * x2 * l1 * Math.sin(x1 - x3) + 3 * g * Math.sin(x3)) - 3 * ((- 6 * m2 * l2 * Math.sin(x1 - x3) * x4 * x4 - 6 * g * (m1 + 2 * m2) * Math.sin(x1) + 9 * m2 * x2 * x2 * l1 * Math.sin(x1 - x3) * Math.cos(x1 - x3) - 9 * m2 * g *Math.cos(x1 - x3) * Math.sin(x3))) / (l1 * ((4 * m1 + 12 * m2 - 9 * m2 * Math.cos(x1 - x3)* Math.cos(x1 - x3)))) * l1 * Math.cos(x1 - x3))

        let k21 = h * (x2 + k11 / 2)
        let k22 = h * (- 6 * m2 * l2 * Math.sin(x1 + k11/2 - x3 - k13/2) * (x4 + k14 / 2) * (x4 + k14 / 2) - 6 * g * (m1 + 2 * m2) * Math.sin(x1 + k11/2) + 9 * m2 * (x2 + k12/2) * (x2 + k12/2) * l1 * Math.sin(x1 + k11/2 - (x3 + k13/2)) * Math.cos(x1 + k11/2 - (x3 + k13/2)) - 9 * m2 * g * Math.cos(x1 + k11/2 - (x3 + k13/2)) * Math.sin(x3 + k13/ 2)) / (l1 * ((4 * m1 + 12 * m2 - 9 * m2 * Math.cos(x1 + k11/2 - (x3 + k13/2)) * Math.cos(x1 + k11/2 - (x3 + k13/2)))));
        let k23 = h * (x4 + k13 / 2)
        let k24 = h * (((1/(2 * l2)) * (-3 * (x2 + k12 /2) * (x2 + k12 /2) * l1 * Math.sin(x1 + k11/2 - (x3 + k13/2)) + 3 * g * Math.sin(x3 + k13/2)) - 3 * ((- 6 * m2 * l2 * Math.sin(x1 + k11/2 - (x3 + k13/2)) * (x4 + k14/2) * (x4+k14/2) - 6 * g * (m1 + 2 * m2) * Math.sin(x1 + k11/2) + 9 * m2 * (x2 + k12/2) * (x2 + k12/2) * l1 * Math.sin(x1 + k11/2 - (x3 + k13/2)) * Math.cos(x1 + k11/2 - (x3 + k13/2)) - 9 * m2 * g *Math.cos(x1 + k11/2 - (x3 + k13/2)) * Math.sin(x3 + k13/2))) / (l1 * ((4 * m1 + 12 * m2 - 9 * m2 * Math.cos(x1 + k11/2 - (x3 + k13/2))* Math.cos(x1 + k11/2 - (x3 + k13/2))))) * l1 * Math.cos(x1 + k11/2 - (x3 + k13/2))))

        let k31 = h * (x2 + k21 / 2)
        let k32 = h * (- 6 * m2 * l2 * Math.sin(x1 + k21/2 - x3 - k23/2) * (x4 + k24 / 2) * (x4 + k24 / 2) - 6 * g * (m1 + 2 * m2) * Math.sin(x1 + k21/2) + 9 * m2 * (x2 + k22/2) * (x2 + k22/2) * l1 * Math.sin(x1 + k21/2 - (x3 + k23/2)) * Math.cos(x1 + k21/2 - (x3 + k23/2)) - 9 * m2 * g * Math.cos(x1 + k21/2 - (x3 + k23/2)) * Math.sin(x3 + k23/ 2)) / (l1 * ((4 * m1 + 12 * m2 - 9 * m2 * Math.cos(x1 + k21/2 - (x3 + k23/2)) * Math.cos(x1 + k21/2 - (x3 + k23/2)))));
        let k33 = h * (x4 + k23 / 2)
        let k34 = h * (((1/(2 * l2)) * (-3 * (x2 + k22 /2) * (x2 + k22 /2) * l1 * Math.sin(x1 + k21/2 - (x3 + k23/2)) + 3 * g * Math.sin(x3 + k23/2)) - 3 * ((- 6 * m2 * l2 * Math.sin(x1 + k21/2 - (x3 + k23/2)) * (x4 + k24/2) * (x4+k24/2) - 6 * g * (m1 + 2 * m2) * Math.sin(x1 + k21/2) + 9 * m2 * (x2 + k22/2) * (x2 + k22/2) * l1 * Math.sin(x1 + k21/2 - (x3 + k23/2)) * Math.cos(x1 + k21/2 - (x3 + k23/2)) - 9 * m2 * g *Math.cos(x1 + k21/2 - (x3 + k23/2)) * Math.sin(x3 + k23/2))) / (l1 * ((4 * m1 + 12 * m2 - 9 * m2 * Math.cos(x1 + k21/2 - (x3 + k23/2))* Math.cos(x1 + k21/2 - (x3 + k23/2))))) * l1 * Math.cos(x1 + k21/2 - (x3 + k23/2))))

        let k41 = h * (x2 + k31 / 2)
        let k42 = h * (- 6 * m2 * l2 * Math.sin(x1 + k31/2 - x3 - k33/2) * (x4 + k34 / 2) * (x4 + k34 / 2) - 6 * g * (m1 + 2 * m2) * Math.sin(x1 + k31/2) + 9 * m2 * (x2 + k32/2) * (x2 + k32/2) * l1 * Math.sin(x1 + k31/2 - (x3 + k33/2)) * Math.cos(x1 + k31/2 - (x3 + k33/2)) - 9 * m2 * g * Math.cos(x1 + k31/2 - (x3 + k33/2)) * Math.sin(x3 + k33/ 2)) / (l1 * ((4 * m1 + 12 * m2 - 9 * m2 * Math.cos(x1 + k31/2 - (x3 + k33/2)) * Math.cos(x1 + k31/2 - (x3 + k33/2)))));
        let k43 = h * (x4 + k33 / 2)
        let k44 = h * (((1/(2 * l2)) * (-3 * (x2 + k32 /2) * (x2 + k32 /2) * l1 * Math.sin(x1 + k31/2 - (x3 + k33/2)) + 3 * g * Math.sin(x3 + k33/2)) - 3 * ((- 6 * m2 * l2 * Math.sin(x1 + k31/2 - (x3 + k33/2)) * (x4 + k34/2) * (x4+k34/2) - 6 * g * (m1 + 2 * m2) * Math.sin(x1 + k31/2) + 9 * m2 * (x2 + k32/2) * (x2 + k32/2) * l1 * Math.sin(x1 + k31/2 - (x3 + k33/2)) * Math.cos(x1 + k31/2 - (x3 + k33/2)) - 9 * m2 * g *Math.cos(x1 + k31/2 - (x3 + k33/2)) * Math.sin(x3 + k33/2))) / (l1 * ((4 * m1 + 12 * m2 - 9 * m2 * Math.cos(x1 + k31/2 - (x3 + k33/2))* Math.cos(x1 + k31/2 - (x3 + k33/2))))) * l1 * Math.cos(x1 + k31/2 - (x3 + k33/2))))


        this.state[0] = x1 + 1.0 / 6 * (k11 + 2 * k21 + 2 * k31 + k41);
        this.state[1] = x2 + 1.0 / 6 * (k12 + 2 * k22 + 2 * k32 + k42);
        this.state[2] = x3 + 1.0 / 6 * (k13 + 2 * k23 + 2 * k33 + k43);
        this.state[3] = x4 + 1.0 / 6 * (k14 + 2 * k24 + 2 * k34 + k44);
*/
class TorqueScenario {
    constructor() {
        this.scene = new Scene();

        // abstract the drawing into a view class
        this.body = new Rectangle('grey', 100, 100, 250, 20);
        this.pivot = new Dot(5, 'white', 225, 110);
        this.forces = [];
        this.model = new TorqueModel(225, 110, 250, 20, 0);
        this.mouseCursor = new Arrow('red', { x: this.body.x, y: this.body.y + this.body.height + 100 }, { x: this.body.x, y: this.body.y + this.body.height });
        this.controls = document.getElementById('control-panel');
        this.INTERVAL = 20;
    }

    start = function () {

        this.momentRange = new Slider('moment', 1, 1000);
        this.frictionRange = new Slider('friction', 1, 100);

        this.momentRange.slider.addEventListener('change', (event) => {
            this.model.moment = event.target.value;
        })

        this.frictionRange.slider.addEventListener('change', (event) => {
            this.model.friction = event.target.value;
        })

        this.controls.innerHTML = '<h2>Control Panel</h2>';
        this.controls.appendChild(this.momentRange.container);
        this.controls.appendChild(this.frictionRange.container);        
        

        this.scene.canvas.addEventListener("mousemove", (event) => {

            var mouse = getCursorPosition(this.scene.canvas, event);
            
            var pts = this.model.getExtentPoints();
            let minp = pts.p1.x > pts.p2.x ? pts.p2 : pts.p1;
            let maxp = pts.p1.x > pts.p2.x ? pts.p1 : pts.p2;
            
            if (mouse['x'] >= minp.x && mouse['x'] < maxp.x) {
                this.mouseCursor.start = { x: mouse['x'], y: this.body.y + this.body.height + 100 };
                this.mouseCursor.end = { x: mouse['x'], y: this.body.y + this.body.height };
            }
        })

        this.scene.canvas.addEventListener("mousedown", (event) => {
            var mouse = getCursorPosition(this.scene.canvas, event);
            
            var pts = this.model.getExtentPoints();
            let minp = pts.p1.x > pts.p2.x ? pts.p1 : pts.p2;
            let maxp = pts.p1.x > pts.p2.x ? pts.p2 : pts.p1;
            console.log(minp, maxp)
            if (mouse['x'] >= this.body.x && mouse['x'] < (this.body.x + this.body.width)) {
                let f1 = new Arrow('black', { x: mouse['x'], y: this.body.y + this.body.height + 100 }, { x: mouse['x'], y: this.body.y + this.body.height });
                this.forces.push(f1);
                this.model.applyForce(f1);
            }
            
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
        
        for (let i = 0; i < this.forces.length; i++) {
            this.forces[i].render(this.scene.context);
            //this.model.applyForce(this.forces[i]);
        }
        this.model.update();

        this.body.angle = this.model.state[0];
        this.body.render(this.scene.context);
        this.pivot.render(this.scene.context);
        
        
        this.mouseCursor.render(this.scene.context);
    };
}

function TorqueModel(x, y, w, h, angle) {

    this.center = { x, y };
    this.width = w;
    this.height = h;
    this.state = [angle, 0, 0];
    this.input = [0];
    this.timestep = 20.0 / 1000;
    // moment of intertia
    this.moment = 10;
    this.friction = 10;

    this.applyForce = function (F) {        
        var forceMagnitude = getDistance(F.start, F.end)
        var forceAngle = lineAngle(F.start, F.end)

        var extent = this.getExtentPoints();
        var intersect = lineToLine(F.start, {x: F.start.x + this.height * Math.cos(forceAngle), y : F.start.x + 1000 * Math.sin(forceAngle)}, extent.p1, extent.p2);        

        if(intersect.collision){
            var d = getDistance(intersect, this.center);
            var torque = forceMagnitude * d * Math.sin(lineAngle(F.end, this.center) - forceAngle);
            this.input[0] += torque / this.moment; 
        }
    }

    this.getExtentPoints = function(){
        // get points on the end of the box regardless of rotation

        let x1 = {x: this.center.x - (this.width / 2) * Math.cos(this.state[0]), y: this.center.y - (this.width / 2) * Math.sin(this.state[0])};
        let x2 = {x: this.center.x + (this.width / 2) * Math.cos(this.state[0]), y: this.center.y + (this.width / 2) * Math.sin(this.state[0])};

        return {p1: x1, p2: x2};

    }

    this.update = function () {

        // state is theta, omega, alpha

        this.A = [
            [1, this.timestep, 0],
            [0, 1, this.timestep],
            [0, - this.timestep * this.friction / this.moment, 0]
        ]

        this.B = [[0], [0], [this.timestep / this.moment]];        

        var acc = 0;
        var oldState = [];

        // deep copy the state
        for (i = 0; i < this.state.length; i++) {
            oldState[i] = this.state[i];
        }

        for (i = 0; i < this.state.length; i++) {
            acc = 0;

            // Multiply by dynamic matrix
            for (j = 0; j < this.state.length; j++) {
                acc += this.A[i][j] * (oldState[j]);
            }

            // Add inputs
            for (k = 0; k < this.input.length; k++) {
                acc += this.B[i][k] * this.input[k];
            }

            this.state[i] = acc;
        }

        this.input[0] = 0;

    }

}
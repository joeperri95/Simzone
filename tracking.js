const MIN_DELTA = 0.5;

function Component(color, x, y) {
    
    this.x = x;
    this.y = y;
    this.color = color;    
    
    this.newPos = function(x, y) {        
        this.x = x;
        this.y = y;
    }

}

function Dot(radius, color, x, y){
    Component.call(this, color, x, y);
    this.radius = radius

    this.render = function(ctx) {
        ctx.save();        
        ctx.translate(this.x, this.y);       
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
        ctx.fill()
        ctx.stroke()
        ctx.restore();    
    }
}


function Tracker(color, x, y) {
    Component.call(this, color, x, y);

    this.dx = 0;
    this.dy = 0;
    this.speed = 5;
    this.angle = 0;    

    this.render = function(ctx) {
        ctx.save();        
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle + Math.PI / 2);
        ctx.beginPath();
        
        ctx.fillStyle = color;
        ctx.strokeStyle = 'black';      

        // create chevron
        ctx.moveTo(0, 20);
        ctx.lineTo(-10,-5);
        ctx.lineTo(0, 0);
        ctx.lineTo(10,-5);
        ctx.lineTo(0,20);
        
        ctx.fill()
        ctx.stroke()
        ctx.restore();    
    }

    this.newPos = function(x, y) {        
        console.log(`${this.x} ${this.y}`)

        this.dx = x - this.x;
        this.dy = y - this.y;
            
        this.angle = Math.atan(this.dy / this.dx)       

        // ensure angle is correct in other quadrants
        if(this.dx > 0){
            this.angle += Math.PI;
        }        

        // only move if there is enough delta
        if(Math.abs(this.dy) > MIN_DELTA && Math.abs(this.dx) > MIN_DELTA)
        {
            this.x += Math.sign(this.dx) * this.speed * Math.abs(Math.cos(this.angle));
            this.y += Math.sign(this.dy) * this.speed * Math.abs(Math.sin(this.angle));
        }
    }
}

function Obstacle(x, y, width, height){
    Component.call(this,'grey', x, y);

    this.width = width;
    this.height = height;
    this.color = 'grey'
    
    this.render = function(ctx){
        ctx.save();           
        ctx.fillStyle = this.color;        
        ctx.fillRect(this.x, this.y, this.width, this.height)
        
        ctx.strokeStyle = 'black'
        ctx.strokeRect(this.x, this.y, this.width, this.height)

        ctx.restore();    
    }

    // check collision between this and line defined by points a and b
    this.collideLine = function(a, b){
        
    }

    this.collideBox = function(box){

    }

}

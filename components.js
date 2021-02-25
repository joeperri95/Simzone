
function Component(color, x, y) {
    
    this.x = x;
    this.y = y;
    this.color = color;    
    
    this.setPos = function(x, y) {        
        this.x = x;
        this.y = y;
    }

    this.setPos = function(point) {        
        this.x = point.x;
        this.y = point.y;
    }

}

function Dot(radius, color, x, y){
    Component.call(this, color, x, y);
    this.radius = radius    
    this.firstTime = true;
    this.color = color    

    this.render = function(ctx) {
        ctx.save();   

        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fill()
        ctx.stroke()
        ctx.restore();    
    }
}


function Cursor(color, x, y) {
    Component.call(this, color, x, y);

    this.dx = 0;
    this.dy = 0;    
    this.speed = 5;
    this.angle = 0;        

    this.render = function(ctx) {
        ctx.save();                
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle - Math.PI / 2);
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

    // Move this class to a model eventually
    this.newPos = function(x, y) {                
        this.dx = x - this.x;
        this.dy = y - this.y;
        
        this.angle = Math.atan2(this.dy, this.dx)       
        this.x += this.speed * Math.cos(this.angle);
        this.y += this.speed * Math.sin(this.angle);

    }
}

function Rectangle(color, x, y, width, height){
    Component.call(this, color, x, y);

    this.width = width;
    this.height = height;
    this.color = color    
    
    this.render = function(ctx){
        ctx.save();           
        ctx.fillStyle = this.color;        
        ctx.fillRect(this.x - this.width, this.y, this.width, this.height)
        
        ctx.strokeStyle = 'black'
        ctx.strokeRect(this.x, this.y, this.width, this.height)

        ctx.restore();    
    }
}

function Point(x, y)
{
    this.x = x;
    this.y = y;
}

function Line(p1, p2)
{
    this.start = p1;
    this.end = p2;   
}
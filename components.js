'use-strict'

/*
    This file defines reusable objects to be rendered
*/

function Component(color, x, y) {
    
    this.x = x;
    this.y = y;
    this.color = color;    
    
    this.setPos = function(point) {        
        this.x = point.x;
        this.y = point.y;
    }

}

function Dot(radius, color, x, y){
    Component.call(this, color, x, y);
    this.radius = radius        
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
    // This is just supposed to be the visualization
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
    this.angle = 0;
    
    this.render = function(ctx){
        ctx.save();

        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.angle);           
        ctx.translate(- (this.x + this.width / 2), - (this.y + this.height / 2))
        
        ctx.fillStyle = this.color;        
        ctx.fillRect(this.x, this.y, this.width, this.height)
        
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

function Line(color, p1, p2)
{
    Component.call(this, color, p1.x, p1.y);
    this.color = color;
    this.start = p1;
    this.end = p2;   

    this.render = function(ctx){
        ctx.save();           
        ctx.strokeStyle = this.color;
        ctx.beginPath()                
        ctx.moveTo(this.start.x, this.start.y);
        ctx.lineTo(this.end.x, this.end.y);
        ctx.stroke();
        ctx.restore();    
    }
}

function Arrow(color, p1, p2)
{
    // A line with an arrow head for digraphs or vectors 

    Component.call(this, color, p1.x, p1.y);
    this.color = color;
    this.start = p1;
    this.end = p2;   
    this.angle = Math.atan2(this.end.y - this.start.y, this.end.x - this.start.x)
    this.arrowLength = getDistance(this.start, this.end);

    this.render = function(ctx){
        ctx.save();           
        this.angle = Math.atan2(this.end.y - this.start.y, this.end.x - this.start.x)
        ctx.strokeStyle = this.color;
        ctx.beginPath()                
        ctx.moveTo(this.start.x, this.start.y);
        ctx.lineTo(this.end.x, this.end.y);
        
        const SIZE = 10; // Length of arrow head lines
        const ANGLE = Math.PI / 6; // Angle from head of arrow

        ctx.lineTo(this.end.x - SIZE * Math.cos(ANGLE + this.angle), this.end.y  - SIZE * Math.sin(ANGLE + this.angle));
        ctx.moveTo(this.end.x, this.end.y);
        ctx.lineTo(this.end.x - SIZE * Math.cos(this.angle - ANGLE), this.end.y  - SIZE * Math.sin(this.angle - ANGLE));

        ctx.stroke();
        ctx.restore();    
    }

}

function InfoText(text, font, point)
{

    this.font = font
    this.text = text
    this.point = point

    this.render = function(ctx)
    {
        ctx.font = this.font;
        ctx.fillStyle = 'black';
        ctx.textAlign = 'left';
        ctx.fillText(this.text, point.x, point.y)
    }
}
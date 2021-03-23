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

    this.move = function(x, y) {
        this.x += x;
        this.y += y;
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

function Rectangle(color, x, y, width, height){
    Component.call(this, color, x, y);

    this.width = width;
    this.height = height;
    this.color = color    

    this.angle = 0;

    // point to rotate about
    this.pivot = {x: this.x + this.width / 2, y: this.y + this.height / 2};

    this.render = function(ctx){
        ctx.save();

        ctx.translate(this.pivot.x, this.pivot.y);
        ctx.rotate(this.angle);           
        ctx.translate(- (this.pivot.x), - (this.pivot.y))
        
        ctx.fillStyle = this.color;        
        ctx.fillRect(this.x, this.y, this.width, this.height)
        
        ctx.strokeStyle = 'black'
        ctx.strokeRect(this.x, this.y, this.width, this.height)

        ctx.restore();    
    }
}

function RectangleView(color, x, y, width, height){
    Component.call(this, color, x, y);

    this.width = width;
    this.height = height;
    this.color = color    

    this.angle = 0;

    // point to rotate about
    this.pivot = {x: this.x + this.width / 2, y: this.y + this.height / 2};

    this.render = function(ctx){
        ctx.save();

        ctx.translate(this.pivot.x, this.pivot.y);
        ctx.rotate(this.angle);           
        ctx.translate(- (this.pivot.x), - (this.pivot.y))
        
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

// The fancy components that are more than just a generic

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

function CentroidIndicator(radius, x, y){
    Component.call(this,'white', x, y);
    this.radius = radius              

    this.render = function(ctx) {
        ctx.save();   
        
        ctx.moveTo(this.x, this.y)   
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black'
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();  
        ctx.moveTo(this.x, this.y)      
        ctx.fillStyle = 'black';
        ctx.arc(this.x, this.y, this.radius, Math.PI / 2, Math.PI);
        ctx.lineTo(this.x, this.y + this.radius)
        ctx.lineTo(this.x - this.radius, this.y)        
        ctx.closePath();       
        ctx.fill()

        ctx.beginPath();    
        ctx.moveTo(this.x, this.y)     
        ctx.fillStyle = 'black';
        ctx.arc(this.x, this.y, this.radius, 3 * Math.PI / 2, 2 * Math.PI);        
        ctx.lineTo(this.x, this.y - this.radius)
        ctx.lineTo(this.x + this.radius, this.y)
        ctx.closePath();       
        ctx.fill()
        
        ctx.restore();    
    }
}

function Cursor(color, x, y) {
    Component.call(this, color, x, y);    
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
}


function pendulum(x, y, angle, length, width) {

    this.x = x;
    this.y = y;
    this.angle = angle
    
    this.length = length; // length of the rod
    this.width = width;   // width of rod    
    this.friction= 0;     // pivot friction
    this.hooke=0;         // pivot spring constant
    
    this.pivotView = new Dot(5, 'white', this.x , this.y + this.width / 2);
    this.centerView = new CentroidIndicator(5, this.x + this.length / 2 * Math.cos(angle), this.y + this.width /2 + this.length / 2 * Math.sin(angle))
    this.rodView = new Rectangle('grey', x, y, this.length, this.width);
    this.rodView.pivot = {x: this.pivotView.x, y: this.pivotView.y};
    this.rodView.angle = angle;
    this.state = [angle, 0];

    this.setPos = function(point) {
        // change origin point
        // this is used for the second pendulum who's position depends on the first

        this.x = point.x;
        this.y = point.y;
        this.pivotView.x = point.x;
        this.pivotView.y = point.y + this.width / 2;
        this.rodView = new Rectangle('grey', point.x, point.y, this.length, this.width);
        this.rodView.pivot = {x: this.pivotView.x, y: this.pivotView.y};
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


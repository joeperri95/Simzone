// Collection of helper functions

function getCursorPosition(canvas, event) 
{
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top    
    return {'x' : x, 'y' : y};
}

function getDistance(a, b)
// get absolute distance between two points
{
    
    var dx = Math.abs(a.x - b.x);
    var dy = Math.abs(a.y - b.y);

    return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy,2));
}

function drawline(ctx, a, b, color)
// draw a line between point a and point b
{
    ctx.save();        
    ctx.beginPath();
        
    ctx.strokeStyle = color;      

    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);    
    ctx.stroke()
    ctx.restore();    
}

function drawCircle(ctx, a, rad)
// draw a circle around point a
{
    ctx.save();        
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.arc(a.x, a.y, rad, 0, 2 * Math.PI);    
    ctx.stroke()
    ctx.restore();   
}

function collideLines(startA, endA, startB, endB)
{   
    var uA  = startA.x - endA.x
}

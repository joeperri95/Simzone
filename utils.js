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

function inRectangle(a, x, y, w, h)
//check if point is in rectangle
{
    if(a.x > x && a.x < (x + w))
    {
        if(a.y > y && a.y < (y + h)){
            return true;
        }
        else
        {
            return false;
        }
    }
    else
    {
        return false;
    }
}

function lineToLine(Astart, Aend, Bstart, Bend)
{
    let uA = ((Bend.x - Bstart.x) * (Astart.y - Bstart.y) - (Bend.y - Bstart.y) * (Astart.x - Bstart.x)) / ((Bend.y - Bstart.y) * (Aend.x - Astart.x)- (Bend.x - Bstart.x)*(Aend.y - Astart.y));
    let uB = ((Aend.x - Astart.x) * (Astart.y - Bstart.y) - (Aend.y - Astart.y) * (Astart.x - Bstart.x)) / ((Bend.y - Bstart.y) * (Aend.x - Astart.x)- (Bend.x - Bstart.x)*(Aend.y - Astart.y));


    if(0 < uA && uA <= 1 && 0 < uB && uB <= 1)
    {
        
        var result = {
            'collision' : true,
            'x1' : (Bstart.x + uB * (Bend.x - Bstart.x)),
            'y1' : (Bstart.y + uB * (Bend.y - Bstart.y)),
            'x2' : (Astart.x + uA * (Aend.x - Astart.x)),
            'y2' : (Astart.y + uA * (Aend.y - Astart.y))
        }    
    
        return result;
    }
    else
    {
        return {'collision': false};
    }    
}

function lineToBox(Astart, Aend, x, y, w, h)
{
    var result;

    result = lineToLine(Astart, Aend, {'x': x, 'y': y}, {'x': x, 'y': y + h});
    result = result || lineToLine(Astart, Aend, {'x': x, 'y': y}, {'x': x + w, 'y': y});
    result = result || lineToLine(Astart, Aend, {'x': x + w, 'y': y}, {'x': x + w, 'y': y + h});
    result = result || lineToLine(Astart, Aend, {'x': x, 'y': y + h}, {'x': x + w, 'y': y + h});

    return result;
}

function lineAngle(a, b)
{

    let dy = b.y - a.y
    let dx = b.x - a.x

    return Math.atan2(dy, dx)
}

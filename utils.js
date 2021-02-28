// Collection of helper functions

function getCursorPosition(canvas, event) 
{
    const rect = canvas.getBoundingClientRect() 
    const x = Math.floor(event.clientX - rect.left);
    const y = Math.floor(event.clientY - rect.top);      
    return {'x' : x, 'y' : y};
}

function getDistance(a, b)
{
    
    var dx = Math.abs(a.x - b.x);
    var dy = Math.abs(a.y - b.y);

    return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy,2));
}

function drawline(ctx, a, b, color)
{
    ctx.save();        
    ctx.beginPath();
        
    ctx.strokeStyle = color;      

    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);    
    ctx.stroke();
    ctx.restore();    
}

function drawCircle(ctx, a, rad)
// draw a circle around point a
{
    ctx.save();        
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.arc(a.x, a.y, rad, 0, 2 * Math.PI);    
    ctx.stroke();
    ctx.restore();   
}

function drawArc(ctx, a, rad, start, end)
// draw a circle around point a
{
    ctx.save();        
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.arc(a.x, a.y, rad, start, end);    
    ctx.stroke();
    ctx.restore();   
}

function inCircle(a, origin, rad)
// check if point a is in circle defined by origin, rad
{   
    let delta = Math.sqrt(Math.pow(Math.abs(origin.x - a.x), 2) + Math.pow(Math.abs(origin.y - a.y), 2))
    return delta < rad
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
            collision : true,
            x : (Bstart.x + uB * (Bend.x - Bstart.x)),
            y : (Bstart.y + uB * (Bend.y - Bstart.y))
        }    
    
        return result;
    }
    else
    {
        return {'collision': false};
    }    
}

// this only checks if there is an intersection, not the points
function lineToCircle(Astart, Aend, Bcenter, Bradius)
{
    var dy = Aend.y - Astart.y;
    var dx = Aend.x - Astart.x;

    var angle = Math.atan2(dy, dx);

    var newStart = {
        x: Bcenter.x - Bradius * Math.cos(angle),
        y: Bcenter.y - Bradius * Math.sin(angle),
    }

    return getDistance(newStart, Astart) < Bradius

}

function linePolygon(Astart, Aend, lines)
{
    
}

function lineToBox(Astart, Aend, x, y, w, h)
{
    var result = {
        l0: null,
        l1: null,
        l2: null,
        l3: null,
        collision: false
    };

    result.l0 = lineToLine(Astart, Aend, {'x': x, 'y': y}, {'x': x, 'y': y + h});
    result.l1 = lineToLine(Astart, Aend, {'x': x, 'y': y}, {'x': x + w, 'y': y});
    result.l2 = lineToLine(Astart, Aend, {'x': x + w, 'y': y}, {'x': x + w, 'y': y + h});
    result.l3 =  lineToLine(Astart, Aend, {'x': x, 'y': y + h}, {'x': x + w, 'y': y + h});
    result.collision = result.l0.collision || result.l1.collision || result.l2.collision || result.l3.collision

    return result;
}

function lineAngle(a, b)
{

    let dy = b.y - a.y
    let dx = b.x - a.x

    return Math.atan2(dy, dx)
}


// function initialize()
// {
    
//     var massSlider = new rangeSlider('mass-slider');
//     var dragSlider = new rangeSlider('drag-slider');
//     var forceSlider = new rangeSlider('force-slider');

// }

// function rangeSlider(id)
// {
//     this.id = id;
//     this.element = document.getElementById(id)
//     this.listener;

//     function addListener(fn) {
//         this.listener = this.element.addEventListener('input', fn);
//     }
// }


function onInputChange()
/*
    Based on selection from drop down handle mouse clicks differently and place a different shape on the cursor
*/
{
    var value = document.getElementById('tool').value
    
    if(value == 'normal')
    {
        mouseCursor = new Dot(5, "green", mouseCursor.x, mouseCursor.y);        
        gamestate = 'normal';
    }
    else if(value == 'beacon')
    {
        mouseCursor = new Dot(5, "blue", mouseCursor.x, mouseCursor.y);        
        gamestate = 'beacon';
    }
    else if(value == 'obstacle')
    {
        mouseCursor = new Obstacle(mouseCursor.x, mouseCursor.y, 50, 30);
        gamestate = 'obstacle'
    }
    else
    {
        mouseCursor = new Dot(5, "green", mouseCursor.x, mouseCursor.y);
    }
}

function raySliderChange()
{
    RAYS = document.getElementById('ray-slider').value
}

function speedSliderChange()
{
    SPEED = Number(document.getElementById('speed-slider').value)    
    console.log(SPEED)
}


// This will take inputs and notify the relevant object of events
class InputController{
    
}

// This will handle keypresses
class KeyboardManager{

}

function raySliderChange()
{
    RAYS = document.getElementById('ray-slider').value
}

function speedSliderChange()
{
    SPEED = Number(document.getElementById('speed-slider').value)        
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

function Slider(label, min, max, start=(max + min)/2)
{
    this.container = document.createElement('div'); 
    this.label = document.createElement('p');
    this.slider = document.createElement('input')

    this.label.appendChild(document.createTextNode(label));
    this.slider.type = 'range'
    this.slider.min = min;
    this.slider.max = max;
    this.slider.value = start;
    this.container.className = 'slider-container'
    this.container.appendChild(this.label)
    this.container.appendChild(this.slider)

}

function SliderInput(label, min, max, start=(max + min)/2)
{
    this.container = document.createElement('div'); 
    this.label = document.createElement('p');
    this.input = document.createElement('input');
    this.slider = document.createElement('input')
    this.listeners = [];

    this.label.appendChild(document.createTextNode(label));
    this.label.classList = 'inline'

    this.slider.type = 'range'
    this.slider.min = min;
    this.slider.max = max;
    this.slider.value = start;
    this.slider.classList = 'slider'

    this.value = start;

    this.slider.addEventListener('input', (event) => {
        this.input.value = event.target.value;
        this.value = event.target.value;
    })

    this.input.addEventListener('input', (event) => {        
        if(Number(event.target.value) < Number(this.slider.min)){
            this.input.value = this.slider.min;
            this.slider.value = this.slider.min;            
            this.value = this.slider.min;
        }
        else if(Number(event.target.value) >= Number(this.slider.max)){
            this.input.value = this.slider.max;
            this.slider.value = this.slider.max;                        
            this.value = this.slider.max;
        }
        else{
            this.slider.value = Number(event.target.value);        
            this.value = Number(event.target.value);   
        }
    })

    this.input.type='number'
    this.input.value = start;
    this.label.classList = 'inline control-input'

    this.container.className = 'slider-container'
    this.container.appendChild(this.label)
    this.container.appendChild(this.input)
    this.container.appendChild(document.createElement('br'))
    this.container.appendChild(this.slider)

    this.addListeners = function(type, fn){
        this.listeners.push(this.slider.addEventListener(type, fn));
        this.listeners.push(this.input.addEventListener(type,fn));
    }
}

function Selection(name, list)
{
    this.container = document.createElement('div');
    this.label = document.createElement('p');
    this.label.appendChild(document.createTextNode(name));
    this.select = document.createElement('select');
    this.select.name = name;
    for(let i = 0; i < list.length; i++){
        let opt = document.createElement("option")
        opt.value = list[i]
        opt.innerHTML = list[i]
        this.select.appendChild(opt);
    }

    this.container.appendChild(this.label);
    this.container.appendChild(this.select)
}

function CheckBox(name, checked)
{
    this.container = document.createElement('div');
    this.label = document.createElement('p');
    this.label.appendChild(document.createTextNode(name));
    this.checkbox = document.createElement('input');
    this.checkbox.type = 'checkbox'
    this.checkbox.checked = checked;
    this.checkbox.name = name;
    this.container.appendChild(this.label);
    this.container.appendChild(this.checkbox)
}

function Button(name)
{
    this.container = document.createElement('div');    
    this.btn = document.createElement('button');
    this.btn.innerHTML = name        
    this.container.appendChild(this.btn)
}

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

function Slider(label, min, max)
{
    this.container = document.createElement('div'); 
    this.label = document.createElement('p');
    this.slider = document.createElement('input')

    this.label.appendChild(document.createTextNode(label));
    this.slider.type = 'range'
    this.slider.min = min;
    this.slider.max = max;
    this.container.className = 'slider-container'
    this.container.appendChild(this.label)
    this.container.appendChild(this.slider)

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
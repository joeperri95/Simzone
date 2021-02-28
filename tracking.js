'use-strict'

function Tracker()
{
    // controller class for a physical model and it's visual representation

    this.view = new Cursor('red', 0, 0);
    this.timestep = 20;
    this.model = new Model(this.timestep, [0, 100, 0, 0], [10, 0]);

    this.update = function() {
        this.model.update();
        this.state = this.model.getOutput();        
        this.view.setPos(this.state.x, this.state.y);        
    }

    this.render = function(ctx){
        this.view.render(ctx)
    }
}

function Model(timestep, initialState, initialInput)
{
    // state is x, y, vx, vy
    this.state = initialState;
    // input is Fx, Fy
    this.input = initialInput;
    this.timestep = timestep;
    
    // Physical parameters of the model
    this.mass = 100;
    this.drag = 1;

    // A matrix describes system
    this.A = [
        [1, 0, this.timestep, 0],
        [0, 1, 0, this.timestep],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ];

    // B matrix translates input to state
    this.B = [
        [0, 0],
        [0, 0],
        [this.timestep / this.mass, 0],
        [0, this.timestep / this.mass]
    ];

    // C matrix translates state to ouput
    // This can be used to scale output to the display
    this.C = [
        0.001, 0.001, 0.001, 0.001
    ];


    this.getOutput = function() {       
        var result = {
            x: this.C[0] * this.state[0],
            y: this.C[0] * this.state[1],
            vx: this.C[0] * this.state[2],
            vy: this.C[0] *this.state[3]
        }

        return result;
    }

    this.update = function() {
        var oldState = [];
        var acc;

        // deep copy the state
        for(i = 0; i < this.state.length; i++){
            oldState[i] = this.state[i];
        }

        for(i = 0; i < this.state.length; i++)
        {
            acc = 0;

            // Multiply by dynamic matrix
            for(j = 0; j < this.state.length; j++)
            {
                acc += this.A[i][j] * oldState[j]                
            }
         
            // Add inputs
            for(k = 0; k < this.input.length; k++)
            {
                acc += this.B[i][k] * this.input[k];
            }
 
            this.state[i] = acc;
        }
    }

}

class GraphScenario {
    constructor() {
        this.scene = new Scene();
        this.nodes = [];
        this.edges = [];
        this.graph = new graph();        
        this.selected;
        this.selectedIndex;
        this.held = false;
        this.moved = false;
        this.directed = false;
        this.INTERVAL = 20;
    }

    start = function () {

        this.scene.canvas.addEventListener('mousemove', (event) => {

            var mouse = getCursorPosition(this.scene.canvas, event);

            if (this.selected != null) {
                if (this.held) {
                    this.selected.setPos(mouse)
                    this.moved = true;
                }
            }

            for (let i = 0; i < this.nodes.length; i++) {
                if (inCircle(mouse, this.nodes[i], this.nodes[i].radius)) {
                    this.nodes[i].color = 'green'
                }
                else {
                    this.nodes[i].color = 'grey'
                }
            }

        })

        // handle mousedown event
        this.scene.canvas.addEventListener('mousedown', (event) => {

            this.held = true;
            var mouse = getCursorPosition(this.scene.canvas, event);

            for (let i = 0; i < this.nodes.length; i++) {
                if (inCircle(mouse, this.nodes[i], this.nodes[i].radius)) {
                    if (this.selected != null) {

                        if (this.selected == this.nodes[i]) {
                            this.selectedIndex = null;
                            this.selected = null;
                        }
                        else {
                            if (this.directed) {
                                this.edges.push(new Arrow('black', this.selected, this.nodes[i]));
                            }
                            else {
                                this.edges.push(new Line('black', this.selected, this.nodes[i]));
                            }
                            this.graph.addEdge(this.selectedIndex, i);
                        }

                        this.selected = null;
                    }
                    else {
                        this.selected = this.nodes[i]
                        this.selectedIndex = i
                    }
                    return;
                }
            }

            // click was not in any other dot
            this.graph.addVertex(mouse['x'], mouse['y']);
            this.nodes.push(new Dot(5, 'grey', mouse['x'], mouse['y']));
            this.selected = null;

        })

        this.scene.canvas.addEventListener('mouseup', (event) => {
            //this.selected = null;
            this.held = false;
        })


        // https://stackoverflow.com/a/2749272/14591588        
        this.interval = setInterval(
            (function (self) {
                return function () {
                    self.update();
                }
            })(this),
            this.INTERVAL
        );
    }

    stop = function () {
        clearInterval(this.interval);
    }

    update = function () {
        this.scene.clear();

        if (this.selected != null) {
            this.selected.color = 'green';
        }

        for (let i = 0; i < this.edges.length; i++) {
            this.edges[i].render(this.scene.context);
        }

        for (let i = 0; i < this.nodes.length; i++) {
            this.nodes[i].render(this.scene.context);
        }

    }
}


function vertex(x, y, number) {
    this.number = number
    this.degree = 0
    this.x = x;
    this.y = y;
}

function graph() {
    // 
    this.vertices = [];
    this.directed = false;
    this.adjacency = [];    

    this.addVertex = function (x, y) {

        // Add the vertex
        let temp = new vertex(x, y, this.vertices.length)
        this.vertices.push(temp);

        // Increase the size of the adjacency matrix
        this.adjacency.push([])
        for (let i = 0; i < this.vertices.length; i++) {
            this.adjacency[this.vertices.length - 1][i] = 0;

            for (let j = this.adjacency[i].length; j < this.vertices.length; j++) {
                this.adjacency[i][j] = 0;
            }
        }

    }

    this.addEdge = function (n1, n2) {
        // here n1 and n2 are the numbers referencing the vertics not the objects themselves        
        this.adjacency[this.vertices[n1].number][this.vertices[n2].number] = getDistance(this.vertices[n1], this.vertices[n2]);
        this.vertices[n1].degree += 1

        if (!this.directed) {
            this.adjacency[this.vertices[n2].number][this.vertices[n1].number] = getDistance(this.vertices[n1], this.vertices[n2]);
            this.vertices[n2].degree += 1
        }
    }

    this.joinGraph = function (other) {
        // add vertices and edges from the other graph
    }

    this.djikstra = function (n1, n2) {
        // find the shortest path between 2 nodes
    }
}
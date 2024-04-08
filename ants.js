const EPS = 0.00001;
const SCREEN_WIDTH = 600;
const SCREEN_HEIGHT = 600;

const screen = document.getElementById("screen");
const ctx = screen.getContext("2d");

nodeCoordinates = [];
graph = [];


function runAlgorithm(graph, maxIter, startNode, alpha=1.0, beta=2.0, rho=0.1, Q=100.0)
{
    class Ant { 
        pathLength = 0;
        constructor(startNode) {
            this.path = [startNode];
            this.used = Array(n).fill(false);
            this.currentNode = startNode;
        }
    }
    
    function initAnts(antsNumber, startNode) {
        let ants = [];
        for (let i = 0; i < antsNumber; i++) 
            ants.push(new Ant(i));
        return ants;
    }
    
    function selectNextNode(ant) {
        let outcomes = [];
        let outcomesSum = 0;
        ant.used[ant.currentNode] = true;
        
        for (let i = 0; i < n; i++) {
            if (i == ant.currentNode || graph[ant.currentNode][i] < EPS || ant.used[i])
                outcomes.push(0.0);
            else {
                let probability = Math.pow(pheromoneMap[ant.currentNode][i], alpha) * Math.pow(1.0 / graph[ant.currentNode][i], beta);
                outcomesSum += probability;
                outcomes.push(probability);
            }
        }
        for (let i = 0; i < n; i++)
        outcomes[i] /= outcomesSum;

        let randomValue = Math.random();
        let prefixOutcomesSum = 0.0;
        for (let i = 0; i < n; i++) {
            prefixOutcomesSum += outcomes[i];
            if (randomValue <= prefixOutcomesSum) {
                ant.pathLength += graph[ant.currentNode][i];
                ant.path.push(i);
                ant.currentNode = i;
                return;
            }
        }   
    }
    
    function leavePheromones(ant) {
        let change = Q / ant.pathLength;
        for (let i = 0; i < ant.path.length - 1; i++) {
            let from = ant.path[i];
            let to = ant.path[i + 1];
            pheromoneMap[from][to] += change;
            pheromoneMap[to][from] += change;
        }
    }
    
    function evaporatePheromones() {
        for (let i = 0; i < n; i++)
            for (let j = 0; j < n; j++)
                pheromoneMap[i][j] *= rho;
    }

    function drawPath(path)
    {
        ctx.beginPath();
        ctx.moveTo(nodeCoordinates[path[0]].x, nodeCoordinates[path[0]].y);
        for (let i = 1; i < path.length; i++)
            ctx.lineTo(nodeCoordinates[path[i]].x, nodeCoordinates[path[i]].y);
        ctx.lineTo(nodeCoordinates[path[0]].x, nodeCoordinates[path[0]].y);
        ctx.strokeStyle = "rgb(55, 55, 55)";
        ctx.lineWidth = "3";
        ctx.stroke();   
        ctx.closePath();
    }


    let n = graph.length;
    let pheromoneMap = Array(n).fill(Array(n).fill(0.2));

    bestPath = [];
    bestPathLength = 10000000;
    
    for (let iter = 0; iter < maxIter; iter++) {
        let ants = initAnts(n, startNode);
        
        for (let i = 0; i < ants.length; i++) 
            for (let j = 0; j < n - 1; j++) //проход всех вершин муравьем
                selectNextNode(ants[i]);
        for (let i = 0; i < ants.length; i++) 
            leavePheromones(ants[i]);
        evaporatePheromones();
        
        for (let i = 0; i < ants.length; i++)
        {
            if (bestPathLength > ants[i].pathLength)
            {
                bestPathLength = ants[i].pathLength;
                bestPath = ants[i].path;
            }
        }
    }
    
    drawPath(bestPath);
}


function main()
{
    function getMousePos(canvas, event)
    {
        let rect = canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }
    
    function clear()
    {
        graph = [];
        nodeCoordinates = [];
        ctx.clearRect(0, 0, screen.width, screen.height);
    }

    function findLength(pointA, pointB)
    {
        return Math.sqrt(Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2));
    }
    
    function createNode(event, x, y)
    {
        let nodePos = getMousePos(screen, event);
        if (nodePos.x < 0 || nodePos.x > SCREEN_WIDTH || nodePos.y < 0 || nodePos.y > SCREEN_HEIGHT)
            return;
    
        nodeCoordinates.push(nodePos);
        let n = graph.length + 1;
        graph.length = n;
        graph[n - 1] = Array(n);
        for (let i = 0; i < n - 1; i++)
        {
            let length = Math.trunc(findLength(nodeCoordinates[i], nodeCoordinates[n - 1]));
            graph[n - 1][i] = length;
            graph[i][n - 1] = length;   
        }
        graph[n - 1][n - 1] = 0;
    
        ctx.beginPath();
        ctx.arc(nodePos.x, nodePos.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = "rgb(55, 55, 55)"
        ctx.fill();
        
        ctx.closePath();
    
    }
    
    
    window.addEventListener('mousedown', createNode);
    document.getElementById("clear-button").addEventListener("click", function () {clear()});
    document.getElementById("play-button").addEventListener("click", function () {runAlgorithm(graph, 100, 0)});
    // window.addEventListener("keydown", event => {if (event.key == "Enter") runAlgorithm(graph, 100, 0)});
    // window.addEventListener("keydown", event => {if (event.key == "Escape") clear();});    
}




main();
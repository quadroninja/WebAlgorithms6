class Node {
    constructor(x, y, parent = null) {
        this.x = x;
        this.y = y;
        this.parent = parent;
        this.g = 0;
        this.h = 0;
        this.f = 0;
    }

    calculateHeuristic(endNode) {
        this.h = Math.abs(this.x - endNode.x) + Math.abs(this.y - endNode.y);
    }

    calculateFinalCost() {
        this.f = this.g + this.h;
    }
  }
  
  function astar(maze, start, end) {
    const openList = [];
    const closedList = [];
    const rows = maze.length;
    const cols = maze[0].length;

    const startNode = new Node(start.y, start.x);
    const endNode = new Node(end.y, end.x);
  
    openList.push(startNode);
  
    while (openList.length > 0) {

        let currentNode = openList[0];
        let currentIndex = 0;
        for (let i = 1; i < openList.length; i++) {
            if (openList[i].f < currentNode.f) {
                currentNode = openList[i];
                currentIndex = i;
            }
        }

        openList.splice(currentIndex, 1);
        closedList.push(currentNode);

        if (currentNode.x === endNode.x && currentNode.y === endNode.y) {
            const path = [];
            let current = currentNode;
            while (current !== null) {
                path.push([current.x, current.y]);
                current = current.parent;
            }
            return path.reverse();
        }

        const neighbors = [];
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                const newX = currentNode.x + i;
                const newY = currentNode.y + j;
                if (newX >= 0 && newX < rows && newY >= 0 && newY < cols && maze[newX][newY] === 0) {
                    neighbors.push(new Node(newX, newY, currentNode));

                    setTimeout(() => { drawCell(rows, newY, newX, "rgba(150, 176, 81, 1)"); }, 200);
                }
            }
        }
 
        for (const neighbor of neighbors) {

            if (closedList.find(node => node.x === neighbor.x && node.y === neighbor.y)) {
                continue;
            }

            const tentativeGScore = currentNode.g + 1;

            const existingNode = openList.find(node => node.x === neighbor.x && node.y === neighbor.y);
            if (!existingNode || tentativeGScore < existingNode.g) {
                neighbor.g = tentativeGScore;
                neighbor.calculateHeuristic(endNode);
                neighbor.calculateFinalCost();
                if (!existingNode) {
                    openList.push(neighbor);
                }
            }
        }
    }
    return null;
}
function generateMaze(n) { 

    const maze = Array.from({ length: n }, () => Array(n).fill(1));

    const isInBounds = (x, y) => x >= 1 && x < n && y >= 1 && y < n;

    const isWall = (x, y) => maze[x][y] === 1;

    

    let currentX = 1;
    let currentY = 1;
    maze[currentX][currentY] = 0; 

    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // Up, Down, Left, Right

    const shuffle = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    };

    const createMaze = (x, y) => {
        shuffle(directions); 
        for (const [dx, dy] of directions) {
            const newX = x + dx * 2;
            const newY = y + dy * 2;

            if (isInBounds(newX, newY) && isWall(newX, newY)) {
                maze[x + dx][y + dy] = 0;
                maze[newX][newY] = 0; 
                createMaze(newX, newY); 
            }
        }
    };

    createMaze(currentX, currentY);

    return maze;
}
var canvas = new fabric.Canvas("canvas", {
    selection: false,
    backgroundColor: "rgb(102, 209, 95)",
  });
  var ctx = canvas.getContext("2d");


  canvas.setWidth(600);
  canvas.setHeight(600);

  canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
  canvas.freeDrawingBrush.color = "rgb(55, 55, 55)";
  canvas.freeDrawingBrush.width = 20;
  ctx.lineWidth = 3;


  let dotCoordinates = [];
  let lines = [];
  let population = [];
  let distances = [];
  let bestPaths = [];
  let n = 0;

  canvas.on("mouse:down", function (event) {
    canvas.isDrawingMode = true;
  });


  canvas.on("mouse:up", function (event) {
    canvas.isDrawingMode = false;
    addDot(event.e);
  });

  function addDot(event) {

    let pointer = canvas.getPointer(event);
    let radius = canvas.freeDrawingBrush.width / 2;

    let dot = new fabric.Circle({
      left: pointer.x - radius,
      top: pointer.y - radius,
      radius: radius,
      fill: canvas.freeDrawingBrush.color,
      selectable: false,
    });

    dotCoordinates.push({
      x: pointer.x,
      y: pointer.y,
    });

    canvas.add(dot);
  }

    function clearDotsAndLines() {
        let objects = canvas.getObjects();
    
        for (let i = objects.length - 1; i >= 0; i--) {
          if (objects[i].get("type") !== "image") {
            canvas.remove(objects[i]);
          }
        }
        
        dotCoordinates = [];
        lines = [];
    }


    function removeLastDot() {
        let objects = canvas.getObjects();
    
        for (let i = objects.length - 1; i >= 0; i--) {
          if (objects[i].get("type") !== "image") {
            canvas.remove(objects[i]);
          }
        } 

        lines = [];

        for (let d = 0; d < dotCoordinates.length - 1; d++) {
            let dot = dotCoordinates[d];
            let radius = canvas.freeDrawingBrush.width / 2;

            let newDot = new fabric.Circle({
            left: dot.x - radius,
            top: dot.y - radius,
            radius: radius,
            fill: canvas.freeDrawingBrush.color,
            selectable: false,
            });

            canvas.add(newDot);
        }
      let ddot = dotCoordinates.pop();
}



  document.getElementById("clear-button").addEventListener("click", function () {clearDotsAndLines()});

  document.getElementById("back-button").addEventListener("click", function () {removeLastDot()});
 
  document.getElementById("play-button").addEventListener("click", function () {GeneticAlgorithm()});



//
//Genetic algorithm
//



  //random number from min to max
  function rand(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  //find distances between all the points
  function findDistances() {
    for (let i = 0; i < n; i++) {
      let len = [];
      for (let j = 0; j < n; j++) {
          let distance = Math.sqrt(
            Math.pow(dotCoordinates[i].x - dotCoordinates[j].x, 2) +
            Math.pow(dotCoordinates[i].y - dotCoordinates[j].y, 2)
          );
          len.push(distance);
      }
      distances.push(len);
    }

  }

  function mutation(chromosome) {
    while (true) {
      let gene1 = rand(1, n-1);
      let gene2 = rand(1, n-1);
      if (gene1 !== gene2) {
        let temp = chromosome[gene1];
        chromosome[gene1] = chromosome[gene2];
        chromosome[gene2] = temp;
        break;
      }
    }
    return chromosome;
  }

  //see if the newGene needs to be changes AKA is already in the chromosome
  function change(chromosome, gene) {
    for (let i = 0; i < chromosome.length; i++) {
      if (chromosome[i] === gene)
        return true;
    }
    return false;
  }

  //calculate the fitness of the chromosome aka the length of the path
  function fitness(c) {
    let f = 0;
    for (let i = 0; i < n; i++) {
      f += distances[c[i]][c[i+1]];
    }
    return f;
  }


  //making a chromosome
  function makeChromosome() {
    let chromosome = [0];
    while (chromosome.length !== n) {
      let newGene = rand(1, n);
      if (!change(chromosome, newGene))
          chromosome.push(newGene);
    }
    chromosome.push(0);
    chromosome.push(fitness(chromosome));
    return chromosome;
  }


  function crossGenes(parent1, parent2) {
    let crossingPoint = rand(1, n);
    let child1 = [];
    let child2 = [];
    for (let i = 0; i < crossingPoint; i++) {
      child1.push(parent1[i]);
      child2.push(parent2[i]);
    }
    for (let i = crossingPoint; i < n; i++) {
      if (!change(child1, parent2[i]))
        child1.push(parent2[i]);
      if (!change(child2, parent1[i]))
        child2.push(parent1[i]);
    }
    for (let j = 0; j < n; j++) {
      if (!change(child1, j))
        child1.push(j);
      if (!change(child2, j))
        child2.push(j);
    }
    if (rand(0, 100) >= 50)
      child1 = mutation(child1);
    if (rand(0, 100) >= 50)
      child2 = mutation(child2);
    child1.push(0);
    child2.push(0);
    child1.push(fitness(child1));
    child2.push(fitness(child2));
    return [child1, child2];
  }
  
  function clearOldPath(last) {
    let objects = canvas.getObjects();
    for (let i = objects.length - 1; i >= 0; i--) {
      if (objects[i].get("type") !== "image") {
        canvas.remove(objects[i]);
      }
    }

    for (let d = 0; d < dotCoordinates.length; d++) {
      let dot = dotCoordinates[d];
      let radius = canvas.freeDrawingBrush.width / 2;

      if (last === 0) {
        let newDot = new fabric.Circle({
          left: dot.x - radius,
          top: dot.y - radius,
          radius: radius,
          fill: canvas.freeDrawingBrush.color,
          selectable: false,
          });
          canvas.add(newDot);
      }
      else {
        let newDot = new fabric.Circle({
          left: dot.x - radius,
          top: dot.y - radius,
          radius: radius,
          fill: "white",
          selectable: false,
          });
          canvas.add(newDot);
      }
    }
  }

  function drawBestPath(c) {
    clearOldPath(0);
    let i = 0;
    function draw() {
      if (i < c.length - 2) {
        let line = new fabric.Line([dotCoordinates[c[i]].x, dotCoordinates[c[i]].y, dotCoordinates[c[i+1]].x, dotCoordinates[c[i+1]].y], {
          stroke: "rgb(55, 55, 55)",
          selectable: false,
        });
        canvas.add(line);
        i++;
        requestAnimationFrame(draw);
      }
    }
    draw();
  }

  
  function drawLastPath(c) {
    clearOldPath(1);
    for (let i = 0; i < c.length - 1; i++) {
        let line = new fabric.Line([dotCoordinates[c[i]].x, dotCoordinates[c[i]].y, dotCoordinates[c[i+1]].x, dotCoordinates[c[i+1]].y], {
          stroke: "white",
          selectable: false,
        });
        canvas.add(line);
    }
  }

  function same(c1, c2) {
    for (let i = 0; i < c1.length; i++) {
      if (c1[i] != c2[i])
        return false;
    }
    return true;
  }

  function newChoromosome(population, chromosome) {
    for (let i = 0; i < population.length; i++) {
      if (same(population[i], chromosome))
        return false;
    }
    return true;
  }

  function GeneticAlgorithm(){
    population = [];
    distances = [];
    n = dotCoordinates.length;
    let populationSize = n*n*3;
    let k = n*n*10;
    findDistances();
    console.log(distances);
    for (let i = 0; i < populationSize; i++) {
      population.push(makeChromosome());
    }
    population = population.sort((a, b) => a[n+1] - b[n+1]);
    let oldBest = population[0];
    bestPaths.push(oldBest);
    for (let i = 0; i < k; i++) {
      newPopulation = [];
      for (let j = 0; j < populationSize; j++) {
        let p1 = rand(1, n);
        let p2 = rand(1, n);
        if (p1 != p2) {
          let children = crossGenes(population[p1], population[p2]);
          newPopulation.push(children[0]);
          newPopulation.push(children[1]);    
      }
      }
      population = population.concat(newPopulation);
      // population.push(makeChromosome());
      // population.push(makeChromosome());
      // population.push(makeChromosome());
      population = population.sort((a, b) => a[n+1] - b[n+1]);
      population = population.slice(0, populationSize);
      if (!same(population[0], oldBest)) {
        oldBest = population[0];
        bestPaths.push(oldBest);
      }
    }
    console.log(bestPaths);
    for (let bp = 0; bp < bestPaths.length; bp++)
      if (bp < bestPaths.length -1 )
        setTimeout(() => { drawBestPath(bestPaths[bp]) }, 1000*bp);
      else
        setTimeout(() => { drawLastPath(bestPaths[bp]) }, 1000*bp);
  }

  

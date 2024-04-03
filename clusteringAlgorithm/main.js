let screen = document.getElementById("screen");
let ctx = screen.getContext("2d");
let SCREEN_HEIGHT = screen.height;
let SCREEN_WIDTH = screen.width;

let pointRadius = 10;
let colors = ["#f44336", "#e81e63", "#9c27b0", "#673ab7", "#3f51b5", "#2196f3", "#03a9f4", "#00bcd4", "#009688", "#4caf50", "#8bc34a", "#cddc39", "#ffeb3b", "#ffc107", "#ff9800", "#ff5722"];

let k = 5;
let points = [];
let globalCentroids = [];
let getDistance = getEuclideanDistance;

class Point
{
    constructor(x, y)
    {
        this.x = x;
        this.y = y;
    }
}
function getEuclideanDistance(pointA, pointB)
{
    return Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2);
}
function randomIntInRange(low, high)
{
    low = Math.ceil(low);
    high = Math.floor(high);
    return Math.floor(Math.random() * (high - low + 1)) + low;
}


function drawStar(cx,cy,spikes,outerRadius,innerRadius){
    var rot=Math.PI/2*3;
    var x=cx;
    var y=cy;
    var step=Math.PI/spikes;

    ctx.beginPath();
    ctx.moveTo(cx,cy-outerRadius)
    for(i=0;i<spikes;i++){
      x=cx+Math.cos(rot)*outerRadius;
      y=cy+Math.sin(rot)*outerRadius;
      ctx.lineTo(x,y)
      rot+=step

      x=cx+Math.cos(rot)*innerRadius;
      y=cy+Math.sin(rot)*innerRadius;
      ctx.lineTo(x,y)
      rot+=step
    }
    ctx.lineTo(cx,cy-outerRadius);
    ctx.closePath();
    ctx.lineWidth=5;
    ctx.fill();
  }


function showClusters()
{
    closestCentroids = calculateClosest(globalCentroids);
    ctx.clearRect(0, 0, screen.getBoundingClientRect().width, screen.getBoundingClientRect().height);
    for (let i = 0; i < points.length; i++)
    {
        ctx.fillStyle = colors[closestCentroids[i]];
        ctx.beginPath();
        ctx.arc(points[i].x, points[i].y, pointRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }
    for (let i = 0; i < globalCentroids.length; i++)
    {
        ctx.fillStyle = colors[i];
        drawStar(globalCentroids[i].x, globalCentroids[i].y, 5, pointRadius * 2, pointRadius);
    }
}

function initCentroids()
{
    centroids = [];
    centroids.push(points[randomIntInRange(0, points.length - 1)]);
    for (let i = 1; i < k; i++)
    {
        let distances = Array(points.length);
        let distancesSum = 0;
        for (let j = 0; j < points.length; j++)
        {
            let centroid = centroids[getClosestCentroid(points[j], centroids)];
            distances[j] = Math.pow(getDistance(centroid, points[j]), 2);
            distancesSum += distances[j];
        }
        
        for (let j = 0; j < points.length; j++)
            distances[j] /= distancesSum;
        let cumulativeSum = 0;
        let rand = Math.random();
        for (let j = 0; j < distances.length; j++)
        {
            if (rand <= cumulativeSum)
            {
                centroids.push(points[j]);
                break;
            }
            cumulativeSum += distances[j];
        }
    }
    return centroids;
}

function getClosestCentroid(point, centroids)
{
    console.log(centroids.length);
    let min = Infinity;
    let index = null;
    for (let i = 0; i < centroids.length; i++)
    {
        let distance = getDistance(point, centroids[i]);
        if (distance < min)
        {
            index = i;
            min = distance;
        }
    }
    return index;
}

function updateCentroids(centroids)
{
    let closestCentroids = Array(points.length);
    let clusters = Array(k);
    
    let hasChanged = true;
    while (hasChanged)
    {
        for (let i = 0; i < points.length; i++)
            closestCentroids[i] = getClosestCentroid(points[i], centroids);
        
        hasChanged = false;
        for (let i = 0; i < k; i++)
        {
            let currentCentroidPoints = [];
            for (let j = 0; j < closestCentroids.length; j++)
            {
                if (closestCentroids[j] == i)
                currentCentroidPoints.push(points[j]);
            }
            
            if (currentCentroidPoints.length == 0)
                continue;
        
            let centroid = centroids[i];
            let sumX = 0, sumY = 0;
            for (let j = 0; j < currentCentroidPoints.length; j++)
            {
                sumX += currentCentroidPoints[j].x;
                sumY += currentCentroidPoints[j].y;
            }
            
            let newCentroid = new Point(Math.round(sumX / currentCentroidPoints.length),
                                        Math.round(sumY / currentCentroidPoints.length));
            
            if (newCentroid.x != centroid.x ||
                newCentroid.y != centroid.y)
                hasChanged = true;
            centroids[i] = newCentroid;
            clusters[i] = currentCentroidPoints;        
        }
    }
    return centroids;
}


function calculateWCSS(centroids)
{
    let total = 0;
    for (let i = 0; i < points.length; i++)
    {
        let centroid = centroids[getClosestCentroid(points[i], centroids)];
        total += Math.pow(getDistance(centroid, points[i]), 2);
    }
    return total;
}

function calculateClosest(centroids)
{
    let closestCentroids = Array(points.length);
    for (let i = 0; i < points.length; i++)
        closestCentroids[i] = getClosestCentroid(points[i], centroids);
    return closestCentroids;
}

function getMousePos(canvas, event)
{
    let rect = canvas.getBoundingClientRect();
    return new Point(event.clientX - rect.left, event.clientY - rect.top);
}

function clear()
{
    points.length = 0;
    ctx.clearRect(0, 0, screen.width, screen.height);
}

function createPoint(event)
{
    let point = getMousePos(screen, event);
    if (point.x < 0 || point.x > SCREEN_WIDTH || point.y < 0 || point.y > SCREEN_HEIGHT)
        return;
    
    points.push(point)

    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(point.x, point.y, pointRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

}


function runAlgorithm()
{
    if (globalCentroids.length == 0)
    {
        globalCentroids = initCentroids();
        showClusters();
        return;
    }
    globalCentroids = updateCentroids(globalCentroids);
    showClusters();

    console.log(globalCentroids.length);
}


window.addEventListener('mousedown', event => {createPoint(event)});
window.addEventListener("keydown", event => {if (event.key == "Enter") runAlgorithm()});
window.addEventListener("keydown", event => {if (event.key == "Escape") clear();});    




let screen = document.getElementById("screen");
let ctx = screen.getContext("2d");
let SCREEN_HEIGHT = screen.height;
let SCREEN_WIDTH = screen.width;

const DIMENSIONS = 2;

const KMEANS = 0;
const HIERARCHICAL = 1;
const DBSCAN = 2;

const pointRadius = 8;
const colors = ["#f44336", "#e81e63", "#9c27b0", "#673ab7", "#3f51b5", "#2196f3", "#03a9f4", "#00bcd4", "#009688", "#4caf50", "#8bc34a", "#cddc39", "#ffeb3b", "#ffc107", "#ff9800", "#ff5722"];
const Metrics = {
    Euclidean(pointA, pointB) { return Math.sqrt(Math.pow(pointA[0] - pointB[0], 2) + Math.pow(pointA[1] - pointB[1], 2));},
    EuclideanSquared(pointA, pointB) { return Math.pow(pointA[0] - pointB[0], 2) + Math.pow(pointA[1] - pointB[1], 2);},
    Manhattan(pointA, pointB) {return Math.abs(pointA[0] - pointB[0]) + Math.abs(pointA[1], pointB[1]);}
}

let epsilon = 150;
let minPts = 3;
let k = 3;
let hasParametersChanged = false;

let points = [];
let clusters = [[], [], []]; //для каждого из трех алгоритмов: двумерные массивы clusters[*номер алгоритма*][*кластер*][*индексы точек, принадлежащих кластеру + вероятность появления в кластере для c-means*]
let centroids = []; //список центроид для k-means


let getDistance = Metrics.Euclidean;

function getRandomInRange(left, right) {
    return Math.floor(Math.random() * (right - left + 1)) + left;
}

function getClosestCentroid(point, localCentroids)
{
    let minDistance = Infinity;
    let index = 0;
    for (let i = 0; i < localCentroids.length; i++)
    {
        let dist = getDistance(point, localCentroids[i]);
        if (dist < minDistance)
        {
            minDistance = dist;
            index = i; 
        }
    }
    return index;
}




class KMeansAlgorithm
{
    currentIteration = 0;
    localCentroids = [];
    closestCentroids = []; //i-тая позиция - к какой по номеру центроиде принадлежит i-тая точка
    hasChanged = false;

    constructor() {}

    apply()
    {    
        let localClusters = [...Array(k)].map(() => []);
        for (let i = 0; i < points.length; i++)
        {
            localClusters[this.closestCentroids[i]].push(i);
        }
        clusters[KMEANS] = structuredClone(localClusters); 
        centroids = structuredClone(this.localCentroids);
        
    }

    assignPoints()
    {
        for (let i = 0; i < points.length; i++)
            this.closestCentroids[i] = getClosestCentroid(points[i], this.localCentroids);
    }

    initCentroids()
    {
        this.localCentroids = [];
        let randomPointIndex = getRandomInRange(0, points.length - 1);
        this.localCentroids.push(points[randomPointIndex]);
        let distances = new Array(points.length);
        for (let i = 1; i < k; i++)
        {
            let totalDistance = 0;
            for (let i = 0; i < points.length; i++)
            {
                distances[i] = getDistance(this.localCentroids[getClosestCentroid(points[i], this.localCentroids)], points[i]);
                totalDistance += distances[i];
            }
            distances = distances.map((value) => value / totalDistance);
            
            let cumulativeSum = 0;
            let randomValue = Math.random();
            for (let i = 0; i < distances.length; i++)
            {
                cumulativeSum += distances[i];
                if (cumulativeSum >= randomValue)
                {
                    this.localCentroids.push(points[i]);
                    break;
                }
            }
        }
        this.assignPoints();
    }

    recalculateCentroids()
    {
        this.assignPoints();
        if (this.localCentroids.length == 0) //перед этой функцией должна выполнится initCentroids() 
            return;
        let clustersPointCount = new Array(k).fill(0);
        let clustersCoordinateSum = [...Array(k)].map(() => new Array(DIMENSIONS).fill(0));

        for (let i = 0; i < this.closestCentroids.length; i++)
        {
            clustersPointCount[this.closestCentroids[i]]++;
            for (let component = 0; component < DIMENSIONS; component++)
                clustersCoordinateSum[this.closestCentroids[i]][component] += points[i][component];
        }
        for (let i = 0; i < k; i++)
            for (let component = 0; component < DIMENSIONS; component++)
                clustersCoordinateSum[i][component] = Math.round(clustersCoordinateSum[i][component] / clustersPointCount[i]);
        
        for (let i = 0; i < k; i++)
        {
            this.localCentroids[i] = clustersCoordinateSum[i];
        }
        
        this.assignPoints();
        //console.log(JSON.stringify(this.localCentroids), "closest: ", JSON.stringify(this.closestCentroids));
    }   

    iterate()
    {   
        if (this.currentIteration == 0)
        {
            this.initCentroids();
            this.apply();
            this.currentIteration++;
            return;
        }
        this.recalculateCentroids();
        this.apply();
        this.currentIteration++;
    }   

    runAlgorithm()
    {
        if (hasParametersChanged)
            this.currentIteration = 0;
        for (let i = 0; i < 30; i++)
        {
            this.iterate();
        } 
    }
}

class HierarchicalAlgorithm
{
    
    DistanceFunctions = {
        SingleLink(cluster1, cluster2){let dist = Infinity; for (let i = 0; i < cluster1.length; i++) 
                                                            for (let j = 0; j < cluster2.length; j++) dist = Math.min(dist, getDistance(cluster1[i], cluster2[j])); return dist;}, 
        CompleteLink(cluster1, cluster2){let dist = -1; for (let i = 0; i < cluster1.length; i++) 
                                                        for (let j = 0; j < cluster2.length; j++) dist = Math.max(dist, getDistance(cluster1[i], cluster2[j])); return dist;},
        UPGMA(cluster1, cluster2){let dist = 0;         for (let i = 0; i < cluster1.length; i++) 
                                                        for (let j = 0; j < cluster2.length; j++) dist += getDistance(cluster1[i], cluster2[j]);  
                                                        dist /= cluster1.length * cluster2.length; return dist;}
    }



    getClusterDistance = this.DistanceFunctions.UPGMA;

    pointCount = 0;
    clusters = [...Array(points.length)].map(() => new Array(1)); //в нем индексы соответствующих точек, не сами точки
    

    constructor() 
    {
    }
    
    apply()
    {
        let localClusters = [...Array(this.clusters.length)].map(() => []);
        for (let i = 0; i < this.clusters.length; i++)
        {
            localClusters[i] = this.clusters[i];
        }
        clusters[HIERARCHICAL] = structuredClone(localClusters); 
    }

    merge()
    {
        let minDist = Infinity, index1 = null, index2 = null;
        for (let clusterIndex1 = 0; clusterIndex1 < this.clusters.length; clusterIndex1++)
        {
            for (let clusterIndex2 = 0; clusterIndex2 < clusterIndex1; clusterIndex2++)
            {
                let currentDistance = this.getClusterDistance(this.clusters[clusterIndex1].map((value) => points[value]), 
                                                              this.clusters[clusterIndex2].map((value) => points[value]));
                if (minDist > currentDistance)
                {
                    minDist = currentDistance;
                    index1 = clusterIndex1;
                    index2 = clusterIndex2;
                }
            }   
        }
        let newCluster = this.clusters[index1].concat(this.clusters[index2]);
        this.clusters.splice(index1, 1);    
        this.clusters.splice(index2, 1);
        this.clusters.push(newCluster);
    }

    iterate()
    {
        while (this.clusters.length > k)
        {
            this.merge();
        }
    }
    
    runAlgorithm()
    {
        if (hasParametersChanged)
        {
            for (let i = 0; i < points.length; i++)
               this.clusters[i] = new Array(1).fill(i);
            this.pointCount = points.length;
        }
        else
        {
            for (let additional = this.pointCount; additional < points.length; additional++)
                this.clusters.push([additional]);
            this.pointCount = points.length;
        }
        
        this.iterate();
        this.apply();
    }

}

class DBSCANAlgorithm
{
    used = new Array(points.length).fill(false);
    currentCluster = 0;   
    pointsClusters = new Array(points.length).fill(null);

    constructor() {
    }

    apply()
    {
        let localClusters = [...Array(this.currentCluster)].map(() => []);
        for (let i = 0; i < points.length; i++)
        {
            if (this.pointsClusters[i] < 0) //-1 - значит вершина является шум
                continue;
            localClusters[this.pointsClusters[i]].push(i);
        }
        clusters[DBSCAN] = structuredClone(localClusters); 
    }

    runAlgorithm()
    {
        this.pointsClusters = new Array(points.length).fill(null);
        this.used = new Array(points.length).fill(false);
        this.currentCluster = 0;
        for (let currentPoint = 0; currentPoint < points.length; currentPoint++)
        {
            if (this.used[currentPoint])
                continue;
            this.used[currentPoint] = true;
            let neighbours = this.regionQuery(currentPoint);
            if (neighbours.length >= minPts)
            {
                this.expandCluster(currentPoint, neighbours, this.currentCluster);
                this.currentCluster++;
            }
            else
            {
                this.pointsClusters[currentPoint] = -1;
            }
        }
        this.apply();
    }

    expandCluster(point, neighbours, cluster)
    {
        this.pointsClusters[point] = cluster;
        for (let q = 0; q < neighbours.length; q++)
        {
            if (!this.used[neighbours[q]])
            {
                this.used[neighbours[q]] = true;
                let currentNeighbours = this.regionQuery(neighbours[q]);
                if (currentNeighbours.length >= minPts)
                   neighbours = neighbours.concat(currentNeighbours);
            }
            if (this.pointsClusters[neighbours[q]] == null)
                this.pointsClusters[neighbours[q]] = cluster;
        }
    }

    regionQuery(point)
    {
        let closePoints = [];
        for (let i = 0; i < points.length; i++)
        {
            if (getDistance(points[i], points[point]) < epsilon)
            {
                closePoints.push(i);
            }
        }
        return closePoints;
    }
}


function visualize()
{
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
        ctx.stroke();
        ctx.fill();
      }
    //const KMEANS_COLOR = "#ff0000";
    const HIERARCHICAL_COLOR = "#555555";
    const DBSCAN_COLOR = "#333333";


    ctx.clearRect(0, 0, screen.getBoundingClientRect().width, screen.getBoundingClientRect().height);
    ctx.lineWidth = 2;
    
    function drawWebs(algorithmIdentifier, color)
    {
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        for (let cluster = 0; cluster < clusters[algorithmIdentifier].length; cluster++)
        {
            for(let i = 0; i < clusters[algorithmIdentifier][cluster].length; i++)
            {
                for(let j = 0; j < i; j++)
                {
                    ctx.beginPath();
                    ctx.moveTo(...points[clusters[algorithmIdentifier][cluster][i]]);
                    ctx.lineTo(...points[clusters[algorithmIdentifier][cluster][j]]);
                    ctx.stroke();
                    ctx.closePath();
                }
            }    
        }
    }

    function drawRects(algorithmIdentifier, color)
    {
        console.log(JSON.stringify(clusters[algorithmIdentifier]));
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        for (let cluster = 0; cluster < clusters[algorithmIdentifier].length; cluster++)
        {
            let left = Infinity, top = Infinity, right = 0, bottom = 0;
            if (clusters[algorithmIdentifier][cluster].length == 1)
            {
                let x = points[clusters[algorithmIdentifier][cluster][0]][0];
                let y = points[clusters[algorithmIdentifier][cluster][0]][1];
                    
                left = x - pointRadius;
                right = x + pointRadius;
                top = y - pointRadius;
                bottom = y + pointRadius;
            }
            else 
            {
                for(let i = 0; i < clusters[algorithmIdentifier][cluster].length; i++)
                {
                    let x = points[clusters[algorithmIdentifier][cluster][i]][0];
                    let y = points[clusters[algorithmIdentifier][cluster][i]][1];
                    console.log(x, y);
                    if (left > x) left = x;
                    if (right < x) right = x;
                    if (top > y) top = y;
                    if (bottom < y) bottom = y;
                }    
            }
            console.log(left, top, right, bottom);
            ctx.fillRect(left, top, right - left, bottom - top);
        }
        ctx.globalAlpha = 1.0;
    }

    function drawColored(algorithmIdentifier)
    {
        for (let cluster = 0; cluster < clusters[algorithmIdentifier].length; cluster++)
        {
            ctx.fillStyle = colors[cluster];
            for(let i = 0; i < clusters[algorithmIdentifier][cluster].length; i++)
            {
                ctx.beginPath();
                ctx.arc(points[clusters[algorithmIdentifier][cluster][i]][0],
                        points[clusters[algorithmIdentifier][cluster][i]][1], pointRadius, 0, Math.PI * 2);
                ctx.fill();
                ctx.closePath();
            }    
        }
        for (let centroid = 0; centroid < centroids.length; centroid++)
        {
            ctx.fillStyle = colors[centroid];
            ctx.strokeStyle = "#000000";
            drawStar(centroids[centroid][0], centroids[centroid][1], 5, pointRadius * 1.2, pointRadius * 0.6);
        
        }
    }

    drawRects(DBSCAN, DBSCAN_COLOR);
    drawWebs(HIERARCHICAL, HIERARCHICAL_COLOR);
    drawColored(KMEANS);
        
}



function getMousePos(canvas, event)
{
    let rect = canvas.getBoundingClientRect();
    return [event.clientX - rect.left, event.clientY - rect.top];
}

function clear()
{
    points.length = 0;
    ctx.clearRect(0, 0, screen.width, screen.height);
}

function createPoint(event)
{
    let point = getMousePos(screen, event);
    if (point[0] < 0 || point[0] > SCREEN_WIDTH || point[1] < 0 || point[1] > SCREEN_HEIGHT)
        return;
    
    points.push(point)
    
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(point[0], point[1], pointRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
}


//let algo1 = new KMeans();
let kmeans = new KMeansAlgorithm();
let hier = new HierarchicalAlgorithm();
let dbscan = new DBSCANAlgorithm();

window.addEventListener("mousedown", event => {createPoint(event)});
window.addEventListener("keydown", function (event) {if(event.code == "Enter") clear()});
window.addEventListener("keydown", function (event) {if(event.code == "Space") {kmeans.runAlgorithm(); hier.runAlgorithm(); dbscan.runAlgorithm(); visualize(); hasParametersChanged = false;}});
document.getElementById("clusterNumberRange").oninput = () => {k = parseInt(document.getElementById("clusterNumberRange").value); document.getElementById("clustersLabel").textContent = " = " + k; hasParametersChanged = true;}
document.getElementById("epsilonRange").oninput = () => {epsilon = parseInt(document.getElementById("epsilonRange").value); document.getElementById("epsilonLabel").textContent = " = " + epsilon;  hasParametersChanged = true;}
document.getElementById("minPtsNumberRange").oninput = () => {minPts = parseInt(document.getElementById("minPtsNumberRange").value); document.getElementById("minPtsLabel").textContent = " = " + minPts;  hasParametersChanged = true;}

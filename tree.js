const fontSize = 16
class Node {
    constructor(leftNode, rightNode, data, attribute, condition) {
        this.leftNode = leftNode;
        this.rightNode = rightNode;
        this.data = data;
        this.attribute = attribute; 
        this.condition = condition;
    }
    getDepth(depth = 0) {
      const leftDepth = this.leftNode ? this.leftNode.getDepth(depth + 1) : depth + 1;
      const rightDepth = this.rightNode ? this.rightNode.getDepth(depth + 1) : depth + 1;
      return Math.max(leftDepth, rightDepth);
    }
    draw(ctx, x, y, width, height, depth, maxDepth) {
        // calculate the position and size of the node's rectangle
        console.log(this.attribute, this.condition)
        const rectWidth = this.attribute !== null ? (this.attribute.length + toString(this.condition).length) * (fontSize/2) : (this.data.length) * fontSize + 10;
        console.log("WIDTH", this.attribute, rectWidth)
        const rectHeight = 40;
        const rectX = x + width / 2 - rectWidth/2;
        const rectY = y + height/(maxDepth * 2);
        console.log("RECT", rectX, rectY)


        // draw the node's rectangle
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
        ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);

        // draw the node's attribute and condition
        if (this.attribute !== null) {
            ctx.fillStyle = 'black';
            ctx.font = `${fontSize}px sans-serif`;
            ctx.textAlign = 'center';
            if (this.condition === "Yes") {
                ctx.fillText(`${this.attribute}: ${this.condition}`, rectX + rectWidth / 2, rectY + (rectHeight/2));
            }
            else {
                ctx.fillText(`${this.attribute} < ${this.condition}`, rectX + rectWidth / 2, rectY + (rectHeight/2));
            }
            
        }

        // recursively draw the node's left and right children
        if (this.leftNode !== null) {
            const leftWidth = width / 2;
            const leftHeight = height - height / (maxDepth);
            const leftX = x;
            const leftY = y + height / (maxDepth);

            console.log("LEFT Y", leftY)

            ctx.beginPath();
            ctx.moveTo(rectX + rectWidth / 2, rectY + rectHeight);
            ctx.lineTo(leftX + leftWidth / 2, leftY + height/((maxDepth) * 2));
            ctx.stroke();

            this.leftNode.draw(ctx, leftX, leftY, leftWidth, leftHeight, depth + 1, maxDepth - 1);

            // draw a line connecting the node to its left child
        }
        if (this.rightNode !== null) {
            const rightWidth = width / 2;
            const rightHeight = height - height / (maxDepth);
            const rightX = x + width / 2;
            const rightY = y + height / (maxDepth);

            ctx.beginPath();
            ctx.moveTo(rectX + rectWidth / 2, rectY + rectHeight);
            ctx.lineTo(rightX + rightWidth / 2, rightY + height/((maxDepth) * 2));
            ctx.stroke();

            this.rightNode.draw(ctx, rightX, rightY, rightWidth, rightHeight, depth + 1, maxDepth - 1);

        }

        // display the node's data if it has any
        if (this.data !== undefined) {
            ctx.fillStyle = 'black';
            ctx.font = `${fontSize}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText(` ${this.data}`, rectX + rectWidth / 2, rectY + (rectHeight/2));
        }
    }
}

var treeFlag = false;
var mainAttributes = [];

function getNodeDepth(node) {
    /*
    if (node === undefined) {
        return 0;
    }
    */
    console.log("IN getNodeDepth", node)
    if (node.rightNode === null && node.leftNode === null) {
        //console.log("LEAF")
        return 1;
    }
    else{
        let leftDepth = getNodeDepth(node.leftNode);
        let rightDepth = getNodeDepth(node.rightNode);
        return Math.max(leftDepth, rightDepth) + 1;
    }
}

class MiddleNode {
    constructor(colNum, attribute, totalGini, leftGini, rightGini, condition, value) {
        this.colNum = colNum;
        this.attribute = attribute; 
        this.totalGini = totalGini;
        this.leftGini = leftGini; this.rightGini = rightGini;
        this.condition = condition;
        this.value = value;
    }
}

function handleFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    const reader = new FileReader();
    
    reader.onload = function(event) {
        const csvData = event.target.result;
        processedData = processTheData(csvData);
        console.log("DATA ON INPUT", processedData)
        treeBuilding(processedData);
    }
    
    reader.readAsText(file);

}
  
function processTheData(processData) {

    const rows = processData.split(/\r?\n/);

    const outputData = [];
    rows.forEach(row => {
        // Разбиваем строку на отдельные значения по разделителю ";"
        let values = row.split(';');
        for (let i = 0; i < values.length; i++) {
            if (/[0-9]/.test(values[i])) {
                values[i] = Number(values[i]);
            }
        }
        // Добавляем значения в матрицу
        outputData.push(values);
    });
    return outputData;
}

function newDataProcess(event) {
    if (event.key === 'Enter' && treeFlag) {
        console.log("ATTRIBUTES!!!!!", mainAttributes);
        let data = document.getElementById("dataInput").value;
        let newData = data.split(';');
            for (let i = 0; i < newData.length; i++) {
                if (/[0-9]/.test(newData[i])) {
                    newData[i] = Number(newData[i]);
                    //console.log("NUM DATA", newData[i])
                }
            }
        console.log("Data entered: " + newData);
        console.log("data by attributes:");
        for (let i = 0; i < newData.length; i++) {
            console.log(mainAttributes[i], "equals", newData[i])
        }
        const canvas = document.getElementById('treeCanvas');
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        ctx.clearRect(0,0,width,height);
        tree.draw(ctx, 0, 0, width, height, 0, getNodeDepth(tree))
        makeDecision(newData, tree, ctx, 0, 0, width, height, 0, getNodeDepth(tree))
    }
}

function makeDecision(dataForDecision, decNode, ctx, x, y, width, height, depth, maxDepth) {
    let choose = dataForDecision[mainAttributes.indexOf(decNode.attribute)];
    if (decNode.attribute !== null) {

        const rectWidth = decNode.attribute !== null ? (decNode.attribute.length + toString(decNode.condition).length) * (fontSize/2) : (decNode.data.length) * fontSize + 10;
        const rectHeight = 40;
        const rectX = x + width / 2 - rectWidth/2;
        const rectY = y + height/(maxDepth * 2);

        ctx.strokeStyle = 'green';
        ctx.lineWidth = 5;
        ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);

        console.log("ATTRIBUTE FOR DEC", decNode.attribute)
        if (decNode.condition === "Yes") {
            console.log("DEC YES", choose)
            if (choose === decNode.condition) {
                const leftWidth = width / 2;
                const leftHeight = height - height / (maxDepth);
                const leftX = x;
                const leftY = y + height / (maxDepth);
                setTimeout(() => makeDecision(dataForDecision, decNode.leftNode, ctx, leftX, leftY, leftWidth, leftHeight, depth + 1, maxDepth - 1), 500)
            }
            else {
                const rightWidth = width / 2;
                const rightHeight = height - height / (maxDepth);
                const rightX = x + width / 2;
                const rightY = y + height / (maxDepth);

                setTimeout(() => makeDecision(dataForDecision, decNode.rightNode, ctx, rightX, rightY, rightWidth, rightHeight, depth + 1, maxDepth - 1), 500)
            }
        }
        else {
            console.log("DEC NUM", choose, "<", decNode.condition)
            if (choose < decNode.condition) {
                const leftWidth = width / 2;
                const leftHeight = height - height / (maxDepth);
                const leftX = x;
                const leftY = y + height / (maxDepth);
                makeDecision(dataForDecision, decNode.leftNode, ctx, leftX, leftY, leftWidth, leftHeight, depth + 1, maxDepth - 1)
            }
            else {
                const rightWidth = width / 2;
                const rightHeight = height - height / (maxDepth);
                const rightX = x + width / 2;
                const rightY = y + height / (maxDepth);

                makeDecision(dataForDecision, decNode.rightNode, ctx, rightX, rightY, rightWidth, rightHeight, depth + 1, maxDepth - 1)
            }
        }
    }
    else {
        console.log("DECISION!!!!!!!!", decNode.data)
        let rectWidth = decNode.attribute !== null ? (decNode.attribute.length + toString(decNode.condition).length) * (fontSize/2) : (decNode.data.length) * fontSize + 10;
        let rectHeight = 40;
        let rectX = x + width / 2 - rectWidth/2;
        let rectY = y + height/(maxDepth * 2);

        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 7;
        ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);
        const showResult = document.getElementById("resultShow");
        showResult.textContent = decNode.data;
    }
}

function treeBuilding(dataForBuiding) {
    mainAttributes = []
    for (ind = 0; ind < dataForBuiding[0].length - 1; ind++) {
        mainAttributes.push(dataForBuiding[0][ind])
    }

    const showAttribute = document.getElementById("attributes");
    showAttribute.textContent = mainAttributes;

    treeFlag = true;
    tree = treeGrow(dataForBuiding);
    const canvas = document.getElementById('treeCanvas');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0,0,width,height);
    tree.draw(ctx, 0, 0, width, height, 0, getNodeDepth(tree))
    //drawNode(ctx, tree, height, width, height, depth);
    console.log(tree)
    //drawTree(tree)
}

function treeGrow(data) {

    if (data.length <= 2) {
        console.log("Wrong data: ", data);
        return "треш";
    }

    console.log("Data: ", data);

    let total = []
    for (i = 0; i < data[0].length-1; i++) {

        total[i] = calculateGiniImpurity(data, i);
        console.log(total[i].attribute + " " + total[i].totalGini)
    }

    let tree = new Node;

    total.sort((node1, node2) => {
        return node1.totalGini - node2.totalGini;
    });
    tree.condition = total[0].condition;
    tree.attribute = total[0].attribute;
    console.log(total)

    flagLeft = false;
    if (total[0].leftGini === 0) {
        tree.leftNode = new Node(null, null, total[0].value[0], null, null);
        flagLeft = true; 
    }

    else if (total[0].leftGini !== 0) {
        let cond = [total[0].colNum, total[0].condition];
        tree.leftNode = treeGrow(splitData(data, cond));
    }
    else {
        console.log("треш");
    }

    if (total[0].rightGini === 0) {
        tree.rightNode = new Node(null, null, total[0].value[1], null, null);
    }

    else if (total[0].rightGini !== 0) {
        let cond = [total[0].colNum, total[0].condition];
        tree.rightNode = treeGrow(splitData(data, cond));
    }

    return tree;
}


function calculateGiniImpurity(inputData, n) {
    console.log('тут начинает считаться джини')
    const resultNode = new MiddleNode;
    resultNode.colNum = n;
    resultNode.attribute = inputData[0][n];
    console.log("THIS ATTRIBUTE", resultNode.attribute)
    console.log(inputData, n)

    const giniData = [];
    const resultData = [];
    const len = inputData.length;
    
    for (let j = 0; j < len; j++) {
        giniData.push(inputData[j][n]);
        resultData.push(inputData[j][inputData[0].length-1]);
    }
    resultNode.attribute = giniData[0];

    if (Number.isInteger(inputData[1][n])) {
        inputData.sort((n1, n2) => {
            return n1[n] - n2[n];
        });

        for (let j = 0; j < len; j++) {
            giniData.push(inputData[j][n]);
            resultData.push(inputData[j][inputData[0].length-1]);
        }
        resultNode.attribute = giniData[0];

        

        let giniInteger = 1;

        for (let i = 1; i < giniData.length - 1; i++) {

            const middleValue = (giniData[i] + giniData[i-1]) / 2;
            
            let giniYes = 0, giniNo = 0, giniTotal = 0;
            let yesCount = 0, noCount = 0, totalYesCount = 0, totalNoCount = 0;

            for (let i = 1; i < len; i++) {
                if (giniData[i] < middleValue) {

                    if (resultData[i] === 'Yes') yesCount++;
                    else if (resultData[i] === 'No') noCount++;
                }
            }
            totalYesCount = yesCount + noCount;

            let valueLeftNode = yesCount > noCount ? 'Yes' : 'No';
            giniYes = 1 - Math.pow((yesCount / (yesCount + noCount)), 2) - Math.pow((noCount / (yesCount + noCount)), 2);
            
            yesCount = 0; noCount = 0;

            for (let i = 1; i < len; i++) {
                if (giniData[i] >= middleValue) {

                    if (resultData[i] === 'Yes') yesCount++;
                    else if (resultData[i] === 'No') noCount++;
                }
            }
            totalNoCount = yesCount + noCount;
            let valueRightNode = yesCount > noCount ? 'Yes' : 'No';
            giniNo = 1 - Math.pow((yesCount / (yesCount + noCount)), 2) - Math.pow((noCount / (yesCount + noCount)), 2);

            giniTotal = (totalYesCount / (totalYesCount + totalNoCount)) * giniYes + (totalNoCount / (totalYesCount + totalNoCount)) * giniNo;
            

            if (giniTotal < giniInteger) {
                console.log(yesCount + " " + noCount + " " + giniTotal)
                resultNode.leftGini = giniYes;
                resultNode.rightGini = giniNo;
                resultNode.totalGini = giniTotal;

                resultNode.value = [valueLeftNode, valueRightNode]
                resultNode.condition = middleValue;
                giniInteger = giniTotal
            }
        }
        return resultNode;
    }


    let giniYes = 0, giniNo = 0, giniTotal = 0;
    let yesCount = 0, noCount = 0, totalYesCount = 0, totalNoCount = 0;

    for (let i = 1; i < len; i++) {
        if (giniData[i] === 'Yes') {

            if (resultData[i] === 'Yes') yesCount++;
            else if (resultData[i] === 'No') noCount++;
        }
    }
    totalYesCount = yesCount + noCount;
    let valueLeftNode = yesCount > noCount ? 'Yes' : 'No';
    //запоминаем valueYes на основе того, кто yesCount или noCount больше
    giniYes = 1 - Math.pow((yesCount / (yesCount + noCount)), 2) - Math.pow((noCount / (yesCount + noCount)), 2);
    console.log("WTF WITH GINI YES")
    console.log("YC", yesCount)
    console.log("NC", noCount)
    console.log(Math.pow((yesCount / (yesCount + noCount)), 2))
    console.log(Math.pow((noCount / (yesCount + noCount)), 2))
    console.log("RESULT", giniYes)
    console.log("WTF FINISH")


    yesCount = 0; noCount = 0;

    for (let i = 1; i < len; i++) {
        if (giniData[i] === 'No') {

            if (resultData[i] === 'Yes') yesCount++;
            else if (resultData[i] === 'No') noCount++;
        }
    }
    totalNoCount = yesCount + noCount;
    //запоминаем valueNo на основе того, кто yesCount или noCount больше
    let valueRightNode = yesCount > noCount ? 'Yes' : 'No';
    giniNo = 1 - Math.pow((yesCount / (yesCount + noCount)), 2) - Math.pow((noCount / (yesCount + noCount)), 2);

    giniTotal = (totalYesCount / (totalYesCount + totalNoCount)) * giniYes + (totalNoCount / (totalYesCount + totalNoCount)) * giniNo;

    console.log("RESULT IN GINI ", "YES", yesCount, giniYes, "NO", noCount, giniNo, "TOTAL", giniTotal)

    resultNode.leftGini = giniYes;
    resultNode.rightGini = giniNo;
    resultNode.condition = 'Yes';
    resultNode.totalGini = giniTotal;
    resultNode.value = [valueLeftNode, valueRightNode]

    console.log("VALUES IN NODE", resultNode.attribute, resultNode.value)

    return resultNode;
}

function splitData(dataForSplitting, condition) {
    // condition подается в формате [colNum, cond], cond может быть yes/no или n
    let resultData = [];
    dataForSplitting[0].splice(condition[0], 1)
    resultData.push(dataForSplitting[0]);
        // для числовых значений:
    if (Number.isInteger(condition[1])) {

        for (let i = 0; i < dataForSplitting.length; i++) {
            if (dataForSplitting[i][condition[0]] > condition[1]) {
                dataForSplitting[i].splice(condition[0], 1);
                resultData.push(dataForSplitting[i]);
            }
        }
        return resultData;
    }
    for (let i = 0; i < dataForSplitting.length; i++) {
    // для ес ноу:
        if (dataForSplitting[i][condition[0]] === condition[1]) {
            //console.log("дата фор сплиттинг", dataForSplitting[i])
            dataForSplitting[i].splice(condition[0], 1);
            //console.log("AFTER", dataForSplitting[i])
            resultData.push(dataForSplitting[i]);
        }
    }
    //console.log("SPLIT RESULT", resultData)
    return resultData;
}
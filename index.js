/**
 * IMPORTANT NOTICE:
 * 
 * The data is provided by the data.js file which you need to add in the index.html file. 
 * Make sure the data.js file is loaded before the index.js file, so that you can acces it here!
 * The data is provided in an array called: data
 * const data = [
        {
            "tas": 1.96318,
            "pr": 37.2661,
            "Year": 1991,
            "Month": 1,
            "Country": "DEU"
        }
        ....
 */

// Hint: use the document.createElementNS function when creating svg-related elements and pass this namespace variable as the first paramter (see line 41 for an example)
const svgNamespace = "http://www.w3.org/2000/svg";

/* TASK 1: Retrieve the node of the div element declared within the index.html by its identifier and save it to a variable that we will use later */
var graph = document.getElementById("graph");

// Specify margins such that the visualization is clearly visible and no elements are invisible due to the svg border
const margins = {
  top: 20,
  right: 20,
  bottom: 20,
  left: 20,
};

// Specify the width and height of the svg as well as the width height of the viewport of the visualization.
const width = 800;
const height = 800;
const visWidth = width - margins.left - margins.right;
const visHeight = height - margins.top - margins.bottom;

/* TASK 2: Create an svg element, set its width and height in pixels (via the 'element.style' attribute), and add it to the vis-container. Save the svg element in a variable called 'svg' */
var svg = document.createElementNS(svgNamespace, "svg");
svg.setAttribute("width", width);
svg.setAttribute("height", height);
graph.appendChild(svg);

// We add a group element to the svg to set the margin by translating the group.
// All visual elements which are part of the line-chart need to be added to the group.
const visG = document.createElementNS(svgNamespace, "g");
visG.setAttribute("transform", "translate(" + margins.left + "," + margins.top + ")");
svg.appendChild(visG);

// Initialization of an array which will hold the respective coordinates on the screen
/* TASK 3: Write the code for the helper functions getMinFromArrayOfObjects and getMaxFromArrayOfObjects! */
const transformedPoints = [];
const maxYear = getMaxFromArrayOfObjects("Year", data);
const minYear = getMinFromArrayOfObjects("Year", data);
const pixelsPerYear = visWidth / (maxYear - minYear + 1);

/** TASK 4: Create a <h2> element and add it to the header div containing the <h1> element.
 * You need to add a suitable id to this <div> in the index.html
 * The text of the <h2> element should be `From the years <minyear> to <maxyear>`
 * <minyear> and <maxyear> should be replaced with the real values from line 49 and 50.
 */
var yearRange = document.createElement("h2");
let yearText = document.createTextNode(`From the years ${minYear} to ${maxYear}`);
yearRange.appendChild(yearText);
document.getElementById("header").appendChild(yearRange);

// Data Preparation: For each year we want the average rain and temperature
// We intialize an empty array 'avgData' which will hold the average values and the respective years
const avgDataPerYear = [];
const rainAttr = "pr";
const tempAttr = "tas";
for (let i = 0; i < maxYear - minYear + 1; i++) {
  /**
   * TASK 5: Calculate the average temperature and precipitation for every year.
   * Add the values to the avgDataPerYear array.
   * Use the following format for the data:
   * avgDataPerYear.push({
   *    year: 1995,
   *    temperature: 0,
   *    rain: 0,
   * });
   */
  var dataPerYear = data.filter((datapoint) => datapoint.Year === (minYear + i));
  const avgRain = (dataPerYear.reduce((previousDatapoint, currentDatapoint) => previousDatapoint + currentDatapoint[rainAttr], 0) / dataPerYear.length);
  const avgTemp = (dataPerYear.reduce((previousDatapoint, currentDatapoint) => previousDatapoint + currentDatapoint[tempAttr], 0) / dataPerYear.length);

  avgDataPerYear.push({
    year : minYear + i,
    temperature : avgTemp,
    rain : avgRain
  });
}

// Check the browser console to see how the data looks like
console.log("Dataset:", avgDataPerYear);

// Calculate necessary statistics to transform datapoints to screen coordinates
const maxTemp = getMaxFromArrayOfObjects("temperature", avgDataPerYear);
const minTemp = getMinFromArrayOfObjects("temperature", avgDataPerYear);
const minRain = 0;
const maxRain = getMaxFromArrayOfObjects("rain", avgDataPerYear);

/*
TASK 6: Transform the data points to their respective screen coordinates.
1. Use a loop to iterate through the 'avgDataPerYear' array
2. For each element in the array, determine the X position and the Y positions for rain and temperature
3. Add the resulting transformed point to the 'transformedPoints' array
*/
avgDataPerYear.forEach(datapoint => {
  var xPos = (pixelsPerYear / 2) + (datapoint.year - minYear) * (pixelsPerYear);
  var yPosRain = visHeight - scalePoint(datapoint.rain, [minRain, maxRain], [0, visHeight]);
  var yPosTemp = visHeight - scalePoint(datapoint.temperature, [minTemp, maxTemp], [0, visHeight]);

  transformedPoints.push({
    xr : xPos,
    yr : yPosRain,
    xt : xPos,
    yt : yPosTemp
  });
});

function scalePoint(yPos, domain, range) {
  return (range[1] - range[0]) * ((yPos - domain[0]) / (domain[1] - domain[0])) + range[0];
}

console.log("Dataset:", transformedPoints);

/*
TASK 7: Add the points to the screen
1. Use a loop to iterate through the 'transformedPoints' array
2. For each element:
    - Create two circle elements (one for rain and one temperature)
    - Set their 'cx', 'cy', and 'r' attribute
    - Add them to the visG group
 */

transformedPoints.forEach(datapoint => {
  var rainPoint = document.createElementNS(svgNamespace, "circle");
  rainPoint.setAttribute("class", "rain-point");
  rainPoint.setAttribute("cx", datapoint.xr);
  rainPoint.setAttribute("cy", datapoint.yr);
  rainPoint.setAttribute("r", 3);
  visG.appendChild(rainPoint);

  var tempPoint = document.createElementNS(svgNamespace, "circle");
  tempPoint.setAttribute("class", "temp-point");
  tempPoint.setAttribute("cx", datapoint.xt);
  tempPoint.setAttribute("cy", datapoint.yt);
  tempPoint.setAttribute("r", 3);
  visG.appendChild(tempPoint);
});

/*
TASK 8: Add lines to the visualization. Use polylines to connect the previously created points.
1. Create an element "polyline" for temperature and rain
2. Extract the data that is necessary (list of x,y coordinates) for the "points" attribute of the polyline
   You can make use of JavaScripts Array.prototype.map() function to extract the coordinates as an array.
3. Add the polyline to visG group
*/
var rainLine = document.createElementNS(svgNamespace, "polyline");
rainLine.setAttribute("id", "rainline");
var tempLine = document.createElementNS(svgNamespace, "polyline");
tempLine.setAttribute("id", "templine");

var rainString = "";
var rainPoints = Array.from(visG.getElementsByClassName("rain-point"));
rainPoints.forEach(point => {
  rainString += `${point.getAttribute("cx")}, ${point.getAttribute("cy")} `;
});
rainLine.setAttribute("points", rainString);

var tempString = "";
var tempPoints = Array.from(visG.getElementsByClassName("temp-point"));
tempPoints.forEach(point => {
  tempString += `${point.getAttribute("cx")}, ${point.getAttribute("cy")} `;
});
tempLine.setAttribute("points", tempString);

visG.appendChild(rainLine);
visG.appendChild(tempLine);

/* Helper function to retrieve important statistics */
function getMaxFromArrayOfObjects(attributeName, arrOfObjects) {
  /** TASK 3.1: Write the code for the helper functions getMinFromArrayOfObjects and getMaxFromArrayOfObjects! */
  return (arrOfObjects.reduce((previousValue, currentValue) => previousValue[attributeName] > currentValue[attributeName] ? previousValue : currentValue))[attributeName];
}

function getMinFromArrayOfObjects(attributeName, arrOfObjects) {
  /* TASK 3.2: Write the code for the helper functions getMinFromArrayOfObjects and getMaxFromArrayOfObjects! */
  return (arrOfObjects.reduce((previousValue, currentValue) => previousValue[attributeName] < currentValue[attributeName] ? previousValue : currentValue))[attributeName];
}

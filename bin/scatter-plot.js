(function() {

var margin = {top: 30, right: 30, bottom: 30, left: 30},
    width = (window.innerHeight - 150) * 1.4,
    height = window.innerHeight - 150;

// setup x 
var xValue = function(d) { return d[xvar];}, // data -> value
    xScale = d3.scale.linear().range([0, width]), // value -> display
    xMap = function(d) { return xScale(xValue(d));}, // data -> display
    xAxis = d3.svg.axis().scale(xScale).orient("bottom");

// setup y
var yValue = function(d) { return d[yvar];}, // data -> value
    yScale = d3.scale.linear().range([height, 0]), // value -> display
    yMap = function(d) { return yScale(yValue(d));}, // data -> display
    yAxis = d3.svg.axis().scale(yScale).orient("left");
    
// combine x and y
var coordinateMap = function(d) { return "translate(" + xMap(d) + ", " + yMap(d) + ")"; };

// setup fill color
var cValue = function(d) { return d[cvar];},
    color = d3.scale.category10();

var shape = d3.scale.ordinal().range([0, 1, 2, 3, 4, 5, 6]);
var shapeMap = function(d) { return (d3.svg.symbol().size(30).type(d3.svg.symbolTypes[shape(d[cvar])]))(); };

// setup fill color
var radius = function(d) { return Math.sqrt(d.count);};

// add the graph canvas to the div in the webpage
var svg = d3.select("#scatter-plot_container").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
	.attr("id", "scatter-plot_svg")
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// add the tooltip area to the webpage
var tooltip = d3.select("#scatter-plot_container").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("color", "#202020")
    .style("text-shadow", "white 0px 0px 20px, white 0px 0px 5px, white 0px 0px 2px, white 0px 0px 1px");

var xvar,
    yvar,
    cvar;

var columns;

// (Re)sets the visualization canvas
function cleansvg() {
  d3.select("#scatter-plot_svg").remove();
  width = (window.innerHeight - 150) * 1.4,
  height = window.innerHeight - 150;
  svg = d3.select("#scatter-plot_container").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
	  .attr("id", "scatter-plot_svg")
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
}

function updateColumns() {
    for (var i in columns) {
        if (window.document.getElementById("scatter-plot_checkbox_x_" + columns[i]).checked) {
            xvar = columns[i];
        }
        if (window.document.getElementById("scatter-plot_checkbox_y_" + columns[i]).checked) {
            yvar = columns[i];
        }
        if (window.document.getElementById("scatter-plot_checkbox_c_" + columns[i]).checked) {
            cvar = columns[i];
        }
    }
    
    buildVisualization();
}

// Selects the checkbox with id scatter-plot_checkbox_type_column, and deselects all others
function selectCheckbox(type, column) {
    console.log("unchecking");
    for (var i in columns) {
        if (i != column) {
            window.document.getElementById("scatter-plot_checkbox_" + type + "_" + column).checked =  false;
        }
    }
}

function printSomething() {
    console.log("yay");
}

function newCheckboxDiv(column) {
    var div = document.createElement("div");
    var checkboxX = document.createElement("input");
    var checkboxY = document.createElement("input");
    var checkboxC = document.createElement("input");
    
    checkboxX.checked = true;
    checkboxY.checked = true;
    checkboxC.checked = true;
    checkboxX.type = "checkbox";
    checkboxY.type = "checkbox";
    checkboxC.type = "checkbox";
    checkboxX.id = "scatter-plot_checkbox_x_" + column;
    checkboxY.id = "scatter-plot_checkbox_y_" + column;
    checkboxC.id = "scatter-plot_checkbox_c_" + column;
    checkboxX.name = column;
    checkboxY.name = column;
    checkboxC.name = column;
    checkboxX.addEventListener("click", printSomething, false);
    checkboxY.addEventListener("click", printSomething, false);
    checkboxC.addEventListener("click", printSomething, false);
    
    div.appendChild(checkboxX);
    div.appendChild(checkboxY);
    div.appendChild(checkboxC);
    div.innerHTML += " " + column;
    return div;
}

// Sets up the data selection checkboxes
function createCheckboxes(columns) {
    if (!!window.document.getElementById('scatter-plot_checkbox_x_' + columns[0])) { // checkboxes already created
        return;
    }
    element = window.document.getElementById('scatter-plot_checkboxes');
    element.innerHTML = "";
    for (var i in columns) {
        element.appendChild(newCheckboxDiv(columns[i]));

    }
    element.innerHTML += "<button id='scatter-plot_button'>Update graph</button>"
//         element.onclick = updateColumns; // This enables updating the visualization every time a checkbox is ticked or unticked
    window.document.getElementById('scatter-plot_button').onclick = updateColumns;
}

function init(error, data) {

  // change string (from CSV) into number format
  data.forEach(function(d) {
//     d.Calories = +d.Calories;
//     d.Carbs = +d.Carbs;
//     d["Protein (g)"] = +d["Protein (g)"];
    for (var key in d) {
      d[key] = +(d[key].replace(',', '.'));
    }
// NOTE: use ".replace(',', '.')"
//    console.log(d);
  });
  
  if (!xvar) {
    xvar = Object.keys(data[0])[0];
  }
  if (!yvar) {
    yvar = Object.keys(data[0])[1];
  }
  if (!cvar) {
    cvar = Object.keys(data[0])[2];
  }
  
  console.log(xvar);
  console.log(yvar);
  console.log(data);
  
  // don't want dots overlapping axis, so add in buffer to data domain
  xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
  yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);

  // x-axis
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text(xvar);

  // y-axis
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text(yvar);
  
  // draw dots
  svg.selectAll(".dot")
      .data(data)
    .enter().append("path")
      .attr("class", "dot")
      .attr("d", shapeMap)
      .attr("transform", coordinateMap)
      .style("fill", function(d) { return color(cValue(d));})
      .on("mouseover", function(d) {
          tooltip.transition()
               .duration(200)
               .style("opacity", 1);
          tooltip.html(cValue(d) + "<br/> (" + xValue(d) 
	        + ", " + yValue(d) + ")")
               .style("left", (d3.event.pageX + 5) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
          tooltip.transition()
               .duration(500)
               .style("opacity", 0);
      });

  // Set the checkboxes to the correct column names
  columns = d3.keys(data[0]);
  createCheckboxes(columns);
  console.log(columns);
}

function buildVisualization() {
  cleansvg();
  var url = new URLSearchParams(window.location.search);
  d3.csv(url.get("file"), init);
}

buildVisualization();

})();

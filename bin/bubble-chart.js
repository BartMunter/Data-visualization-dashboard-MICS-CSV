(function() {

var margin = {top: 30, right: 30, bottom: 30, left: 30},
    width = (window.innerHeight - 150) * 1.4,
    height = window.innerHeight - 150;

// setup x 
var xValue = function(d) { return d.xval;}, // data -> value
    xScale = d3.scale.linear().range([0, width]), // value -> display
    xMap = function(d) { return xScale(xValue(d));}, // data -> display
    xAxis = d3.svg.axis().scale(xScale).orient("bottom");

// setup y
var yValue = function(d) { return d.yval;}, // data -> value
    yScale = d3.scale.linear().range([height, 0]), // value -> display
    yMap = function(d) { return yScale(yValue(d));}, // data -> display
    yAxis = d3.svg.axis().scale(yScale).orient("left");

// setup bubble radius
var radius = function(d) { return Math.sqrt(d.count);};

// add the graph canvas to the div in the webpage
var svg = d3.select("#bubble-chart_container").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
	.attr("id", "bubble-chart_svg")
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// add the tooltip area to the webpage
var tooltip = d3.select("#bubble-chart_container").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("color", "#202020")
    .style("text-shadow", "white 0px 0px 20px, white 0px 0px 5px, white 0px 0px 2px, white 0px 0px 1px");

// The names of the variables that are shown
var xvar,
    yvar;

// An array of all variable names found in the data
var columns;

// (Re)sets the visualization canvas
function cleansvg() {
  d3.select("#bubble-chart_svg").remove();
  width = (window.innerHeight - 150) * 1.4,
  height = window.innerHeight - 150;
  svg = d3.select("#bubble-chart_container").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
	  .attr("id", "bubble-chart_svg")
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
}

// Updates the visualization based on the state of the checkboxes
function updateColumns() {
    for (var i in columns) {
        if (window.parent.document.getElementById("bubble-chart_checkbox_x_" + columns[i]).checked) {
            xvar = columns[i];
        }
        if (window.parent.document.getElementById("bubble-chart_checkbox_y_" + columns[i]).checked) {
            yvar = columns[i];
        }
    }
    
    buildVisualization();
}

// Selects the checkbox with id bubble-chart_checkbox_type_column, and deselects all others
// Currently not used due to a bug in the calling code
function selectCheckbox(type, column) {
    console.log("unchecking");
    for (var i in columns) {
        if (i != column) {
            window.parent.document.getElementById("bubble-chart_checkbox_" + type + "_" + column).checked =  false;
        }
    }
}

// Create and return a new HTML element that contains the checkboxes for one variable
function newCheckboxDiv(column) {
    var div = document.createElement("div");
    var checkboxX = document.createElement("input");
    var checkboxY = document.createElement("input");
    
    checkboxX.type = "checkbox";
    checkboxY.type = "checkbox";
    checkboxX.id = "bubble-chart_checkbox_x_" + column;
    checkboxY.id = "bubble-chart_checkbox_y_" + column;
    checkboxX.name = column;
    checkboxY.name = column;
//  checkboxX.addEventListener("click", selectCheckbox, false); // Removed due to a bug that prevents it from working
//  checkboxY.addEventListener("click", selectCheckbox, false);
    
    div.appendChild(checkboxX);
    div.appendChild(checkboxY);
    div.innerHTML += " " + column;
    return div;
}

// Sets up the data selection checkboxes
function createCheckboxes(columns) {
    if (!!window.parent.document.getElementById('bubble-chart_checkbox_x_' + columns[0])) { // checkboxes already created
        return;
    }
    element = window.parent.document.getElementById('bubble-chart_checkboxes');
    element.innerHTML = "";
    for (var i in columns) {
        element.appendChild(newCheckboxDiv(columns[i]));

    }
    element.innerHTML += "<button id='bubble-chart_button'>Update graph</button>"
//  element.onclick = updateColumns; // Uncommenting this line enables updating the visualization every time a checkbox is ticked or unticked
    window.parent.document.getElementById('bubble-chart_button').onclick = updateColumns;
}

// Loads the data
function init(error, data) {

  // Change strings into numerics
  data.forEach(function(d) {
    for (var key in d) {
      d[key] = +(d[key].replace(',', '.'));
    }
  });
  
  // Choose the initial variables when first creating the graph
  if (!xvar) {
    xvar = Object.keys(data[0])[0];
  }
  if (!yvar) {
    yvar = Object.keys(data[0])[1];
  }
  
  // Count occurences
  var tmpdata = {}
  data.forEach(function(d) {
    if (d[xvar] in tmpdata) {
      if (d[yvar] in tmpdata[d[xvar]]) {
        tmpdata[d[xvar]][d[yvar]] += 1;
      } else {
        tmpdata[d[xvar]][d[yvar]] = 1;
      }
    } else {
      tmpdata[d[xvar]] = {};
      tmpdata[d[xvar]][d[yvar]] = 1;
    }
  });
  
  var newdata = [];
  for (var key1 in tmpdata) {
    for (var key2 in tmpdata[key1]) {
      newdata.push({
        "xval": +key1,
        "yval": +key2,
        "count": tmpdata[key1][key2]
      });
    }
  }
  
  // don't want dots overlapping axis, so add in buffer to data domain
  xScale.domain([d3.min(newdata, xValue)-1, d3.max(newdata, xValue)+1]);
  yScale.domain([d3.min(newdata, yValue)-1, d3.max(newdata, yValue)+1]);

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
      .data(newdata)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", radius)
      .attr("cx", xMap)
      .attr("cy", yMap)
      .style("fill", "#0091D5")
      .on("mouseover", function(d) {
          tooltip.transition()
               .duration(200)
               .style("opacity", 1);
          tooltip.html(d["count"] + "<br/> (" + xValue(d) 
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
  var url = new URLSearchParams(window.parent.location.search);
  d3.csv(url.get("file"), init);
}

buildVisualization();

})();

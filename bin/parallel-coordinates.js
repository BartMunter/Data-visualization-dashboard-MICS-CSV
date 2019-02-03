(function() {

var margin = {top: 30, right: 30, bottom: 30, left: 30},
    width = (window.innerHeight - 150) * 1.4,
    height = window.innerHeight - 150;

var x = d3.scale.ordinal().rangePoints([0, width], 1),
    y = {},
    dragging = {};

var line = d3.svg.line(),
    axis = d3.svg.axis().orient("left"),
    background,
    foreground;

var svg;

// (Re)sets the visualization canvas
function cleansvg() {
  d3.select("#parallel-coordinates_svg").remove();
  width = (window.innerHeight - 150) * 1.4,
  height = window.innerHeight - 150;
  svg = d3.select("#parallel-coordinates_container").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("id", "parallel-coordinates_svg")
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
}

// Will hold the names of all columns
var columns;

// Will hold the names of columns that should be hidden
var blacklist = [];

// Update the visualization with new checkbox info
function updateColumns() {
  blacklist = []
  for (var i in columns){
    element = window.parent.document.getElementById('parallel-coordinates_checkbox_' + columns[i]);
    if (!element.checked) {
      blacklist.push(columns[i]);
    }
  }
  
  buildVisualization();
}

// Sets up the data selection checkboxes
function createCheckboxes(columns) {
    if (!!window.parent.document.getElementById('parallel-coordinates_checkbox_' + columns[0])) { // checkboxes already created
      return;
    }
    element = window.parent.document.getElementById('parallel-coordinates_checkboxes');
    element.innerHTML = "";
    for (var i in columns) {
        element.innerHTML += "<div><input type='checkbox' id='parallel-coordinates_checkbox_" + columns[i] + "' name='" + columns[i] +"' checked=true> " + columns[i] + "</input></div><br>";
//      element.onclick = updateColumns; // This enables updating the visualization every time a checkbox is ticked or unticked

    }
    element.innerHTML += "<button id='parallel-coordinates_button'>Update graph</button>"
    window.parent.document.getElementById('parallel-coordinates_button').onclick = updateColumns;
}

// Loads the data
function init(error, data) {
  // Extract the list of dimensions and create a scale for each.
  x.domain(dimensions = d3.keys(data[0]).filter(function(d) {
    return !blacklist.includes(d) && (y[d] = d3.scale.linear()
        .domain(d3.extent(data, function(p) { return +p[d]; }))
        .range([height, 0]));
  }));

  // Add grey background lines for context.
  background = svg.append("g")
      .attr("class", "background")
    .selectAll("path")
      .data(data)
    .enter().append("path")
      .attr("d", path);

  // Add blue foreground lines for focus.
  foreground = svg.append("g")
      .attr("class", "foreground")
    .selectAll("path")
      .data(data)
    .enter().append("path")
      .attr("d", path);

  // Add a group element for each dimension.
  var g = svg.selectAll(".dimension")
      .data(dimensions)
    .enter().append("g")
      .attr("class", "dimension")
      .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
      .call(d3.behavior.drag()
        .origin(function(d) { return {x: x(d)}; })
        .on("dragstart", function(d) {
          dragging[d] = x(d);
          background.attr("visibility", "hidden");
        })
        .on("drag", function(d) {
          dragging[d] = Math.min(width, Math.max(0, d3.event.x));
          foreground.attr("d", path);
          dimensions.sort(function(a, b) { return position(a) - position(b); });
          x.domain(dimensions);
          g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
        })
        .on("dragend", function(d) {
          delete dragging[d];
          transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
          transition(foreground).attr("d", path);
          background
              .attr("d", path)
            .transition()
              .delay(500)
              .duration(0)
              .attr("visibility", null);
        }));

  // Add an axis and title.
  g.append("g")
      .attr("class", "axis")
      .each(function(d) { d3.select(this).call(axis.scale(y[d])); })
    .append("text")
      .style("text-anchor", "middle")
      .attr("y", -9)
      .text(function(d) { return d; });

  // Add and store a brush for each axis.
  g.append("g")
      .attr("class", "brush")
      .each(function(d) {
        d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brushstart", brushstart).on("brush", brush));
      })
    .selectAll("rect")
      .attr("x", -8)
      .attr("width", 16);
  
  // Set the checkboxes to the correct column names
  columns = d3.keys(data[0]);
  createCheckboxes(columns);
}

// (re)creates the full visualization
function buildVisualization() {
  cleansvg();
  var url = new URLSearchParams(window.parent.location.search);
  d3.csv(url.get("file"), init);
}

function position(d) {
  var v = dragging[d];
  return v == null ? x(d) : v;
}

function transition(g) {
  return g.transition().duration(500);
}

// Returns the path for a given data point.
function path(d) {
  return line(dimensions.map(function(p) { return [position(p), y[p](d[p])]; }));
}

function brushstart() {
  d3.event.sourceEvent.stopPropagation();
}

// Handles a brush event, toggling the display of foreground lines.
function brush() {
  var actives = dimensions.filter(function(p) { return !y[p].brush.empty(); }),
      extents = actives.map(function(p) { return y[p].brush.extent(); });
  foreground.style("display", function(d) {
    return actives.every(function(p, i) {
      return extents[i][0] <= d[p] && d[p] <= extents[i][1];
    }) ? null : "none";
  });
}

buildVisualization();

})();

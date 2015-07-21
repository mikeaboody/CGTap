var weekly_timesheet = [];
var currPageSubmitObjs = [];

var todaysTimesheet = function(ts) {
    var date_selected = $(".submit_date .datepicker").datepicker("getDate").getDate();
    console.log(date_selected);
    var newTS = [];
    for (var i = 0; i < ts.length; i += 1) {
        var currEntry = ts[i];
        if (date_selected == currEntry.date.getDate()) {
            newTS.push(currEntry);
        }
    }
    for (var i = 0; i < currPageSubmitObjs.length; i += 1) {
        var currSubmitObj = currPageSubmitObjs[i];
        var newEntry = new PastEntry(null, currSubmitObj.project_nm, currSubmitObj.task_nm, currSubmitObj.task_type,
                                      currSubmitObj.hours, new Date(currSubmitObj.date));
        if (date_selected == newEntry.date.getDate()) {
            newTS.push(newEntry);
        }
    }
    return newTS;
}

var createData = function() {
    var dailyHours = 0;
    var todaysTS = todaysTimesheet(weekly_timesheet);
    console.log(todaysTS);
    for (var i = 0; i < todaysTS.length; i += 1) {
        var currEntry = todaysTS[i];
        dailyHours += currEntry.hours;
    }
    console.log(dailyHours);
    return [{value: dailyHours, color: '#75ad3e', middleText: 'TARGET'}];
}


var displayData = function() {
	var w = 50,                        //width
    h = w,                            //height
    r = w/2,                            //radius
    color = d3.scale.category20c();     //builtin range of colors

    data = createData();
    
    var vis = d3.select(".modal-body").append('svg')
                                         //create the SVG element inside the <body>
        .data([data])                   //associate our data with the document
            .attr("width", w)           //set the width and height of our visualization (these will be attributes of the <svg> tag
            .attr("height", h)
        .append("svg:g")                //make a group to hold our pie chart
            .attr("transform", "translate(" + r + "," + r + ")")    //move the center of the pie chart from 0, 0 to radius, radius

    var arc = d3.svg.arc()              //this will create <path> elements for us using arc data
        .outerRadius(r);

    var pie = d3.layout.pie()           //this will create arc data for us given a list of values
        .value(function(d) { return d.value; });    //we must tell it out to access the value of each element in our data array

    var arcs = vis.selectAll("g.slice")     //this selects all <g> elements with class slice (there aren't any yet)
        .data(pie)                          //associate the generated pie data (an array of arcs, each having startAngle, endAngle and value properties) 
        .enter()                            //this will create <g> elements for every "extra" data element that should be associated with a selection. The result is creating a <g> for every object in the data array
            .append("svg:g")                //create a group to hold each slice (we will have a <path> and a <text> element associated with each slice)
                .attr("class", "slice");    //allow us to style things in the slices (like text)

        arcs.append("svg:path")
                .attr("fill", function(d, i) { return color(i); } ) //set the color for each slice to be chosen from the color function defined above
                .attr("d", arc);                                    //this creates the actual SVG path using the associated data (pie) with the arc drawing function

        arcs.append("svg:text")                                     //add a label to each slice
                .attr("transform", function(d) {                    //set the label's origin to the center of the arc
                //we have to make sure to set these before calling arc.centroid
                d.innerRadius = 0;
                d.outerRadius = r;
                return "translate(" + arc.centroid(d) + ")";        //this gives us a pair of coordinates like [50, 50]
            })
            .attr("text-anchor", "middle")                          //center the text on it's origin
            .text(function(d, i) { return data[i].label + ": " + data[i].value + " hours"; });        //get the label from our original data array
}
// past time sheet billing info

            var width = 200,
                height = 200,
                radius = 125,
                color = d3.scale.category20c();

            var data = [{"label":"ONE", "value":194}, 
                {"label":"TWO", "value":567}, 
                {"label":"THREE", "value":1314},
                {"label":"FOUR", "value":793},
                {"label":"FIVE", "value":1929},
                {"label":"SIX", "value":1383}];

              // var piedata = [
              //   { label: "", 
              //    value: 50}, 
              //   { label:"", 
              //    value: 50},
              //   { label:"", 
              //     value: 50}
      
              //   ]

            var pie = d3.layout.pie()
               .value(function(d) {
                 return d.value;
                })
            var arc = d3.svg.arc()
              .innerRadius(radius - 100)
              .outerRadius(radius - 50);

            var myChart = d3.select('#myChart').append('svg')
                .attr('width', width)
                .attr('height', height)
                .append('g')
                .attr('transform', 'translate('+(width - radius)+', '+(height-radius)+')')
                .selectAll('path').data(pie(data))
                .enter().append('g')
  // create a class called slice to slap some data on
                .attr('class', 'slice');

            var slices = d3.selectAll('g.slice')
                .append('path')
                .attr('fill', function(d, i) {
                 return color(i); 
               })
                .attr('d', arc);
// each element has its own data object   
            var text = d3.selectAll('g.slice')
                .append('text')
                .text(function(d, i) {
                   return d.data.label;
                })
// here come the attributes which format
                .attr('text-anchor', 'middle')
                .attr('fill', 'black')
                .attr('transform', function(d){ 
                    d.innerRadius = 0;
                    d.outerRadius = radius;
                return 'translate('+ arc.centroid(d)+')'
                      });

            var legend = d3.select("#myChart").append("svg")
                .attr("class", "legend")
                .attr("width", width)
                .attr("height", height)
                .selectAll("g")
                .data(data)
                 .enter().append("g")
                .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

                legend.append("rect")
                .attr("width", 18)
                .attr("height", 18)
                .style("fill", function(d, i) { return color(i); });

                legend.append("text")
                 .attr("x", 24)
                 .attr("y", 9)
                 .attr("dy", ".35em")
                .text(function(d) { return d.label; });
// donut for total daily time


    
            var donutChart;
                (function() {
            var w = 100,
                h = 100,
                r = 50,
                innerRadius = 40,
                transitionsDuration = 1000,
                transitionsDelay = 250,
                 hoursTextSize = '1.5rem';

  // This is the scale to avoid using gradiant for the angles.
            var rScale = d3.scale.linear().domain([0, 24]).range([0, 2 * Math.PI]);

  // Here we use the helper function of d3 to draw arcs easier
            var arc = d3.svg.arc()
                .outerRadius(r + 0.8)
    .innerRadius(innerRadius);

  // Another helper function of d3 to bind the data to the arcs
  var pie = d3.layout.pie()
    .value(function(d) {
      return d.value;
    });

  donutChart = {
    /**
     * A d3 function that draws a donut chart.
     */
    draw: function(container, data) {

      var svg = d3.select('#donutChart').append('svg');

      createBigCircle(svg);
      var vis = createChartContainer(svg, data);
      drawChartArcs(vis, data);
      createSmallCircle(vis);
      drawHoursText(vis, data);
      // drawInformativeText(vis, data);

    }
  };

  // Here we create the big circle (the outer one)
  function createBigCircle(svg) {
    svg.append('circle')
      .attr('cx', r)
      .attr('cy', r)
      .attr('r', r)
      .attr('class', 'pie-graph-big-circle');
  }

  // Here we give dimensions to the svg and create a g container
  function createChartContainer(svg, data) {
    return svg
      .data([data])
      .attr('width', w)
      .attr('height', h)
      .append('g')
      .attr('transform', 'translate(' + r + ',' + r + ')');
  }

  // We draw the arc in here, give it an smooth transition and the correct color depending on the data.
  function drawChartArcs(visualization, data) {
    var arcs = visualization.selectAll('g')
      .data(pie)
      .enter()
      .append('g');

    arcs.append('path')
    /*.attr('transform', function(d){return 'rotate('+rotationAngle(d.value)+')' })*/
    .attr('fill', function(d, i) {
      return data[i].color;
    })
      .each(function(d) {
        d.endAngle = 0;
      })
      .attr('d', arc)
      .transition()
      .duration(transitionsDuration)
      .delay(transitionsDelay)
      .ease('elastic')
      .call(arcTween, this);
  }

  // This help us achieve the arcs transitions.
  function arcTween(transition, newAngle) {

    transition.attrTween("d", function(d) {

      var interpolate = d3.interpolate(0, 360 * (d.value / 24) * Math.PI / 180);

      return function(t) {

        d.endAngle = interpolate(t);

        return arc(d);
      };
    });
  }

  // This is the small circle, the one with the text in the middle.
  function createSmallCircle(visualization) {
    visualization.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', innerRadius)
      .attr('class', 'pie-graph-small-circle');
  }

  // This is the percentage text, it appears with the same transition as the path/arcs
  function drawHoursText(visualization, data) {
    visualization.append('text')
      .data(data)
      .attr("font-family", "Arial")
      .attr("font-size", "0px")
      .attr("fill", "white")
      .attr('text-anchor', 'middle')
      .attr('y', '5px')
      .text(function(d) {
        return d.value + " hours";
      })
      .transition()
      .attr('font-size', hoursTextSize)
      .duration(transitionsDuration)
      .delay(transitionsDelay)
      .ease('elastic');
  }
})();

    


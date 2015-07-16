 var donutChart;
(function() {
  var w = 250,
   h = 150,
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

      var svg = d3.select('#donut').append('svg');

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

donutChart.draw('#donut-chart', [{value: 6.5, color: '#75ad3e', middleText: 'TARGET'}] )
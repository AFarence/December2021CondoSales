(function () {

  // Margin convention
  const margin = { top: 30, right: 50, bottom: 50, left: 50 }
  const width = 600 - margin.left - margin.right
  const height = 425 - margin.top - margin.bottom

  const svg = d3.select("#chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")


  // Color scale based on price per sq ft
  const colorScale = d3.scaleLinear()
        .domain([512,3742])
        .range(["#FF3131","#4B0082"]) 

  // Set radius scale
  const radiusScale = d3.scaleSqrt()
    .domain([0, 150000000])
    .range([0, 100])

  // Define years
  const years = [2021]

  // Define x axis position
  const xPositionScale = d3.scalePoint()
    .domain(years)
    .range([140, width - 110])

  // Create tooltip
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "svg-tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden");
  
  // Force simulation and prevent overlap
  const forceX = d3.forceX(d => xPositionScale(d.year)).strength(1)
  const forceY = d3.forceY(150).strength(1)
  const forceCollide = d3.forceCollide((d => radiusScale(d.Sale_Price_int)))
  const simulation = d3.forceSimulation()
    .force("overlap", forceCollide)
    .force("y", forceY)
    .force("x", forceX)
    .force('charge', d3.forceManyBody().strength(-500))

  d3.dsv("|","December2021CondoSales.csv")
    .then(ready)
  function ready (datapoints) {
    datapoints.forEach(d => {
      d.x = xPositionScale(d.year);
      d.y = 0;
    })

  // Set position of circles
    svg.selectAll('circle')
      .data(datapoints)
      .join('circle')
      .attr("id", "circleBasicTooltip")
      .attr('r', d => radiusScale(d.Sale_Price_int))
      .attr('cx', d => xPositionScale(d.year))
      .attr('fill', d => colorScale(d.price_per_sqft_int))
      .attr('cy', 200)
      .attr('stroke-width', 2)
      .attr("stroke", "black")

  // Trigger tooltip
    d3.selectAll("circle")
      .on("mouseover", function(e, d) {
        d3.select(this)
          .attr('stroke-width', '3')
          .attr("stroke", "black");
        tooltip
          .style("visibility", "visible")
          .attr('class','tooltipdiv')
          .html(`<h4><strong>${d.building_name}</strong></h4>` + 
                `<p><strong>Sale Price</strong>: ${d.Sale_Price}<br />` +
                `<p><strong>Address</strong>: ${d.address_only}<br />` +
                `<p><strong>Sq Ft</strong>: ${d.Sq_Ft}<br />` +
                `<p><strong>Price Per Sq Ft</strong>: ${d.price_per_sqft}<br />` +
                `<p><strong>List Date</strong>: ${d.List_Date}<br />` +
                `<p><strong>Close Date</strong>: ${d.Close_Date}<br />` +
                `<p><strong>Days on Market</strong>: ${d.days_on_market}<br />` +
                `<p><strong>Agent</strong>: ${d.Agent}<br />` +
                `<p><strong>Buyer Agent</strong>: ${d.Buyer_Agent}<br />`);
      })
      .on("mousemove", function(e) {
        tooltip
          .style("top", e.pageY - 10 + "px")
          .style("left", e.pageX + 10 + "px");
      })
      .on("mouseout", function() {
        d3.select(this).attr('stroke-width', 2);
          tooltip.style("visibility", "hidden");
    });


    simulation.nodes(datapoints)
      .on('tick', ticked)
    function ticked() {
      svg.selectAll('circle')
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)      
    }
  }
})();
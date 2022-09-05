import * as d3 from 'd3'

function numberWithCommas(x) {
    x = x.toFixed(0)
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

looker.plugins.visualizations.add({
    id: "thrive_reusable_horizontal_bar_graph",
    label: "Horizontal Bar Graph",
    create: function (element, config) {

        element.innerHTML = `
        <style>

            @import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');
            @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap');

            * {
              box-sizing: border-box;
            }

            html, body, #vis {
              height: 100%;
              margin: 0;
              padding: 0;
              border: none;
            }

            #vis {
              height: 100%;
              width: 100%;
              margin: 0
            }

            .tooltip {
                position: absolute;
                text-align: left;
                padding: 12px;
                background: #FFFFFF;
                color: #313639;
                pointer-events: none;
                font-size: 1.3rem;
                box-shadow: 3px 3px 4px 0px #46464666;
                border-radius: 3px;
                font: 10px/12px 'Roboto Mono', monospace;
                transition-duration: 250ms;
            }

            .tooltip-dimension-value, .tooltip-measure-value {
                font-weight: 700
            }
        </style>`;
        // Create a container element to let us center the text.
    },
    // Render in response to the data or settings changing
    updateAsync: function (data, element, config, queryResponse, details, done) {

        var parentDiv = document.getElementById("vis");

        d3.select("div").html("");

        element.innerHTML = `
        <style>

            @import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');
            @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap');

            * {
              box-sizing: border-box;
            }

            html, body, #vis {
              height: 100%;
              margin: 0;
              padding: 0;
              border: none;
            }

            #vis {
              height: 100%;
              width: 100%;
              margin: 0;
              display: flex
            }

            .tooltip {
                position: absolute;
                text-align: left;
                padding: 12px;
                background: #FFFFFF;
                color: #313639;
                pointer-events: none;
                font-size: 1.3rem;
                box-shadow: 3px 3px 4px 0px #46464666;
                border-radius: 3px;
                font: 10px/12px Helvetica;
                transition-duration: 250ms;
            }

            .tooltip-dimension-value, .tooltip-measure-value {
                font-weight: 700
            }

            .label {
                color: #727171;
                font: 9.47px/9px Helvetica;
                letter-spacing: 0.04em;
                font-weight: 700
            }

            .y-axis-div {
                display: flex;
                justify-content: center;
                align-items: center;
                margin-bottom: 25px;
                padding-left: 15px;
            }

            .y-axis-text {
                will-change: transform;
                transform: rotate(270deg);
                ms-writing-mode: tb-rl;
                -webkit-writing-mode: vertical-rl;
                writing-mode: vertical-rl;
                -webkit-transform: rotate(180deg);
                transform: rotate(180deg);
                white-space: nowrap;
                color: #727171;
                font: 9.47px/9px Helvetica;
                letter-spacing: 0.04em;
                font-weight: 700;
            }

            .axis-grid line {
                stroke: #c3c3c3;
                stroke-dasharray: 2;
            }

            .right-wrapper {
                width: 100%;
                max-width: 100%;
            }
        </style>`

        
        // Clear any errors from previous updates
        this.clearErrors(queryResponse.fields);

        if (queryResponse.fields.measures.length == 0 || queryResponse.fields.dimensions.length == 0) {
            this.addError({ title: "No Measures or Dimensions", message: "This chart requires a measure and a dimension." });
            return;
        }

        var dimension = queryResponse.fields.dimensions[0]
        var measure = queryResponse.fields.measures[0]

        var dimensionName = dimension.name
        var dimensionLabel = dimension.label_short
        var measureName = measure.name
        var measureLabel = measure.label_short

        var outerDiv = d3.select('div')

        var yDiv = outerDiv.append('div')
            .attr('class', 'y-axis-div')
            .append('span')
            .attr('class', 'y-axis-text')
            .text(measureLabel)
            .attr('id', 'yLabel');

        var leftDiv = document.getElementById("yLabel");

        var rightWrapper = outerDiv.append('div')
            .attr('class', 'right-wrapper')

        var xDiv = rightWrapper.append('div')
            .attr('class', 'x-axis-div')

        const margin = {top: 30, right: 30, bottom: 90, left: 95}
        const width = parentDiv.clientWidth - leftDiv.clientWidth - margin.left - margin.right
        const height =  parentDiv.clientHeight - leftDiv.clientWidth - margin.top - margin.bottom

        // append the svg object to the body of the page
        var svg = rightWrapper.append("svg")
            .attr("width", parentDiv.clientWidth - leftDiv.clientWidth - 15)
            .attr("height", parentDiv.clientHeight - 15)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        svg.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "middle")
            .attr("x", width*0.5)
            .attr("y", parentDiv.clientHeight - 48)
            .text(dimensionLabel)
            .attr("fill","#727171");

        /*svg.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "middle")
            .attr("y", parentDiv.clientHeight*0.5)
            .attr("x", 48)
            .text(measureLabel)
            .attr("fill","#727171")
            .attr("transform", `translate(-307, ${parentDiv.clientHeight*0.5})rotate(-90)`);*/

        svg.append('defs')
            .append('style')
            .attr('type', 'text/css')
            .text("@import url('https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap');");

        var div = d3.select("div").append("div")
            .attr("class", "tooltip")
            .style("display", "none");
        
        var dimensionTooltip = d3.select(".tooltip")
            .append('div')
            .attr('class', 'tooltip-dimension')

        var measureTooltip = d3.select(".tooltip")
            .append('div')
            .attr('class', 'tooltip-measure')


        var x = d3.scaleBand()
            .range([0, width])
            .domain(data.map(function (d) { return d[dimensionName].value }))
            .padding(0.2);

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-5,5)rotate(-45)")
            .style("text-anchor", "end")
            .style("font-family", "Helvetica")
            .style("font-weight", "700")
            .attr("fill", "#151313")
            .attr("font-size", "9.47368px");
        // Add Y axis
        var y = d3.scaleLinear()
            .domain([0, d3.max(data.map(function(d) { return d[measureName].value }))])
            .range([height, 0])

        let axisLeft = d3.axisLeft(y).ticks(3)

        const axisLeftGrid = d3.axisLeft(y).tickSize(-width).tickFormat('').ticks(3)

        svg.append("g")
            .call(axisLeft)
            .selectAll("text")
            .style("font-family", "Helvetica")
            .style("font-weight", "700")
            .attr("fill", "#151313")
            .attr("font-size", "11px");

        svg.append('g')
            .attr('class', 'y axis-grid')
            .call(axisLeftGrid);


        svg.selectAll(".tick")
            .selectAll("line")
            .attr("stroke", "none")

        svg.selectAll("path.domain")
            .attr("stroke", "none")

        // Bars
        svg.selectAll("mybar")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", function (d) { return x(d[dimensionName].value); })
            .attr("y", function (d) { return y(d[measureName].value); })
            .attr("width", x.bandwidth())
            .attr("height", function (d) { return height - y(d[measureName].value); })
            .attr("fill", "#b3121f")
            .on('mouseover', function (d, i) {
                d3.select(this).transition()
                    .duration(50)
                    .style('opacity', 0.85);

                // Makes the new div appear on hover:
                div.transition()
                    .duration(50)
                    .style("display", "block");

                dimensionTooltip.html(`<span class="tooltip-dimension-label">${dimensionLabel}: </span><span class="tooltip-dimension-value">${d[dimensionName].value}</span>`)
                measureTooltip.html(`<span class="tooltip-dimension-label">${measureLabel}: </span><span class="tooltip-dimension-value">${numberWithCommas(d[measureName].value)}</span>`)

                div.style("left", ((d3.event.pageX + 10) > width - 35 ? width : d3.event.pageX + 10) + "px")
                    .style("top", ((d3.event.pageY) > height ? height : d3.event.pageY) + "px");
            })
            .on('mouseout', function (d, i) {
                d3.select(this).transition()
                    .duration(50)
                    .style('opacity', 1);

                div.transition()
                    .delay(250)
                    .style('display', "none");
            })

        // Throw some errors and exit if the shape of the data isn't what this chart needs
        if (queryResponse.fields.measures.length == 0) {
            this.addError({ title: "No Measures", message: "This chart requires measures." });
            return;
        }

        done()
    }
});
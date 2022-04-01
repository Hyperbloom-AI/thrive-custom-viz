import * as d3 from 'd3'

function numberWithCommas(x) {
    x = x.toFixed(0)
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

looker.plugins.visualizations.add({
    id: "hello_world",
    label: "Hello World",
    options: {
        font_size: {
            type: "string",
            label: "Font Size",
            values: [
                { "Large": "large" },
                { "Small": "small" }
            ],
            display: "radio",
            default: "large"
        }
    },
    // Set up the initial state of the visualization
    create: function (element, config) {

        // Insert a <style> tag with some styles we'll use later.
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
        </style>`

        
        // Clear any errors from previous updates
        this.clearErrors(queryResponse.fields);

        if (queryResponse.fields.measures.length == 0 || queryResponse.fields.dimensions.length == 0) {
            this.addError({ title: "No Measures or Dimensions", message: "This chart requires a measure and a dimension." });
            return;
        }

        console.log(queryResponse)

        var dimension = queryResponse.fields.dimensions[0]
        var measure = queryResponse.fields.measures[0]

        var dimensionName = dimension.name
        var dimensionLabel = dimension.label_short
        var measureName = measure.name
        var measureLabel = measure.label_short

        var margin = { top: 30, right: 60, bottom: 70, left: 80 },
            width = parentDiv.clientWidth - margin.left - margin.right,
            height = parentDiv.clientHeight - margin.top - margin.bottom;

        // append the svg object to the body of the page
        var svg = d3.select("div")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

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
            .style("font-family", "Roboto Mono")
            .style("font-weight", "700")
            .attr("fill", "#151313")
            .attr("font-size", "9.47368px");
        // Add Y axis
        var y = d3.scaleLinear()
            .domain([0, d3.max(data.map(function(d) { return d[measureName].value }))])
            .range([height, 0])

        let axisLeft = d3.axisLeft(y)
        axisLeft.ticks(3)

        svg.append("g")
            .call(axisLeft)
            .selectAll("text")
            .style("font-family", "Roboto Mono")
            .style("font-weight", "700")
            .attr("fill", "#151313")
            .attr("font-size", "11px");


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

                console.log(d3.event.pageY + 10 + " : " + height)

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
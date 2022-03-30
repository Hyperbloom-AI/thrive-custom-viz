import * as d3 from 'd3'

function numberWithCommas(x) {
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
        </style>
      `;
        // Create a container element to let us center the text.
    },
    // Render in response to the data or settings changing
    updateAsync: function (data, element, config, queryResponse, details, done) {

        var parentDiv = document.getElementById("vis");
        console.log(parentDiv)

        d3.select("div").html("");
        // Clear any errors from previous updates
        this.clearErrors(queryResponse.fields);

        console.log(queryResponse)

        if (queryResponse.fields.measures.length == 0 || queryResponse.fields.dimensions.length == 0) {
            this.addError({ title: "No Measures or Dimensions", message: "This chart requires a measure and a dimension." });
            return;
        }

        var dimension = queryResponse.fields.dimensions[0]
        var measure = queryResponse.fields.measures[0]

        var dimensionName = dimension.name
        var dimensionLabel = dimension.label
        var measureName = measure.name
        var measureLabel = measure.label

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

        // Parse the Data
            // X axis
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
                .domain([0, d3.max(data.map(function(d) { return d[measureName].value}))])
                .range([height, 0])

            let axisLeft = d3.axisLeft(y)
            axisLeft.ticks(3)

            svg.append("g")
                .call(axisLeft)
                .selectAll("text")
                .style("font-family", "Roboto Mono")
                .style("font-weight", "700")
                .attr("fill", "#151313")
                .attr("font-size", "13px");


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
                .attr("height", function (d) { console.log(y(d[measureName].value));return height - y(d[measureName].value); })
                .attr("fill", "#b3121f")

        // Throw some errors and exit if the shape of the data isn't what this chart needs
        if (queryResponse.fields.measures.length == 0) {
            this.addError({ title: "No Measures", message: "This chart requires measures." });
            return;
        }

        done()
    }
});
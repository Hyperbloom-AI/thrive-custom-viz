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
        document.getElementById("vis").innerHTML = ""
        // Clear any errors from previous updates
        this.clearErrors(queryResponse.fields);

        console.log(data)

        var margin = { top: 0, right: 60, bottom: 20, left: 200 },
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

            /*var x = d3.scaleBand()
                .range([0, width])
                .domain(data.map(function (d) { return d["dim_zi_intent_metrics.topic"].value }))
                .padding(0.2);*/

            var y = d3.scaleBand()
                .range([0, height])
                .domain(data.map(function (d) { return d["dim_zi_intent_metrics.topic"].value }))
                .padding(0.2);

            /*var y = d3.scaleLinear()
                .domain([0, d3.max(data.map(function(d) { return d["dim_zi_intent_metrics.provided_kpi"].value}))])
                .range([height, 0])*/

            var x = d3.scaleLinear()
                .domain([0, d3.max(data.map(function(d) { return d["dim_zi_intent_metrics.provided_kpi"].value}))])
                .range([0, width])

            /*svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x))
                .selectAll("text")
                .style("text-anchor", "end")
                .style("font-family", "Roboto Mono")
                .style("font-weight", "700")
                .attr("fill", "#151313")
                .attr("font-size", "9.47368px");*/

            // X Axis G element
            svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x))
                .selectAll("text")
                .style("text-anchor", "middle")
                .style("font-family", "Roboto Mono")
                .style("font-weight", "700")
                .attr("fill", "#151313")
                .attr("font-size", "9.5px");

            /*svg.append("g")
                .call(d3.axisLeft(y))
                .selectAll("text")
                .style("text-anchor", "end")
                .style("font-family", "Roboto Mono")
                .style("font-weight", "700")
                .attr("fill", "#151313")
                .attr("font-size", "9.5px");*/

            // Y Axis G element
            svg.append("g")
                .call(d3.axisLeft(y))
                .selectAll("text")
                .style("text-anchor", "end")
                .style("font-family", "Roboto Mono")
                .style("font-weight", "700")
                .attr("fill", "#151313")
                .attr("font-size", "9.5px");

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
                .attr("y", function (d) { return y(d["dim_zi_intent_metrics.topic"].value); })
                .attr("x", function (d) { return x(0); })
                .attr("height", y.bandwidth())
                .attr("width", function (d) { console.log(x(d["dim_zi_intent_metrics.provided_kpi"].value));return x(d["dim_zi_intent_metrics.provided_kpi"].value); })
                .attr("fill", "#b3121f")

            /*svg.selectAll("mybar")
                .data(data)
                .enter()
                .append("rect")
                .attr("x", function (d) { return x(d["dim_zi_intent_metrics.topic"].value); })
                .attr("y", function (d) { return y(d["dim_zi_intent_metrics.provided_kpi"].value); })
                .attr("width", x.bandwidth())
                .attr("height", function (d) { console.log(y(d["dim_zi_intent_metrics.provided_kpi"].value));return height - y(d["dim_zi_intent_metrics.provided_kpi"].value); })
                .attr("fill", "#b3121f")
            */

        // Throw some errors and exit if the shape of the data isn't what this chart needs
        if (queryResponse.fields.measures.length == 0) {
            this.addError({ title: "No Measures", message: "This chart requires measures." });
            return;
        }

        done()
    }
});
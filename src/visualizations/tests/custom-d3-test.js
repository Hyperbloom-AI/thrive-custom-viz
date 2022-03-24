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

            .hello-world-vis {
                /* Vertical centering */
                height: 100%;
                display: flex;
                flex-flow: row nowrap;
                justify-content: space-around;
                align-items: center;
                font: 47px/59px 'Roboto', sans-serif;
                padding: 20px;
            }
            .hello-world-vis > div {
                flex: 1 1 0;
                display: flex;
            }
            .centered-block {
              display: flex;
              justify-content: center
            }
            .centered-block > div {
              width: fit-content
            }
            .hello-world-vis > div > *:not(:last-child) {
                margin-bottom: 10px
            }
            .inner-block__title h2 {
                font: 16px/20px 'Roboto', sans-serif;
                font-weight: 400 !important;
                margin: 0;
            }

            .inner-block__value h3 {
                font: 47px/59px 'Roboto', sans-serif;
                font-weight: 400 !important;
                margin: 0;
            }

            .inner-block__subtitle h5 {
                font: 14px/20px 'Roboto Mono', monospace;
                font-weight: 400 !important;
                margin: 0;
                color: #898889;
            }
        </style>
      `;

        // Create a container element to let us center the text.
        var width = 500;
        var height = 500;

        //Create SVG element
        var svg = d3.select("body")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        //Create line element inside SVG
        svg.append("line")
            .attr("x1", 100)
            .attr("x2", 500)
            .attr("y1", 50)
            .attr("y2", 50)
            .attr("stroke", "black")
    },
    // Render in response to the data or settings changing
    updateAsync: function (data, element, config, queryResponse, details, done) {
        // Clear any errors from previous updates
        this.clearErrors(queryResponse.fields);

        // Throw some errors and exit if the shape of the data isn't what this chart needs
        if (queryResponse.fields.measures.length == 0) {
            this.addError({ title: "No Measures", message: "This chart requires measures." });
            return;
        }
    }
});
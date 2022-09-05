import * as d3 from 'd3'

function numberWithCommas(x) {
    x = x.toFixed(0)
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

looker.plugins.visualizations.add({
    id: "thrive_reusable_area_chart",
    label: "Area Chart",
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

        // Clear any errors from previous updates
        this.clearErrors(queryResponse.fields);

        if (queryResponse.fields.measures.length == 0 || queryResponse.fields.dimensions.length == 0) {
            this.addError({ title: "No Measures or Dimensions", message: "This chart requires a measure and a dimension." });
            return;
        }

        var dimension = queryResponse.fields.dimensions[0]
        var measures = queryResponse.fields.measures

        var dimensionName = dimension.name
        var dimensionLabel = dimension.label_short
        /*var measureName = measure.name
        var measureLabel = measure.label_short*/

        done()
    }
});
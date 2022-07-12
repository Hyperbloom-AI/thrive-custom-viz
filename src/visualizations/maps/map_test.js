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

        /*if (queryResponse.fields.measures.length == 0 || queryResponse.fields.dimensions.length == 0) {
            this.addError({ title: "No Measures or Dimensions", message: "This chart requires a measure and a dimension." });
            return;
        }*/

        console.log(data)

        //var dimension = queryResponse.fields.dimensions[0]
        //var measure = queryResponse.fields.measures[0]

        done()
    }
});
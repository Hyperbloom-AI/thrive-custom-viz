import * as d3 from 'd3'
import mapboxgl from 'mapbox-gl'

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

            .map-paginator__wrapper {
                margin-top: 20px;
                margin-bottom: 10px;
            }

            .map-paginator {
                color: #A1A1A1;
                font-family: 'Roboto', serif;
                font-size: 16px;
                line-height: 20px;
                padding: 10px 20px;
                background-color: white;
                border: none
            }
            
        </style>`;


        this.__mapStatesButton = document.createElement('button')
        this.__mapStatesButton.innerHTML = "States"
        this.__mapStatesButton.className = "map-paginator"
        this.__mapCBSAsButton = document.createElement('button')
        this.__mapCBSAsButton.innerHTML = "CBSAs"
        this.__mapCBSAsButton.className = "map-paginator"
        this.__mapZipCodesButton = document.createElement('button')
        this.__mapZipCodesButton.innerHTML = "Zip Codes"
        this.__mapZipCodesButton.className = "map-paginator"
        this.__mapBEsButton = document.createElement('button')
        this.__mapBEsButton.innerHTML = "Business Entities"
        this.__mapBEsButton.className = "map-paginator"

        this.__mapPaginatorWrapper = document.createElement('div')
        this.__mapPaginatorWrapper.className = "map-paginator__wrapper"

        this.__mapPaginatorWrapper.appendChild(this.__mapStatesButton)
        this.__mapPaginatorWrapper.appendChild(this.__mapCBSAsButton)
        this.__mapPaginatorWrapper.appendChild(this.__mapZipCodesButton)
        this.__mapPaginatorWrapper.appendChild(this.__mapBEsButton)

        element.appendChild(this.__mapPaginatorWrapper)

        this.__mapBox = document.createElement('div')
        this.__mapBox.style.height = 'calc(100% - 70px)'
        this.__mapBox.style.width = '100%'
        this.__mapBox.id = "map"

        element.appendChild(this.__mapBox)

        var link = document.createElement('link');
        link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.9.1/mapbox-gl.css';
        link.rel = 'stylesheet';

        document.head.appendChild(link);
    },
    // Render in response to the data or settings changing
    updateAsync: function (data, element, config, queryResponse, details, done) {

        var parentDiv = document.getElementById("vis");

        mapboxgl.accessToken = 'pk.eyJ1IjoiZHVuY2FuY2ZyYXNlciIsImEiOiJjbDRvbDlmZWQwMGdzM2ZxazZybTVkdDQ0In0.xL5_LBkos5tYRbLxR0tQRQ';
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/light-v10',
            center: [-98.5795, 39.8283],
            zoom: 4,
            projection: 'globe'
        });

        map.on('style.load', () => {
            map.setFog({
                color: 'rgb(186, 210, 235)', // Lower atmosphere
                'high-color': 'rgb(36, 92, 223)', // Upper atmosphere
                'horizon-blend': 0.02, // Atmosphere thickness (default 0.2 at low zooms)
                'space-color': 'rgb(11, 11, 25)', // Background color
                'star-intensity': 0.6 // Background star brightness (default 0.35 at low zoooms )
            }); // Set the default atmosphere style

            map.addSource('statesData', {
                type: 'vector',
                url: 'mapbox://mapbox.boundaries-adm1-v3'
            });

            console.log('Map styling complete')
        });

        
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
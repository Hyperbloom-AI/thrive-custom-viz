import mapboxgl from 'mapbox-gl'
//var mapData = require('./somefile.json')
import mapData from './mapbox-boundaries-adm1-v3_4.json';
import regeneratorRuntime from "regenerator-runtime";
import "core-js/stable";


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
              display: flex;
              flex-flow: column;
            }

            #vis {
              height: 100%;
              width: 100%;
              margin: 0
            }

            .map-paginator__wrapper {
                margin-top: 10px;
                margin-bottom: 10px;
                padding: 0px 10px;
            }

            .map-paginator {
                color: #A1A1A1;
                font-family: 'Roboto', serif;
                font-size: 14px;
                line-height: 18px;
                padding: 10px 20px;
                background-color: white;
                border: none;
                cursor: pointer;
                transition-duration: 500ms
            }

            .map-paginator.active {
                color: #000000;
                font-weight: 700;
                background-color: #EDEDED;
            }
            
        </style>`;

        const changeActive = (e) => {

            if(e.target.classList.contains("active")) {
                return null
            }

            const els = document.getElementsByClassName("map-paginator")
            for (let i = 0; i < els.length; i++) {
                if(els[i].classList.contains("active")) {
                    els[i].classList.remove("active")
                    e.target.classList.add("active")
                    return null
                }
            }
        }

        this.__mapStatesButton = document.createElement('button')
        this.__mapStatesButton.innerHTML = "States"
        this.__mapStatesButton.className = "map-paginator active"

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

        this.__mapStatesButton.addEventListener("click", changeActive)
        this.__mapCBSAsButton.addEventListener("click", changeActive)
        this.__mapZipCodesButton.addEventListener("click", changeActive)
        this.__mapBEsButton.addEventListener("click", changeActive)

        element.appendChild(this.__mapPaginatorWrapper)

        this.__mapBox = document.createElement('div')
        this.__mapBox.style.height = '100%'
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

        map.on('load', () => {
            createViz();
        });

        function getMax(arr) {
            const set = data.filter(row => arr.hasOwnProperty(row["dim_zi_company_entities.zi_c_hq_state"].value))
            let max = set.reduce((max, item) => max["dim_zi_company_entities.count"].value > item["dim_zi_company_entities.count"].value ? max : item);
            return max["dim_zi_company_entities.count"].value
        }

        function createViz() {
            const lookupData = filterLookupTable();

            function filterLookupTable(lookupTable) {
                const lookupData = {};
    
                const searchData = mapData.adm1.data.all
    
                Object.keys(searchData).forEach(function(key) {
                    const featureData = searchData[key]
                    if(featureData.iso_3166_1 === 'US') {
                        lookupData[featureData['name']] = featureData
                    }
                })
                return lookupData;
            }

            map.addSource('statesData', {
                type: 'vector',
                url: 'mapbox://mapbox.boundaries-adm1-v3'
            });

            const maxValue = getMax(lookupData)

            map.addLayer(
                {
                  id: 'states-join',
                  type: 'fill',
                  source: 'statesData',
                  'source-layer': 'boundaries_admin_1',
                  paint: {
                    'fill-color': [
                      'case',
                      ['!=', ['feature-state', 'companies'], null],
                      [
                        'interpolate',
                        ['linear'],
                        ['feature-state', 'companies'],
                        0,
                        'rgba(255,237,234,0.6)',
                        maxValue,
                        'rgba(179,18,31,0.6)'
                      ],
                      'rgba(255, 255, 255, 0)'
                    ]
                  }
                },
                'waterway-label'
              );

            function setStates() {
                for (let i = 0; i < data.length; i++) {
                    const row = data[i]
                    if(!lookupData.hasOwnProperty(row["dim_zi_company_entities.zi_c_hq_state"].value)) {
                        continue;
                    }
                    map.setFeatureState(
                        {
                            source: "statesData",
                            sourceLayer: 'boundaries_admin_1',
                            id: lookupData[row["dim_zi_company_entities.zi_c_hq_state"].value].feature_id
                        },
                        {
                            companies: row["dim_zi_company_entities.count"].value
                        }
                    )
                }
            }

            // Check if `statesData` source is loaded.
            function setAfterLoad(event) {
                if (event.sourceID !== 'statesData' && !event.isSourceLoaded) return;
                setStates();
                map.off('sourcedata', setAfterLoad);
            }
    
            // If `statesData` source is loaded, call `setStates()`.
            if (map.isSourceLoaded('statesData')) {
                setStates();
            } else {
                map.on('sourcedata', setAfterLoad);
            }
        }

  

        map.on('style.load', () => {
            map.setFog({
                color: 'rgb(186, 210, 235)', // Lower atmosphere
                'high-color': 'rgb(36, 92, 223)', // Upper atmosphere
                'horizon-blend': 0.02, // Atmosphere thickness (default 0.2 at low zooms)
                'space-color': 'rgb(11, 11, 25)', // Background color
                'star-intensity': 0.6 // Background star brightness (default 0.35 at low zoooms )
            }); // Set the default atmosphere style
        });

        
        // Clear any errors from previous updates
        this.clearErrors(queryResponse.fields);

        /*if (queryResponse.fields.measures.length == 0 || queryResponse.fields.dimensions.length == 0) {
            this.addError({ title: "No Measures or Dimensions", message: "This chart requires a measure and a dimension." });
            return;
        }*/

        console.log(queryResponse)

        //var dimension = queryResponse.fields.dimensions[0]
        //var measure = queryResponse.fields.measures[0]

        done()
    }
});
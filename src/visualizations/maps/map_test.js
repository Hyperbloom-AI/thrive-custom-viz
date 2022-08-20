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

            .legend-box {
                display: flex;
                flex-flow: row;
                position: absolute;
                background: rgba(255, 255, 255, 0.5);
                padding: 5px 20px 5px 10px;
                bottom: 35px;
                left: 10px
            }

            .legend-bar {
                height: 100px;
                width: 10px;
                background: linear-gradient(to top, rgba(255,237,234,0.8), rgba(179,18,31,0.8));
                border-radius: 3px;
            }

            .legend-right {
                display: flex;
                flex-flow: column;
                font-family: 'Roboto', sans-serif;
                padding-left: 5px;
                justify-content: space-between;
                font-size: 12px;

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

        const measureName = queryResponse.fields.measures[0].name
        const measureLabel = queryResponse.fields.measures[0].label_short

        mapboxgl.accessToken = 'pk.eyJ1IjoiZHVuY2FuY2ZyYXNlciIsImEiOiJjbDRvbDlmZWQwMGdzM2ZxazZybTVkdDQ0In0.xL5_LBkos5tYRbLxR0tQRQ';
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/light-v10',
            center: [-98.5795, 39.8283],
            zoom: 4,
            projection: 'globe'
        });

        let hoveredStateId = null; // Tracks hovered state and updates with popup

        map.addControl(new mapboxgl.NavigationControl());

        map.on('load', () => {
            createViz();
        });

        function getMax(arr) {
            const set = data.filter(row => arr.hasOwnProperty(row["dim_zi_company_entities.zi_c_hq_state"].value))
            let max = set.reduce((max, item) => max[measureName].value > item[measureName].value ? max : item);
            return max[measureName].value
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
                        1,
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

            map.addLayer({
                id: 'state-fills',
                type: 'fill',
                source: 'statesData',
                sourceLayer: 'boundaries_admin_1',
                'source-layer': 'boundaries_admin_1',
                layout: {},
                paint: {
                    'fill-opacity': [
                        'case',
                        ['==', ['feature-state', 'companies'], null], 0,
                        ['boolean', ['feature-state', 'hover'], false], 0.2,
                        0
                    ]
                }
            });

            map.on('mousemove', 'state-fills', (e) => {
                if (e.features.length > 0) {
                    if (hoveredStateId !== null) {
                        map.setFeatureState({ source: 'statesData', id: hoveredStateId, sourceLayer: 'boundaries_admin_1' }, { hover: false });
                    }
                    hoveredStateId = e.features[0].id;
                    map.setFeatureState(
                        { source: 'statesData', id: hoveredStateId, sourceLayer: 'boundaries_admin_1' },
                        { hover: true }
                    );
                }
            });
                 
            // When the mouse leaves the state-fill layer, update the feature state of the
            // previously hovered feature.
            map.on('mouseleave', 'state-fills', () => {
                if (hoveredStateId !== null) {
                    map.setFeatureState(
                        { source: 'statesData', id: hoveredStateId, sourceLayer: 'boundaries_admin_1' },
                        { hover: false }
                    );
                }
                hoveredStateId = null;
            });

            map.on('click', (e) => {
                // Set `bbox` as 5px reactangle area around clicked point.
                const bbox = [
                    [e.point.x, e.point.y],
                    [e.point.x, e.point.y]
                ];

                const selectedFeatures = map.queryRenderedFeatures(bbox, {
                    layers: ['states-join']
                });

                const fips = selectedFeatures.map(
                    (feature) => feature.properties.FIPS
                );

                const selectedFeatureFIPS = fips[0]

                map.setFilter('states-join', ['in', 'FIPS', ...fips]);

                console.log(selectedFeatures)
            });

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
                            companies: row[measureName].value
                        }
                    )
                }
            }

            function createLegend() {

                try {
                    const oldLegendBox = document.getElementById("mapboxLegend")
                    oldLegendBox.parentNode.removeChild(oldLegendBox)
                } catch {
                    console.log("Unable to remove old legend because there is no old legend.")
                }

                const legendBox = document.createElement("div")
                const legendLeft = document.createElement("div")
                const legendRight = document.createElement("div")
                const legendBar = document.createElement("div")
                const legendRightTop = document.createElement("div")
                const legendRightBottom = document.createElement("div")

                legendBox.className = "legend-box"
                legendLeft.className = "legend-left"
                legendRight.className = "legend-right"
                legendBar.className = "legend-bar"

                legendRightTop.innerHTML = numberWithCommas(maxValue)
                legendRightBottom.innerHTML = 1

                legendLeft.appendChild(legendBar)

                legendRight.appendChild(legendRightTop)
                legendRight.appendChild(legendRightBottom)

                legendBox.appendChild(legendLeft)
                legendBox.appendChild(legendRight)

                legendBox.id = "mapboxLegend"

                element.appendChild(legendBox)
            }

            createLegend()

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
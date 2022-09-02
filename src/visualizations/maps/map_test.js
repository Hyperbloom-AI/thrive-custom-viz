import mapboxgl from 'mapbox-gl';
import stateData from './mapbox-boundaries-adm1-v3_4.json';
import cbsaData from './mapbox-boundaries-sta1-v3_4.json';
import zipData from './mapbox-boundaries-pos4-v3_4.json';
import regeneratorRuntime from "regenerator-runtime";
import "core-js/stable";

if (mapboxgl.version.indexOf('2.9.') === 0) Object.defineProperty(window, 'caches', { value: undefined });

function numberWithCommas(x) {
    if(!x) {
        return undefined;
    }
    x = x.toFixed(0);
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
};

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
                bottom: 10px;
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

            .popup-inner {
                padding: 10px 20px 15px 20px;
            }

            .popup-title {
                font: 20px/25px 'Roboto', sans-serif;
            }

            .descriptor {
                font: 10px/9px 'Roboto', sans-serif;
                text-transform: uppercase;
                color: #727171;
            }

            .number {
                font: 20px/25px 'Roboto', sans-serif;
            }

            h2, h4 {
                margin: 0
            }

            .popup-title__wrapper {
                margin-bottom: 17px;
            }

            .descriptor__wrapper {
                margin-bottom: 13.2px;
                padding-bottom: 9px;
                border-bottom: 1px solid #eaeaea;
                min-width: 200px;
                width: 100%;
            }

            .mapboxgl-popup-content {
                border-radius: 0px !important;
            }

            .mapboxgl-ctrl-bottom-right, .mapboxgl-ctrl-bottom-left {
                display: none
            }

            .selected-locales__wrapper {
                position: absolute;
                bottom: 10px;
                right: 10px;
                z-index: 10;
            }

            .selected-locale {
                background-color: black;
                color: white;
                font: 14px/20px 'Roboto', sans-serif;
                padding: 12px 20px;
                border-radius: 30px;
                display: flex;
                align-items: center;
            }

            .selected-locale__more {
                background-color: #E8E7E7;
                color: #151313;
                border: 1px solid #000000;
                padding: 12px;
                font: 14px/20px 'Roboto', sans-serif;
                border-radius: 30px;
            }

            #selectedLocaleContainer {
                display: flex;
                flex-flow: row nowrap;
            }

            .selected-locale:not(:last-child) {
                margin-right: 5px;
            }

            .remove-icon {
                margin-left: 25px;
                cursor: pointer;
            }

            .selected-locale > div {
                display: flex;
            }
        </style>`;

        this.__currentLayer = "states-join";
        this.__LAYERNAMES = ["states-join"];

        // Create the top layer selector bar
        //###################################################################################//

        this.__mapStatesButton = document.createElement('button');
        this.__mapStatesButton.innerHTML = "States";
        this.__mapStatesButton.className = "map-paginator active";
        this.__mapStatesButton.id = "states-join";

        this.__mapCBSAsButton = document.createElement('button');
        this.__mapCBSAsButton.innerHTML = "CBSAs";
        this.__mapCBSAsButton.className = "map-paginator";
        this.__mapCBSAsButton.id = "cbsas-join";

        this.__mapZipCodesButton = document.createElement('button');
        this.__mapZipCodesButton.innerHTML = "Zip Codes";
        this.__mapZipCodesButton.className = "map-paginator";
        this.__mapZipCodesButton.id = "zip-codes-join";

        this.__mapBEsButton = document.createElement('button');
        this.__mapBEsButton.innerHTML = "Business Entities";
        this.__mapBEsButton.className = "map-paginator";
        this.__mapBEsButton.id = "business-entities-join";

        this.__mapPaginatorWrapper = document.createElement('div');
        this.__mapPaginatorWrapper.className = "map-paginator__wrapper";

        this.__mapPaginatorWrapper.appendChild(this.__mapStatesButton);
        this.__mapPaginatorWrapper.appendChild(this.__mapCBSAsButton);
        this.__mapPaginatorWrapper.appendChild(this.__mapZipCodesButton);
        this.__mapPaginatorWrapper.appendChild(this.__mapBEsButton);

        element.appendChild(this.__mapPaginatorWrapper);

        this.__selectedLocalesWrapper = document.createElement('div');
        this.__selectedLocalesWrapper.className = "selected-locales__wrapper";
        element.appendChild(this.__selectedLocalesWrapper);

        //###################################################################################//

        this.__mapBox = document.createElement('div');
        this.__mapBox.style.height = '100%';
        this.__mapBox.style.width = '100%';
        this.__mapBox.id = "map";

        element.appendChild(this.__mapBox);

        var link = document.createElement('link');
        link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.9.1/mapbox-gl.css';
        link.rel = 'stylesheet';

        var script = document.createElement('script');
        script.src = 'https://kit.fontawesome.com/f2060bf509.js';
        script.crossOrigin = "anonymous";

        document.head.appendChild(link);
        document.head.appendChild(script);
    },
    // Render in response to the data or settings changing
    updateAsync: function (data, element, config, queryResponse, details, done) {

        let visualization = this

        const measureName = queryResponse.fields.measures[0].name;
        const measureLabel = queryResponse.fields.measures[0].label_short;
        const localesWrapper = this.__selectedLocalesWrapper

        mapboxgl.accessToken = 'pk.eyJ1IjoiZHVuY2FuY2ZyYXNlciIsImEiOiJjbDRvbDlmZWQwMGdzM2ZxazZybTVkdDQ0In0.xL5_LBkos5tYRbLxR0tQRQ';
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/light-v10',
            center: [-98.5795, 39.8283],
            zoom: 4,
            projection: 'globe'
        });

        let hoveredStateId = null; // Tracks hovered state and updates with popup
        let filteredStateNames = [];

        map.addControl(new mapboxgl.NavigationControl());
        map.addControl(new mapboxgl.FullscreenControl());

        map.on('load', () => {
            createStatesViz();
        });

        map.on('idle', () => {
            this.__mapStatesButton.addEventListener("click", changeActive);
            this.__mapCBSAsButton.addEventListener("click", changeActive);
            this.__mapZipCodesButton.addEventListener("click", changeActive);
            this.__mapBEsButton.addEventListener("click", changeActive);
        })

        const changeActive = (e) => {
            /* For reference, e.target is one of the buttons on top of the map. 
            The event listeners are added in a map.on('idle', () => {}) but have
            previously been added in map.on('load', () => {}) to the same effect*/
            if(!e.target.classList.contains("active")) {
                // Updates the nav-bar active status
                const els = document.getElementsByClassName("map-paginator");
                for (let i = 0; i < els.length; i++) {
                    if(els[i].classList.contains("active")) {
                        els[i].classList.remove("active");
                    };
                };

                e.target.classList.add("active");

                // Updates the layers' active status
                for (let j = 0; j < this.__LAYERNAMES.length; j++) {
                    if(this.__LAYERNAMES[j] !== e.target.id) {
                        map.setLayoutProperty(this.__LAYERNAMES[j], 'visibility', 'none');
                        map.setLayoutProperty("states-join", 'visibility', 'none'); // Does the same as the line above, present for debug.
                    };
                };

                if(this.__LAYERNAMES.includes(e.target.id)) {
                    map.setLayoutProperty(e.target.id, 'visibility', 'visible');
                }

                console.log("DEBUG: GETTING LAYER VISIBILITY")
                const visibility = map.getLayoutProperty("states-join",'visibility');
                console.log(visibility)
            }
        }

        function getMaxState(arr) {
            const set = data.filter(row => arr.hasOwnProperty(row["dim_zi_company_entities.zi_c_hq_state"].value));
            let max = set.reduce((max, item) => max[measureName].value > item[measureName].value ? max : item);
            return max[measureName].value
        }

        function createStatesViz() {
            const lookupData = filterLookupTable();

            function filterLookupTable(lookupTable) {
                const lookupData = {};
    
                const searchData = stateData.adm1.data.all
    
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

            const maxValue = getMaxState(lookupData)

            map.addLayer({
                id: 'states-join',
                type: 'fill',
                source: 'statesData',
                'layout': {
                    // Make the layer visible by default.
                    'visibility': 'visible'
                },
                'source-layer': 'boundaries_admin_1',
                paint: {
                    'fill-color': [
                        // In the case that 'feature-state': 'requestedKPI' is not null, interpolate the colors between the min and max, if it is null make the layer white.
                        'case',
                        ['!=', ['feature-state', 'requestedKPI'], null], ['interpolate', ['linear'], ['feature-state', 'requestedKPI'], 1, 'rgba(255,237,234,0.6)', maxValue, 'rgba(179,18,31,0.6)'],
                        'rgba(255, 255, 255, 0)'
                    ]
                }
            }, 'waterway-label');

            const popup = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false,
                className: 'gtm-map-popup',
                maxWidth: '300px'
            });


            map.on('mousemove', 'states-join', (e) => {
                if (e.features.length > 0) {

                    const realCoords = [e.lngLat.lng, e.lngLat.lat]
                    const reqKPI = e.features[0].state.requestedKPI;
                    const state = e.features[0].state.name

                    const description = `
                    <div class="popup-inner">
                        <div class="popup-inner__vertical">
                            <div class="popup-title__wrapper">
                                <h2 class="popup-title">${state}</h2>
                            </div>
                            <div class="popup-inner__horizontal">
                                <div class="popup-inner__horizontal-inner__vertical">
                                    <div class="descriptor__wrapper">
                                        <h4 class="descriptor">${measureLabel}</h4>
                                    </div>
                                    <div class="number__wrapper">
                                        <h4 class="number">${numberWithCommas(reqKPI)}</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`

                    if(e.features[0].state.requestedKPI) {
                        popup.setLngLat(realCoords).setHTML(description).addTo(map);
                    } else {
                        popup.remove
                    }

                    if (hoveredStateId !== null) {
                        map.setFeatureState(
                            { source: 'statesData', id: hoveredStateId, sourceLayer: 'boundaries_admin_1' }, 
                            { hover: false }
                        );
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
            map.on('mouseleave', 'states-join', () => {
                if (hoveredStateId !== null) {
                    map.setFeatureState(
                        { source: 'statesData', id: hoveredStateId, sourceLayer: 'boundaries_admin_1' },
                        { hover: false }
                    );
                    popup.remove();
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

                const name = selectedFeatures.map(
                    (feature) => feature.state.name
                );

                const selectedFeatureName = name[0]

                if(!lookupData.hasOwnProperty(selectedFeatureName) || filteredStateNames.includes(selectedFeatureName)) {
                    return;
                }

                filteredStateNames.push(selectedFeatureName)
                runSelectionUpdate(localesWrapper);
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
                            requestedKPI: row[measureName].value,
                            fipsCode: lookupData[row["dim_zi_company_entities.zi_c_hq_state"].value].unit_code,
                            name: lookupData[row["dim_zi_company_entities.zi_c_hq_state"].value].name,
                            hovered: false
                        }
                    )
                }
            }

            function runSelectionUpdate(element) {
                const prevParent = document.getElementById("selectedLocaleContainer");
                if(prevParent) {
                    element.removeChild(prevParent)
                };

                const parent = document.createElement("div");
                parent.id = "selectedLocaleContainer";

                for(let i = 0; i < filteredStateNames.length; i++) {
                    if(i > 1) {
                        const moreWrapper = document.createElement("div")
                        moreWrapper.className = "selected-locale__more"
                        const moreText = document.createElement("span")
                        moreText.innerHTML = `+${filteredStateNames.length - 2} more locales`;
                        moreWrapper.appendChild(moreText)
                        parent.appendChild(moreWrapper)
                        break;
                    }
                    const selectedLocale = document.createElement("div")
                    const selectedLocaleText = document.createElement("span")
                    const removeButton = document.createElement('div')
                    removeButton.innerHTML = '<i class="fa-solid fa-xmark remove-icon" aria-hidden="true"></i>';

                    removeButton.addEventListener("click", () => {
                        filteredStateNames.splice(i, 1)
                        runSelectionUpdate(element)
                    })

                    selectedLocaleText.innerHTML = filteredStateNames[i]
                    selectedLocale.className = "selected-locale"

                    selectedLocale.appendChild(selectedLocaleText)
                    selectedLocale.appendChild(removeButton)
                    parent.appendChild(selectedLocale)
                }

                console.log("ABOUT TO TRIGGER FILTER")
                console.log(visualization)

                visualization.trigger("filter", [{
                    field: "dim_zi_company_entities.zi_c_hq_state", // the name of the field to filter
                    value: filteredStateNames.join(","), // the "advanced syntax" for the filter
                    run: true, // whether to re-run the query with the new filter
                }]);
                
                element.appendChild(parent)
            };

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

        function createCBSAsViz() {
            const lookupData = filterLookupTable();

            function filterLookupTable(lookupTable) {
                const lookupData = {};
    
                const searchData = cbsaData.sta1.data.all
    
                Object.keys(searchData).forEach(function(key) {
                    const featureData = searchData[key]
                    if(featureData.iso_3166_1 === 'US') {
                        lookupData[featureData['name']] = featureData
                    }
                })
                return lookupData;
            }

            map.addSource('cbsaData', {
                type: 'vector',
                url: 'mapbox://mapbox.boundaries-sta1-v3'
            });

            const maxValue = getMax(lookupData)

            map.addLayer({
                id: 'cbsas-join',
                type: 'fill',
                source: 'cbsaData',
                'layout': {
                    // Make the layer visible by default.
                    'visibility': 'visible'
                },
                'source-layer': 'boundaries_stats_1',
                paint: {
                    'fill-color': [
                        // In the case that 'feature-state': 'requestedKPI' is not null, interpolate the colors between the min and max, if it is null make the layer white.
                        'case',
                        ['!=', ['feature-state', 'requestedKPI'], null], ['interpolate', ['linear'], ['feature-state', 'requestedKPI'], 1, 'rgba(255,237,234,0.6)', maxValue, 'rgba(179,18,31,0.6)'],
                        'rgba(255, 255, 255, 0)'
                    ]
                }
            }, 'waterway-label');

            const popup = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false,
                className: 'gtm-map-popup',
                maxWidth: '300px'
            });


            map.on('mousemove', 'cbsas-join', (e) => {
                if (e.features.length > 0) {

                    const realCoords = [e.lngLat.lng, e.lngLat.lat]
                    const reqKPI = e.features[0].state.requestedKPI;
                    const cbsa = e.features[0].state.name

                    const description = `
                    <div class="popup-inner">
                        <div class="popup-inner__vertical">
                            <div class="popup-title__wrapper">
                                <h2 class="popup-title">${scbsa}</h2>
                            </div>
                            <div class="popup-inner__horizontal">
                                <div class="popup-inner__horizontal-inner__vertical">
                                    <div class="descriptor__wrapper">
                                        <h4 class="descriptor">${measureLabel}</h4>
                                    </div>
                                    <div class="number__wrapper">
                                        <h4 class="number">${numberWithCommas(reqKPI)}</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`

                    if(e.features[0].state.requestedKPI) {
                        popup.setLngLat(realCoords).setHTML(description).addTo(map);
                    } else {
                        popup.remove
                    }

                    if (hoveredStateId !== null) {
                        map.setFeatureState(
                            { source: 'cbsaData', id: hoveredStateId, sourceLayer: 'boundaries_stats_1' }, 
                            { hover: false }
                        );
                    }
                    hoveredStateId = e.features[0].id;
                    map.setFeatureState(
                        { source: 'cbsaData', id: hoveredStateId, sourceLayer: 'boundaries_stats_1' },
                        { hover: true }
                    );
                }
            });
                 
            // When the mouse leaves the state-fill layer, update the feature state of the
            // previously hovered feature.
            map.on('mouseleave', 'cbsas-join', () => {
                if (hoveredStateId !== null) {
                    map.setFeatureState(
                        { source: 'cbsaData', id: hoveredStateId, sourceLayer: 'boundaries_stats_1' },
                        { hover: false }
                    );
                    popup.remove();
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
                    layers: ['cbsas-join']
                });

                const name = selectedFeatures.map(
                    (feature) => feature.state.name
                );

                const selectedFeatureName = name[0]

                if(!lookupData.hasOwnProperty(selectedFeatureName)) {
                    return;
                }

                //map.setFilter('states-join', ['in', 'id', ...id]);

                filteredStateNames.push(selectedFeatureName)
            });

            function setStates() {
                for (let i = 0; i < data.length; i++) {
                    const row = data[i]
                    if(!lookupData.hasOwnProperty(row["dim_zi_company_entities.zi_c_hq_state"].value)) {
                        continue;
                    }
                    map.setFeatureState(
                        {
                            source: "cbsaData",
                            sourceLayer: 'boundaries_stats_1',
                            id: lookupData[row["dim_zi_company_entities.zi_c_hq_state"].value].feature_id
                        },
                        {
                            requestedKPI: row[measureName].value,
                            name: lookupData[row["dim_zi_company_entities.zi_c_hq_state"].value].name,
                            hovered: false
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
                if (event.sourceID !== 'cbsaData' && !event.isSourceLoaded) return;
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

        if (queryResponse.fields.measures.length == 0 || queryResponse.fields.dimensions.length == 0) {
            this.addError({ title: "No Measures or Dimensions", message: "This chart requires a measure and a dimension." });
            return;
        }

        //console.log("query response")
        //console.log(queryResponse)

        done()
    }
});
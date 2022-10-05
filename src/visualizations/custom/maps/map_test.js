import mapboxgl from 'mapbox-gl';
import stateData from './mapbox-boundaries-adm1-v3_4.json';
import cbsaData from './mapbox-boundaries-sta2-v3_4.json';
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
    id: "thrive_custom_special_granularity_map",
    label: "Custom Layered Mapbox Map",
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
        this.__LAYERNAMES = [
            {
                name: "states-join",
                groupingName: "State"
            }, 
            {
                name: "cbsas-join",
                groupingName: "CBSA"
            },
            {
               name: "zips-join",
               groupingName: "Zipcode"
            }
        ];

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
        this.__mapZipCodesButton.id = "zips-join";

        this.__mapPaginatorWrapper = document.createElement('div');
        this.__mapPaginatorWrapper.className = "map-paginator__wrapper";

        this.__mapPaginatorWrapper.appendChild(this.__mapStatesButton);
        this.__mapPaginatorWrapper.appendChild(this.__mapCBSAsButton);
        this.__mapPaginatorWrapper.appendChild(this.__mapZipCodesButton);

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

        mapboxgl.accessToken = 'pk.eyJ1IjoiZHVuY2FuY2ZyYXNlciIsImEiOiJjbDRvbDlmZWQwMGdzM2ZxazZybTVkdDQ0In0.xL5_LBkos5tYRbLxR0tQRQ';
        this.__map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/light-v10',
            center: [-98.5795, 39.8283],
            zoom: 4,
            projection: 'globe'
        });

        this.__map.addControl(new mapboxgl.NavigationControl());
        this.__map.addControl(new mapboxgl.FullscreenControl());

        this.__map.on('load', () => {
            this.__map.addSource('statesData', {
                type: 'vector',
                url: 'mapbox://mapbox.boundaries-adm1-v3'
            }).addSource('cbsaData', {
                type: 'vector',
                url: 'mapbox://mapbox.boundaries-sta2-v3'
            }).addSource('zipData', {
                type: 'vector',
                url: 'mapbox://mapbox.boundaries-pos4-v3'
            });
        });


        var link = document.createElement('link');
        link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.9.1/mapbox-gl.css';
        link.rel = 'stylesheet';

        var script = document.createElement('script');
        script.src = 'https://kit.fontawesome.com/f2060bf509.js';
        script.crossOrigin = "anonymous";

        document.head.appendChild(link);
        document.head.appendChild(script);

        //console.timeLog("createRuntime")
        console.timeEnd("createRuntime")
    },
    /* Render in response to the data or settings changing
    Params:
        @param data: array of returned data with fields
        @param element: HTML DOM element where the vis is stored
        @param config: Settings object on the tile where the vis is located
        @param queryResponse: Entire response to query, includes data object and config object
        @param details: ?
        @param done: function to call to tell Looker you've finished rendering
    */
    updateAsync: function (data, element, config, queryResponse, details, done) {
        /* Pass a message to the GTM Frontend to send a locale filter to looker
        Params:
            @param locales: object containing all filtered locales at different levels of granularity
        */
        const throwMessage = (locales) => window.parent.parent.postMessage({ message: "crossFilterLocale", value: locales }, "*")
        /* Pass a message to the GTM Frontend to send a granularity grouping filter to looker
        Params:
            @param g: string representing new grouping to filter to
        */
        const changeGranularity = (g) => window.parent.parent.postMessage({ message: "changeGranularity", value: g }, "*")

        // Because `this` does not work properly in functions (`this` goes local), move the map to a more usable variable
        let mapgl = this.__map
        // Find name of measure, as measure is requested KPI, which is dynamic, returns String
        const measureName = queryResponse.fields.measures[0].name;
        // Find label of measure, as measure is requested KPI, which is dynamic. This prints to UI, returns String
        const measureLabel = queryResponse.fields.measures[0].label_short;
        // Move HTML DOM element from `this` to permanent variable, returns HTML DOM element
        const localesWrapper = this.__selectedLocalesWrapper
        // Move Object from `this` to permanent variable, returns Object
        const thisLayerNames = this.__LAYERNAMES
        // Tracks feature currently being hovered, DEV NOTE: To increase conciseness this could be altered to `hoveredFeatureId`, set to null
        let hoveredStateId = null; // Tracks hovered state and updates with popup
        // The object responsible for capturing selected features, DEV NOTE: To increase conciseness this could be altered to `selectedFeatureNames`, set to object of empty arrays
        let filteredStateNames = {
            "states-join": [],
            "cbsas-join": [],
            "zips-join": []
        };

        /* Creates legend for the map
        Params:
            @param data: contains current data object at runtime
            @param fieldName: holds the current grouping
            @param max: the maximum value currently represented on the map
        */
        const createLegend = (data, fieldName, max) => {
            // If the grouping is null, return. This keeps the legend in line with the active layer
            if(determineNull(data, fieldName)) return;

            // If there is an old legend, remove it before creating the new one.
            const oldLegendBox = document.getElementById("mapboxLegend")
            if(oldLegendBox) oldLegendBox.parentNode.removeChild(oldLegendBox)

            // Create the elements necessary to construct the legend, all below elements should return HTML DOM nodes
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

            legendRightTop.innerHTML = numberWithCommas(max)
            legendRightBottom.innerHTML = 1

            legendLeft.appendChild(legendBar)

            legendRight.appendChild(legendRightTop)
            legendRight.appendChild(legendRightBottom)

            legendBox.appendChild(legendLeft)
            legendBox.appendChild(legendRight)

            legendBox.id = "mapboxLegend"

            element.appendChild(legendBox)
        }

        async function runSelectionUpdate(element, selectedLayer) {
            const prevParent = document.getElementById("selectedLocaleContainer");
            if(prevParent) {
                element.removeChild(prevParent)
            };

            const parent = document.createElement("div");
            parent.id = "selectedLocaleContainer";

            const prevalues = (Object.values(filteredStateNames)).map(element => element)
            const values = [].concat.apply([], prevalues)
            const count = values.length

            const moreWrapper = document.createElement("div")

            if(count > 3) {
                moreWrapper.className = "selected-locale__more"
                const moreText = document.createElement("span")
                moreText.innerHTML = `+${count - 2} more locales`;
                moreWrapper.appendChild(moreText)
            }

            let totalCount = 0
            Object.keys(filteredStateNames).forEach((layer) => {
                filteredStateNames[layer].forEach((feature, index) => {
                    totalCount++;
                    if(totalCount > 2 && count > 3) {
                        console.debug("Nothing")
                    } else {
                        const selectedLocale = document.createElement("div")
                        const selectedLocaleText = document.createElement("span")
                        const removeButton = document.createElement('div')
                        removeButton.innerHTML = '<i class="fa-solid fa-xmark remove-icon" aria-hidden="true"></i>';

                        removeButton.addEventListener("click", () => {
                            filteredStateNames[layer].splice(index, 1)
                            throwMessage(filteredStateNames)
                            runSelectionUpdate(element, selectedLayer)
                        })

                        selectedLocaleText.innerHTML = feature
                        selectedLocale.className = "selected-locale"

                        selectedLocale.appendChild(selectedLocaleText)
                        selectedLocale.appendChild(removeButton)
                        parent.appendChild(selectedLocale)
                    }
                })
            })

            parent.appendChild(moreWrapper)
            element.appendChild(parent)
        };

        /* Params:
            @param e: mapBox click event
            @param layerName: map layer from which mapBox click event originated
            @param lookupData: object containing feature data
            @param localesWrapper: HTML DOM element where pucks are located
            @param replaceCommas: *optional* flag to replace commas in selected features Name
        */
        function hostClickEvent(e, layerName, lookupData, localesWrapper, replaceCommas) {
            // bbox represents the point on the map that was just clicked, returned in the form of longLat
            const bbox = [[e.point.x, e.point.y], [e.point.x, e.point.y]];
            // selectedFeatures represents the features available at the point `bbox`, returns [featureA, featureB, etc...]
            const selectedFeatures = mapgl.queryRenderedFeatures(bbox, {layers: [layerName]});
            // line below maps `name` properties from selectedFeatures above, returns [nameA, nameB, etc...]
            const names = selectedFeatures.map((feature) => feature.state.name);
            // Line below gets the first name (name of closest feature to bbox), returns string or undefined
            var selectedFeatureName = names[0]

            // When selectedFeatureName is undefined, does not execute
            if(selectedFeatureName) {
                // If optional parameter `replaceCommas` is true, attempts to replace commas, upon failing executes console.warn
                if(replaceCommas) {
                    try {
                        // Replace Commas (particularly in CBSAs for comparison), returns string [no undefined]
                        selectedFeatureName = selectedFeatureName.replace(",", "")
                    } catch (error) {
                        // Warns when replace fails, NOTE: may be able to remove
                        console.warn("Could not replace null selection: " + selectedFeatureName)
                    }
                }
    
                /* When the selectedFeatureName is not a property of lookupData or the 
                selectedFeatureName is already included in `filteredStateNames[layerName]` then early return */
                if(!lookupData.hasOwnProperty(selectedFeatureName) || filteredStateNames[layerName].includes(selectedFeatureName)) return;
    
                /* Push the selectedFeatureName into the proper category of `filteredStateNames[layerName]`, 
                inline and returns {layerNameA: [featureA, featureB, etc...], layerNameB: [featureA, featureB, etc...]} , etc... */
                filteredStateNames[layerName].push(selectedFeatureName)
                // Updates the pucks that show feature selection bottom-right of the map, returns null
                runSelectionUpdate(localesWrapper, layerName);
    
                // If the ctrl key is not selected, send data for filter update
                if(!e.originalEvent.ctrlKey) {
                    // Send data to GTM Frontend for a looker data refresh, returns null
                    throwMessage(filteredStateNames)
                    const layers = Object.keys(filteredStateNames)
                    const nextLayerName = layers[layers.findIndex((element) => element === layerName) + 1]
                    if(nextLayerName) {
                        const nextLayerGrouping = thisLayerNames[thisLayerNames.findIndex((element) => {console.log("nln", nextLayerName); console.log("element", element.name); return element.name === nextLayerName})].groupingName
                        autoChangeActive(nextLayerName)
                        changeGranularity(nextLayerGrouping)
                    }
                }
            }
        }

        mapgl.on('load', () => {
            createStatesViz();
            createCBSAsViz();
            createZipsViz();
        });

        mapgl.on('idle', () => {
            this.__mapStatesButton.addEventListener("click", changeActive);
            this.__mapCBSAsButton.addEventListener("click", changeActive);
            this.__mapZipCodesButton.addEventListener("click", changeActive);
        })

        const autoChangeActive = (layer) => {
            /* For reference, e.target is one of the buttons on top of the map. 
            The event listeners are added in a map.on('idle', () => {}) but have
            previously been added in map.on('load', () => {}) to the same effect*/
            const els = document.getElementsByClassName("map-paginator");
            for (let i = 0; i < els.length; i++) {
                if(els[i].classList.contains("active")) {
                    els[i].classList.remove("active");
                };

                if(els[i].id === layer) els[i].classList.add("active")
            };

            for (let j = 0; j < this.__LAYERNAMES.length; j++) {
                if(this.__LAYERNAMES[j].name !== layer) {
                    mapgl.setLayoutProperty(this.__LAYERNAMES[j].name, 'visibility', 'none');
                };
            };

            const filteredDown = this.__LAYERNAMES.filter(item => item.name === layer)
            if(filteredDown.length > 0) mapgl.setLayoutProperty(layer, 'visibility', 'visible');
        }

        const changeActive = (e) => {
            /* For reference, e.target is one of the buttons on top of the map. 
            The event listeners are added in a map.on('idle', () => {}) but have
            previously been added in map.on('load', () => {}) to the same effect*/

            //e.preventDefault();
            //e.stopPropagation();

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
                    if(this.__LAYERNAMES[j].name !== e.target.id) {
                        mapgl.setLayoutProperty(this.__LAYERNAMES[j].name, 'visibility', 'none');
                    };
                };

                const filteredDown = this.__LAYERNAMES.filter(item => item.name === e.target.id)

                if(filteredDown.length > 0) {
                    mapgl.setLayoutProperty(e.target.id, 'visibility', 'visible');
                    changeGranularity(filteredDown[0].groupingName)
                }

            }
        }

        function getMaxState(arr) {
            const set = data.filter(row => arr.hasOwnProperty(row["dim_zi_map_vis.state"].value));
            try {
                let max = set.reduce((max, item) => max[measureName].value > item[measureName].value ? max : item);
                return max[measureName].value
            } catch {
                return 2
            }
        }

        function getMaxCBSA(arr) {
            const set = data.filter(row => arr.hasOwnProperty(row["dim_zi_map_vis.cbsa"].value));
            try {
                let max = set.reduce((max, item) => max[measureName].value > item[measureName].value ? max : item);
                return max[measureName].value
            } catch {
                return 2
            }
        }

        function getMaxZip(arr) {
            const set = data.filter(row => arr.hasOwnProperty(row["dim_zi_map_vis.zip"].value));
            try {
                let max = set.reduce((max, item) => max[measureName].value > item[measureName].value ? max : item);
                return max[measureName].value
            } catch {
                return 2
            }
        }

        function determineNull(arr, prop) {
            return arr.every(row => row[prop].value === null);
        }

        function createStatesViz() {
            const lookupData = filterLookupTable();

            function filterLookupTable() {
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

            const maxValue = getMaxState(lookupData)

            mapgl.addLayer({
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


            mapgl.on('mousemove', 'states-join', (e) => {
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
                        popup.setLngLat(realCoords).setHTML(description).addTo(mapgl);
                    } else {
                        popup.remove;
                        return;
                    }

                    if (hoveredStateId !== null) {
                        mapgl.setFeatureState(
                            { source: 'statesData', id: hoveredStateId, sourceLayer: 'boundaries_admin_1' }, 
                            { hover: false }
                        );
                    }
                    hoveredStateId = e.features[0].id;
                    mapgl.setFeatureState(
                        { source: 'statesData', id: hoveredStateId, sourceLayer: 'boundaries_admin_1' },
                        { hover: true }
                    );
                }
            });
                 
            // When the mouse leaves the state-fill layer, update the feature state of the
            // previously hovered feature.
            mapgl.on('mouseleave', 'states-join', () => {
                if (hoveredStateId !== null) {
                    mapgl.setFeatureState(
                        { source: 'statesData', id: hoveredStateId, sourceLayer: 'boundaries_admin_1' },
                        { hover: false }
                    );
                    popup.remove();
                }
                hoveredStateId = null;
            });

            mapgl.on('click', 'states-join', (e) => hostClickEvent(e, 'states-join', lookupData, localesWrapper));

            function setStates() {
                for (let i = 0; i < data.length; i++) {
                    const row = data[i]
                    if(!lookupData.hasOwnProperty(row["dim_zi_map_vis.state"].value)) {
                        continue;
                    }
                    mapgl.setFeatureState(
                        {
                            source: "statesData",
                            sourceLayer: 'boundaries_admin_1',
                            id: lookupData[row["dim_zi_map_vis.state"].value].feature_id
                        },
                        {
                            requestedKPI: row[measureName].value,
                            fipsCode: lookupData[row["dim_zi_map_vis.state"].value].unit_code,
                            name: lookupData[row["dim_zi_map_vis.state"].value].name,
                            hovered: false
                        }
                    )
                }
            }

            createLegend(data, "dim_zi_map_vis.state", maxValue)

            // Check if `statesData` source is loaded.
            function setAfterLoadStates(event) {
                if (event.sourceID !== 'statesData' && !event.isSourceLoaded) return;
                setStates();
                mapgl.off('sourcedata', setAfterLoadStates);
            }
    
            // If `statesData` source is loaded, call `setStates()`.
            if (mapgl.isSourceLoaded('statesData')) {
                setStates();
            } else {
                mapgl.on('sourcedata', setAfterLoadStates);
            }
        }


        function createCBSAsViz() {
            const lookupData = filterLookupTable();

            function filterLookupTable() {
                const lookupData = {};
    
                const searchData = cbsaData.sta2.data.all
    
                Object.keys(searchData).forEach(function(key) {
                    const featureData = searchData[key]
                    if(featureData.iso_3166_1 === 'US') {
                        lookupData[featureData['name'].replace(",", "")] = featureData
                    }
                })
                return lookupData;
            }



            const maxValue = getMaxCBSA(lookupData)

            mapgl.addLayer({
                id: 'cbsas-join',
                type: 'fill',
                source: 'cbsaData',
                'layout': {
                    // Make the layer visible by default.
                    'visibility': 'visible'
                },
                'source-layer': 'boundaries_stats_2',
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


            mapgl.on('mousemove', 'cbsas-join', (e) => {
                if (e.features.length > 0) {

                    const realCoords = [e.lngLat.lng, e.lngLat.lat]
                    const reqKPI = e.features[0].state.requestedKPI;
                    const cbsa = e.features[0].state.name

                    const description = `
                    <div class="popup-inner">
                        <div class="popup-inner__vertical">
                            <div class="popup-title__wrapper">
                                <h2 class="popup-title">${cbsa}</h2>
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
                        popup.setLngLat(realCoords).setHTML(description).addTo(mapgl);
                    } else {
                        popup.remove
                    }

                    if (hoveredStateId !== null) {
                        mapgl.setFeatureState(
                            { source: 'cbsaData', id: hoveredStateId, sourceLayer: 'boundaries_stats_2' }, 
                            { hover: false }
                        );
                    }
                    hoveredStateId = e.features[0].id;
                    mapgl.setFeatureState(
                        { source: 'cbsaData', id: hoveredStateId, sourceLayer: 'boundaries_stats_2' },
                        { hover: true }
                    );
                }
            });
                 
            // When the mouse leaves the state-fill layer, update the feature state of the
            // previously hovered feature.
            mapgl.on('mouseleave', 'cbsas-join', () => {
                if (hoveredStateId !== null) {
                    mapgl.setFeatureState(
                        { source: 'cbsaData', id: hoveredStateId, sourceLayer: 'boundaries_stats_2' },
                        { hover: false }
                    );
                    popup.remove();
                }
                hoveredStateId = null;
            });

            mapgl.on('click', 'cbsas-join', (e) => hostClickEvent(e, 'cbsas-join', lookupData, localesWrapper, true));

            function setStates() {
                for (let i = 0; i < data.length; i++) {
                    const row = data[i]
                    if(!lookupData.hasOwnProperty(row["dim_zi_map_vis.cbsa"].value)) {
                        continue;
                    }
                    mapgl.setFeatureState(
                        {
                            source: "cbsaData",
                            sourceLayer: 'boundaries_stats_2',
                            id: lookupData[row["dim_zi_map_vis.cbsa"].value].feature_id
                        },
                        {
                            requestedKPI: row[measureName].value,
                            name: lookupData[row["dim_zi_map_vis.cbsa"].value].name,
                            hovered: false
                        }
                    )
                }
            }

            createLegend(data, "dim_zi_map_vis.cbsa", maxValue)

            // Check if `statesData` source is loaded.
            function setAfterLoadCBSAs(event) {
                if (event.sourceID !== 'cbsaData' && !event.isSourceLoaded) return;
                setStates();
                mapgl.off('sourcedata', setAfterLoadCBSAs);
            }
    
            // If `statesData` source is loaded, call `setStates()`.
            if (mapgl.isSourceLoaded('cbsaData')) {
                setStates();
            } else {
                mapgl.on('sourcedata', setAfterLoadCBSAs);
            }
        }

        function createZipsViz() {
            const lookupData = filterLookupTable();

            function filterLookupTable() {
                const lookupData = {};
    
                const searchData = zipData.pos4.data.all
    
                Object.keys(searchData).forEach(function(key) {
                    const featureData = searchData[key]
                    if(featureData.iso_3166_1 === 'US') {
                        lookupData[featureData['unit_code']] = featureData
                    }
                })
                return lookupData;
            }

            const maxValue = getMaxZip(lookupData)

            mapgl.addLayer({
                id: 'zips-join',
                type: 'fill',
                source: 'zipData',
                'layout': {
                    // Make the layer visible by default.
                    'visibility': 'visible'
                },
                'source-layer': 'boundaries_postal_4',
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


            mapgl.on('mousemove', 'zips-join', (e) => {
                if (e.features.length > 0) {

                    const realCoords = [e.lngLat.lng, e.lngLat.lat]
                    const reqKPI = e.features[0].state.requestedKPI;
                    const zip = e.features[0].state.name

                    const description = `
                    <div class="popup-inner">
                        <div class="popup-inner__vertical">
                            <div class="popup-title__wrapper">
                                <h2 class="popup-title">${zip}</h2>
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
                        popup.setLngLat(realCoords).setHTML(description).addTo(mapgl);
                    } else {
                        popup.remove
                    }

                    if (hoveredStateId !== null) {
                        mapgl.setFeatureState(
                            { source: 'zipData', id: hoveredStateId, sourceLayer: 'boundaries_postal_4' }, 
                            { hover: false }
                        );
                    }
                    hoveredStateId = e.features[0].id;
                    mapgl.setFeatureState(
                        { source: 'zipData', id: hoveredStateId, sourceLayer: 'boundaries_postal_4' },
                        { hover: true }
                    );
                }
            });
                 
            // When the mouse leaves the state-fill layer, update the feature state of the
            // previously hovered feature.
            mapgl.on('mouseleave', 'zips-join', () => {
                if (hoveredStateId !== null) {
                    mapgl.setFeatureState(
                        { source: 'zipData', id: hoveredStateId, sourceLayer: 'boundaries_postal_4' },
                        { hover: false }
                    );
                    popup.remove();
                }
                hoveredStateId = null;
            });

            mapgl.on('click', 'zips-join', (e) => hostClickEvent(e, 'zips-join', lookupData, localesWrapper));

            function setStates() {
                for (let i = 0; i < data.length; i++) {
                    const row = data[i]
                    if(!lookupData.hasOwnProperty(row["dim_zi_map_vis.zip"].value)) {
                        continue;
                    }
                    mapgl.setFeatureState(
                        {
                            source: "zipData",
                            sourceLayer: 'boundaries_postal_4',
                            id: lookupData[row["dim_zi_map_vis.zip"].value].feature_id
                        },
                        {
                            requestedKPI: row[measureName].value,
                            name: lookupData[row["dim_zi_map_vis.zip"].value].unit_code,
                            hovered: false
                        }
                    )
                }
            }

            createLegend(data, "dim_zi_map_vis.zip", maxValue)
            
            // Check if `statesData` source is loaded.
            function setAfterLoadZips(event) {
                if (event.sourceID !== 'zipData' && !event.isSourceLoaded) return;
                setStates();
                mapgl.off('sourcedata', setAfterLoadZips);
            }
    
            // If `statesData` source is loaded, call `setStates()`.
            if (mapgl.isSourceLoaded('zipData')) {
                setStates();
            } else {
                mapgl.on('sourcedata', setAfterLoadZips);
            }
        }

        mapgl.on('style.load', () => {
            mapgl.setFog({
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

        runVisUpdate();

        function runVisUpdate() {
            const updateStates = () => {
                const lookupData = filterLookupTable();

                function filterLookupTable() {
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

                mapgl.removeFeatureState({
                    source: "statesData",
                    sourceLayer: 'boundaries_admin_1',
                })

                for (let i = 0; i < data.length; i++) {
                    const row = data[i]
                    if(!lookupData.hasOwnProperty(row["dim_zi_map_vis.state"].value)) {
                        continue;
                    }
                    mapgl.setFeatureState(
                        {
                            source: "statesData",
                            sourceLayer: 'boundaries_admin_1',
                            id: lookupData[row["dim_zi_map_vis.state"].value].feature_id
                        },
                        {
                            requestedKPI: row[measureName].value,
                            fipsCode: lookupData[row["dim_zi_map_vis.state"].value].unit_code,
                            name: lookupData[row["dim_zi_map_vis.state"].value].name,
                            hovered: false
                        }
                    )
                }

                const maxValue = getMaxState(lookupData)

                createLegend(data, "dim_zi_map_vis.state", maxValue)

                mapgl.setPaintProperty(
                    'states-join', 
                    'fill-color', 
                    ['case', ['!=', ['feature-state', 'requestedKPI'], null], ['interpolate', ['linear'], ['feature-state', 'requestedKPI'], 1, 'rgba(255,237,234,0.6)', maxValue, 'rgba(179,18,31,0.6)'],'rgba(255, 255, 255, 0)']
                )
            }

            const updateCBSAs = () => {
                const lookupData = filterLookupTable();

                function filterLookupTable() {
                    const lookupData = {};
        
                    const searchData = cbsaData.sta2.data.all
        
                    Object.keys(searchData).forEach(function(key) {
                        const featureData = searchData[key]
                        if(featureData.iso_3166_1 === 'US') {
                            lookupData[featureData['name'].replace(",", "")] = featureData
                        }
                    })
                    return lookupData;
                }

                mapgl.removeFeatureState({
                    source: "cbsaData",
                    sourceLayer: 'boundaries_stats_2',
                })

                for (let i = 0; i < data.length; i++) {
                    const row = data[i]
                    if(!lookupData.hasOwnProperty(row["dim_zi_map_vis.cbsa"].value)) {
                        continue;
                    }
                    mapgl.setFeatureState(
                        {
                            source: "cbsaData",
                            sourceLayer: 'boundaries_stats_2',
                            id: lookupData[row["dim_zi_map_vis.cbsa"].value].feature_id
                        },
                        {
                            requestedKPI: row[measureName].value,
                            name: lookupData[row["dim_zi_map_vis.cbsa"].value].name,
                            hovered: false
                        }
                    )
                }

                const maxValue = getMaxCBSA(lookupData)

                createLegend(data, "dim_zi_map_vis.cbsa", maxValue)

                mapgl.setPaintProperty(
                    'cbsas-join', 
                    'fill-color', 
                    ['case', ['!=', ['feature-state', 'requestedKPI'], null], ['interpolate', ['linear'], ['feature-state', 'requestedKPI'], 1, 'rgba(255,237,234,0.6)', maxValue, 'rgba(179,18,31,0.6)'],'rgba(255, 255, 255, 0)']
                )
            }

            const updateZips = () => {
                const lookupData = filterLookupTable();

                function filterLookupTable() {
                    const lookupData = {};
        
                    const searchData = zipData.pos4.data.all
        
                    Object.keys(searchData).forEach(function(key) {
                        const featureData = searchData[key]
                        if(featureData.iso_3166_1 === 'US') {
                            lookupData[featureData['unit_code']] = featureData
                        }
                    })
                    return lookupData;
                }

                mapgl.removeFeatureState({
                    source: "zipData",
                    sourceLayer: 'boundaries_postal_4',
                })

                for (let i = 0; i < data.length; i++) {
                    const row = data[i]
                    if(!lookupData.hasOwnProperty(row["dim_zi_map_vis.zip"].value)) {
                        continue;
                    }
                    mapgl.setFeatureState(
                        {
                            source: "zipData",
                            sourceLayer: 'boundaries_postal_4',
                            id: lookupData[row["dim_zi_map_vis.zip"].value].feature_id
                        },
                        {
                            requestedKPI: row[measureName].value,
                            name: lookupData[row["dim_zi_map_vis.zip"].value].unit_code,
                            hovered: false
                        }
                    )
                }

                const maxValue = getMaxZip(lookupData)

                createLegend(data, "dim_zi_map_vis.zip", maxValue)

                mapgl.setPaintProperty(
                    'zips-join', 
                    'fill-color', 
                    ['case', ['!=', ['feature-state', 'requestedKPI'], null], ['interpolate', ['linear'], ['feature-state', 'requestedKPI'], 1, 'rgba(255,237,234,0.6)', maxValue, 'rgba(179,18,31,0.6)'],'rgba(255, 255, 255, 0)']
                )
            }

            if(mapgl.getSource('statesData') && mapgl.isSourceLoaded('statesData')) updateStates();
            if(mapgl.getSource('cbsaData') && mapgl.isSourceLoaded('cbsaData')) updateCBSAs();
            if(mapgl.getSource('zipData') && mapgl.isSourceLoaded('zipData')) updateZips();
        }

        console.timeEnd("updateAsyncRuntime")
        done()
    }
});
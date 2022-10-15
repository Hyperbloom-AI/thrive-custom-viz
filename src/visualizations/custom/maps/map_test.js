import mapboxgl from 'mapbox-gl';
import stateData from './mapbox-boundaries-adm1-v3_4.json';
import cbsaData from './mapbox-boundaries-sta2-v3_4.json';
import zipData from './mapbox-boundaries-pos4-v3_4.json';
import regeneratorRuntime from "regenerator-runtime";
import bbox from '@turf/bbox';
import "core-js/stable";

// DEV NOTE: Mikel from mapbox asked me to add this to destroy a non-blocking recurring console error
if (mapboxgl.version.indexOf('2.9.') === 0) Object.defineProperty(window, 'caches', { value: undefined });

/* DEV NOTE: In an attempt to make this function run as fast as possible, I switch from using `.toString()` to using '' + x which is 8% faster ,
This function is used to convert long integers into strings with commas between every three numbers in reverse.
Params:
    @param x: a number, specifically an integer
*/
const numberWithCommas = (x) => x ? (('' + x.toFixed(0)).split(".")[0]).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : undefined;

// Add the visualization to the looker plugins, self-explanatory. This object is required for all custom visualizations and should follow this top level layout
looker.plugins.visualizations.add({
    id: "thrive_custom_special_granularity_map",
    label: "Custom Layered Mapbox Map",
    // Set up the initial state of the visualization
    create: function (element, config) {
        // Create the link element to add map stylings
        var link = document.head.appendChild(document.createElement('link'));
        link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.9.1/mapbox-gl.css';
        link.rel = 'stylesheet';
        // Insert a <style> tag with the styles for the map and it's related icons and sections.
        element.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');
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
                -moz-user-select: none;
                -khtml-user-select: none;
                -webkit-user-select: none;
                -ms-user-select: none;
                user-select: none;
                max-height: 46px;
                width: fit-content;
            }
            .selected-locale__hidden {
                background-color: black;
                color: white;
                font: 14px/20px 'Roboto', sans-serif;
                padding: 12px 20px;
                border-radius: 30px;
                display: flex;
                align-items: center;
                -moz-user-select: none;
                -khtml-user-select: none;
                -webkit-user-select: none;
                -ms-user-select: none;
                user-select: none;
                max-height: 46px;
                width: fit-content;
            }
            .selected-locale__more {
                background-color: #E8E7E7;
                color: #151313;
                border: 1px solid #000000;
                padding: 12px;
                font: 14px/20px 'Roboto', sans-serif;
                border-radius: 30px;
                min-width: 100px;
                text-align: center;
                -moz-user-select: none;
                -khtml-user-select: none;
                -webkit-user-select: none;
                -ms-user-select: none;
                user-select: none;
                cursor: pointer;
                max-height: 46px;
            }
            #selectedLocaleContainer {
                display: flex;
                flex-flow: row nowrap;
            }
            .selected-locale:not(:last-child) {
                margin-right: 5px;
            }
            .selected-locale__hidden:not(:last-child) {
                margin-right: 5px;
            }
            .remove-icon {
                margin-left: 25px;
                cursor: pointer;
            }
            .selected-locale > div, .selected-locale__hidden > div {
                display: flex;
            }
            .selected-locale__more-box__wrapper {
                position: absolute;
                bottom: 55px;
                right: 0;
                max-height: 400px;
                width: 400px;
                background-color: #e8e7e782;
                border: 1px solid black;
                border-radius: 15px;
                display: none;
                flex-direction: column;
                padding: 10px 6px 10px 0;
            }
            .selected-locale__more-box__wrapper.active {
                display: flex;
            }
            .selected-locale__more-box {
                flex-flow: row wrap;
                overflow-y: scroll;
                display: flex;
                padding: 10px 15px 0 20px;
            }
            .selected-locale__more-box > div {
                margin-bottom: 10px;
            }
            ::-webkit-scrollbar-track {
                background: #00000000;
            }
            ::-webkit-scrollbar {
                width: 7px;
            }
            ::-webkit-scrollbar-thumb {
                width: 7px;
                border-radius: 17px;
                background-color: #919191;
            }
            .ctrl-tooltip {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                padding: 24px;
                max-height: 320px;
                height: fit-content;
                background-color: #E8E7E7;
                border-radius: 12px;
                font-family: 'Roboto', sans-serif;
                max-width: 550px;
                width: 60%;
            }
            .ctrl-tooltip__background {
                position: absolute;
                background: rgba(0, 0, 0, 0.4);
                width: 100%;
                height: 100%;
                z-index: 5;
                display: none;
            }
            .ctrl-tooltip__background.active {
                display: block;
            }
            .ctrl-tooltip h2 {
                font-size: 16px;
                line-height: 150%;
                font-weight: 700;
                margin-bottom: 24px;
            }
            .ctrl-tooltip p {
                font-size: 16px;
                line-height: 150%;
                margin-bottom: 24px;
            }
            .ctrl-tooltip__top {
                border-bottom: 1px solid #B8B8B8;
                margin-bottom: 24px;
            }
            .ctrl-tooltip__bottom {
                display: flex;
                flex-flow: row-reverse nowrap;
            }
            .ctrl-tooltip button {
                background: #000000;
                border-radius: 8px;
                color: #FDFAF3;
                width: 175px;
                padding: 15px;
                text-align: center;
                font-size: 16px;
                line-height: 18px;
                font-family: 'Roboto', sans-serif;
                margin-left: auto;
                cursor: pointer;
            }
            .tooltip-opener {
                background: #B3121F;
                width: 42px;
                height: 42px;
                border-radius: 50%;
                color: white;
                position: absolute;
                left: 15px;
                top: 15px;
                z-index: 3;
                display: flex;
                justify-content: center;
                align-items: center;
                cursor: pointer;
                opacity: 0.8
            }
        </style>`;
        
        // This is an object containing the information to refer to for groupingNames and layerNames
        this.__LAYERNAMES = [
            { name: "states-join", groupingName: "State" }, 
            { name: "cbsas-join", groupingName: "CBSA" }, 
            { name: "zips-join", groupingName: "Zipcode" }
        ];
        // Create and style all the elements that make up the major components of the map and surrounding UI.
        this.__mapPaginatorWrapper = element.appendChild(document.createElement('div'));
        this.__selectedLocalesWrapper = element.appendChild(document.createElement('div'));
        this.__mapBox = element.appendChild(document.createElement('div'));
        this.__mapStatesButton = this.__mapPaginatorWrapper.appendChild(document.createElement('button'));
        this.__mapCBSAsButton = this.__mapPaginatorWrapper.appendChild(document.createElement('button'));
        this.__mapZipCodesButton = this.__mapPaginatorWrapper.appendChild(document.createElement('button'));
        this.__mapPaginatorWrapper.className = "map-paginator__wrapper";
        this.__selectedLocalesWrapper.className = "selected-locales__wrapper";
        this.__mapStatesButton.innerHTML = "States";
        this.__mapStatesButton.className = "map-paginator active";
        this.__mapStatesButton.id = "states-join";
        this.__mapCBSAsButton.innerHTML = "CBSAs";
        this.__mapCBSAsButton.className = "map-paginator";
        this.__mapCBSAsButton.id = "cbsas-join";
        this.__mapZipCodesButton.innerHTML = "Zip Codes";
        this.__mapZipCodesButton.className = "map-paginator";
        this.__mapZipCodesButton.id = "zips-join";
        this.__mapBox.style.height = '100%';
        this.__mapBox.style.width = '100%';
        this.__mapBox.id = "map";

        // Set the access Token to access the Mapbox GL API
        mapboxgl.accessToken = 'pk.eyJ1IjoiZHVuY2FuY2ZyYXNlciIsImEiOiJjbDRvbDlmZWQwMGdzM2ZxazZybTVkdDQ0In0.xL5_LBkos5tYRbLxR0tQRQ';
        // Initialize the map with the light style, center it on the USA, set a minumum zoom level and turn off scroll interaction.
        this.__map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/light-v10',
            center: [-98.5795, 38.7],
            zoom: 3.6,
            minZoom: 2,
            scrollZoom: false,
            dragRotate: false,
            keyboard: false,
            maxPitch: 0,
            touchPitch: false
        });
        // Add the +/- Map zoom controls. This also adds a rotation control though it's not super useful
        this.__map.addControl(new mapboxgl.NavigationControl());
        // When the map first loads, add all the sources which dictate the behavior of data added to the map
        this.__map.on('load', () => this.__map.addSource('statesData', { type: 'vector', url: 'mapbox://mapbox.boundaries-adm1-v3'}).addSource('cbsaData', { type: 'vector', url: 'mapbox://mapbox.boundaries-sta2-v3' }).addSource('zipData', { type: 'vector', url: 'mapbox://mapbox.boundaries-pos4-v3' }));
        var script = document.head.appendChild(document.createElement('script'));
        script.src = 'https://kit.fontawesome.com/f2060bf509.js';
        script.crossOrigin = "anonymous";
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
        // Clear any errors from previous updates
       this.clearErrors(queryResponse.fields);

        //When no dimensions and/or no measures are present the viz stops updating and displays an error
        if (queryResponse.fields.measures.length < 1 || queryResponse.fields.dimensions.length < 1) {
            this.addError({ title: "No Measures or Dimensions", message: "This chart requires a measure and a dimension." });
            return;
        }

        /* Pass a message to the GTM Frontend to send a locale filter to looker
        Params:
            @param locales: object containing all filtered locales at different levels of granularity
        */
        const throwMessage = (locales) => window.parent.parent.postMessage({ message: "crossFilterLocale", value: locales }, "*");
        /* Pass a message to the GTM Frontend to send a granularity grouping filter to looker
        Params:
            @param g: string representing new grouping to filter to
        */
        const changeGranularity = (g) => window.parent.parent.postMessage({ message: "changeGranularity", value: g }, "*");

        // Because `this` does not work properly in functions (`this` goes local), move the map to a more usable variable
        let mapgl = this.__map;
        // Find name of measure, as measure is requested KPI, which is dynamic, returns String
        const measureName = queryResponse.fields.measures[0].name;
        // Find label of measure, as measure is requested KPI, which is dynamic. This prints to UI, returns String
        const measureLabel = queryResponse.fields.measures[0].label_short;
        // Move HTML DOM element from `this` to permanent variable, returns HTML DOM element
        const localesWrapper = this.__selectedLocalesWrapper;
        // Move Object from `this` to permanent variable, returns Object
        const thisLayerNames = this.__LAYERNAMES;
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
            const oldLegendBox = document.getElementById("mapboxLegend");
            if(oldLegendBox) oldLegendBox.parentNode.removeChild(oldLegendBox);
            // Create the elements necessary to construct the legend, all below elements should return HTML DOM nodes
            const legendBox = document.createElement("div");
            const legendLeft = document.createElement("div");
            const legendRight = document.createElement("div");
            const legendBar = document.createElement("div");
            const legendRightTop = document.createElement("div");
            const legendRightBottom = document.createElement("div");
            // Add the proper classes to the legend elements consistent with the CSS styling in `create()`
            legendBox.className = "legend-box";
            legendLeft.className = "legend-left";
            legendRight.className = "legend-right";
            legendBar.className = "legend-bar";
            // Display the maximum value with the proper number of commas for a number it's length
            legendRightTop.innerHTML = numberWithCommas(max);
            // The lower bound is 1, since 0 is never displayed
            legendRightBottom.innerHTML = 1;
            // Append all the elements in order to create the legend from the CSS styling in `create()`
            legendLeft.appendChild(legendBar);
            legendRight.appendChild(legendRightTop);
            legendRight.appendChild(legendRightBottom);
            legendBox.appendChild(legendLeft);
            legendBox.appendChild(legendRight);
            // Give the entire legend an id so it can be deleted on refresh.
            legendBox.id = "mapboxLegend";
            // Append the new legend to the entire visualization
            element.appendChild(legendBox);
        }

        const showHideMultiTooltip = () => document.getElementById("mainTooltip").classList.toggle("active")

        const createMultiTooltip = () => {
            const mapboxbox = document.getElementById("map")
            const tooltipOpener = mapboxbox.appendChild(document.createElement('div'))
            const tooltipBackground = mapboxbox.appendChild(document.createElement("div"))
            const tooltipOuter = tooltipBackground.appendChild(document.createElement("div"))
            const tooltipInner = tooltipOuter.appendChild(document.createElement("div"))
            const tooltipTop = tooltipOuter.appendChild(document.createElement("div"))
            const tooltipBottom = tooltipOuter.appendChild(document.createElement("div"))
            const tooltipTitle = tooltipTop.appendChild(document.createElement("h2"))
            const tooltipDescription = tooltipTop.appendChild(document.createElement("p"))
            const tooltipButton = tooltipBottom.appendChild(document.createElement("button"))
            tooltipBackground.className = "ctrl-tooltip__background"
            tooltipBackground.id = "mainTooltip"
            tooltipOuter.className = "ctrl-tooltip"
            tooltipInner.className = "ctrl-tooltip__inner"
            tooltipTop.className = "ctrl-tooltip__top"
            tooltipBottom.className = "ctrl-tooltip__bottom"
            tooltipTitle.innerHTML = "Keyboard Shortcut"
            tooltipDescription.innerHTML = "Press and hold the Ctrl key (or Cmd key on Mac) while clicking on subsequent locations to select multiple features, before selecting the last feature of your preffered subset, release the Ctrl or Cmd key."
            tooltipButton.innerHTML = "Got It"
            tooltipButton.addEventListener("click", showHideMultiTooltip)
            tooltipOpener.className = "tooltip-opener"
            tooltipOpener.innerHTML = '<i class="fa-solid fa-circle-info fa-2x" aria-hidden="true"></i>'
            tooltipOpener.addEventListener("click", showHideMultiTooltip)
        }

        /* Runs an update function when a user removes or adds a feature to the selection list.
        Params:
            @param element: The element that holds the feature pucks.
            @param selectedLayer: The layer where the click originated or where the feature should be removed from.
        */
        async function runSelectionUpdate(element, selectedLayer) {
            // Holds the DOM element that is the lowest single parent, returns HTML DOM Element.
            const prevParent = document.getElementById("selectedLocaleContainer");

            const oldMoreBox = document.getElementById("moreBoxWrapper")
            // If the lowest parent element exists, delete it so it can be replaced.
            if(prevParent) element.removeChild(prevParent);

            if(oldMoreBox) element.removeChild(oldMoreBox)
            // Create a new div to replace the last and give it an id for deletion later.
            const parent = document.createElement("div");
            parent.id = "selectedLocaleContainer";
            // Use advanced filtering logic to determine all the values present and get a count
            const prevalues = (Object.values(filteredStateNames)).map(element => element);
            const values = [].concat.apply([], prevalues);
            const count = values.length;
            // Create a "See More" puck which users can click to display the hidden selected features.
            const moreWrapper = document.createElement("div");
            // When the total number of objects is greater than 3, simply change the text of the puck to display the number of hidden features
            const moreBoxWrapper = document.createElement("div");
            const moreBox = document.createElement("div");
            moreBox.className = "selected-locale__more-box";
            moreBox.id = "moreBox";
            moreBoxWrapper.appendChild(moreBox);
            moreBoxWrapper.id = "moreBoxWrapper";
            moreBoxWrapper.className = "selected-locale__more-box__wrapper";
            element.appendChild(moreBoxWrapper);

            if(count > 3) {
                moreWrapper.className = "selected-locale__more";
                const moreText = document.createElement("span");
                moreText.innerHTML = `+${count - 2} more locales`;
                moreWrapper.appendChild(moreText);
            };
            // Total Count will keep a live count of number of features, returns Integer
            let totalCount = 0;
            // Rotate through each layer using Object.keys to get the layer names
            Object.keys(filteredStateNames).forEach((layer) => {
                // Rotate Through each selected value on a given layer, also keep the index to determine from which position to splice on removal.
                filteredStateNames[layer].forEach((feature, index) => {
                    // Increment total count to keep track of which elements should be hidden
                    totalCount++;
                    // Create each element in order to make a puck. In the else statement the pucks are not hidden.
                    const selectedLocale = document.createElement("div");
                    const selectedLocaleText = document.createElement("span");
                    const removeButton = document.createElement('div');
                    removeButton.innerHTML = '<i class="fa-solid fa-xmark remove-icon" aria-hidden="true"></i>';
                    // Add an event listener that will remove a value from the list when the `x` is clicked
                    removeButton.addEventListener("click", () => {
                        // Remove a single element at the index supplied
                        filteredStateNames[layer].splice(index, 1);
                        // Update the selected locales on the GTM Dashboard
                        throwMessage(filteredStateNames);
                        // Rerun this function so that the pucks show the item is removed
                        runSelectionUpdate(element, selectedLayer);
                    })
                    // Finish creating the puck and append it to the parent element.
                    selectedLocaleText.innerHTML = feature;
                    selectedLocale.appendChild(selectedLocaleText);
                    selectedLocale.appendChild(removeButton);

                    if(totalCount > 2 && count > 3) {
                        selectedLocale.className = "selected-locale__hidden";
                        moreBox.appendChild(selectedLocale)
                    } else {
                        selectedLocale.className = "selected-locale";
                        parent.appendChild(selectedLocale);
                    }
                })
            })
            // When the total number of features is empty, revert to the states dashboard, zoom back to center and reset zoom.
            if(totalCount === 0) {
                autoChangeActive("states-join");
                changeGranularity("State");
                mapgl.easeTo({ center: [-98.5795, 38.7], zoom: 3.6, duration: 1000 })
            }
            moreWrapper.addEventListener("click", function() {
                if(moreWrapper.classList.contains("active")) {
                    runSelectionUpdate(element, selectedLayer)
                } else {
                    moreWrapper.classList.toggle("active")
                    moreWrapper.innerHTML = "Close"
                    const elements = document.querySelectorAll(".selected-locale");
                    const mbw = document.getElementById("moreBoxWrapper")
                    const mb = document.getElementById("moreBox")
                    //elements.forEach((puck) => puck.remove())
                    elements.forEach((puck) => mb.appendChild(puck))
                    mbw.classList.toggle("active")
                }
            })
            // Add the hidden puck to the selected features
            parent.appendChild(moreWrapper);
            // Append the whole selected locale box to the visualization
            element.appendChild(parent);
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
            var selectedFeatureName = names[0];
            // When selectedFeatureName is undefined, does not execute
            if(selectedFeatureName) {
                // If optional parameter `replaceCommas` is true, attempts to replace commas, upon failing executes console.warn
                if(replaceCommas && selectedFeatureName) selectedFeatureName = selectedFeatureName.replace(",", "")
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
                    // Get layer names from filteredStateNames with Object.keys(), Returns array: ["layerX", "layerY", "layerZ"]
                    const layers = Object.keys(filteredStateNames)
                    // Check what the next layer in the list is after the layer currently in use, returns String or undefined
                    const nextLayerName = layers[layers.findIndex((element) => element === layerName) + 1]
                    // If nextLayerName is not undefined get the grouping name and change granularity to next lowest setting
                    if(nextLayerName) {
                        // Get the grouping name of the next layer, returns String no undefined
                        const nextLayerGrouping = thisLayerNames[thisLayerNames.findIndex((element) => element.name === nextLayerName)].groupingName
                        // Update the selected grouping in the GTM Frontend to swap granularities
                        changeGranularity(nextLayerGrouping)
                        // Automatically change the active layer to the specific layer supplied
                        autoChangeActive(nextLayerName)
                    }
                }
            }
        }

        // When the map loads, create each initial visualization regardless of the existence of data
        mapgl.on('load', () => {
            createStatesViz();
            createCBSAsViz();
            createZipsViz();
            createMultiTooltip();
            showHideMultiTooltip();
        });

        // When the map goes idle, attach an event listener to the granularity buttons to change to that granularity
        mapgl.on('idle', () => document.querySelectorAll('.map-paginator').forEach(button => button.addEventListener("click", changeActive)))

        /* As Compared to the next function, this function automatically changes which layer is active rather than determining
        What was clicked.
        Params:
            @param layer: The name of the layer that the visualization will swap to.
        */
        const autoChangeActive = (layer) => {
            // Get all elements with the given class, this will return a collection of DOM elements that are the buttons
            const els = document.getElementsByClassName("map-paginator");
            // Loop through the 
            for (let i = 0; i < els.length; i++) {
                if(els[i].classList.contains("active")) els[i].classList.remove("active");
                if(els[i].id === layer) els[i].classList.add("active")
            };

            for (let j = 0; j < this.__LAYERNAMES.length; j++) {
                if(this.__LAYERNAMES[j].name !== layer) mapgl.setLayoutProperty(this.__LAYERNAMES[j].name, 'visibility', 'none');
            };

            const filteredDown = this.__LAYERNAMES.filter(item => item.name === layer)
            if(filteredDown.length > 0) mapgl.setLayoutProperty(layer, 'visibility', 'visible');
        }

        const changeActive = (e) => {
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
                    if(this.__LAYERNAMES[j].name !== e.target.id)mapgl.setLayoutProperty(this.__LAYERNAMES[j].name, 'visibility', 'none');
                };

                const filteredDown = this.__LAYERNAMES.filter(item => item.name === e.target.id)

                if(filteredDown.length > 0) {
                    mapgl.setLayoutProperty(e.target.id, 'visibility', 'visible');
                    console.log("filteredDown[0].groupingName", filteredDown[0].groupingName)
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
    
                Object.keys(searchData).forEach((key) => {
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
    
                Object.keys(searchData).forEach((key) => {
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
    
                Object.keys(searchData).forEach((key) => {
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
                'color': 'rgb(186, 210, 235)', // Lower atmosphere
                'high-color': 'rgb(36, 92, 223)', // Upper atmosphere
                'horizon-blend': 0.02, // Atmosphere thickness (default 0.2 at low zooms)
                'space-color': 'rgb(11, 11, 25)', // Background color
                'star-intensity': 0.6 // Background star brightness (default 0.35 at low zoooms )
            }); // Set the default atmosphere style
        });

        function autozoomCBSA() {
            if(mapgl.getSource('cbsaData') && mapgl.isSourceLoaded('cbsaData')) {
                const fu = mapgl.queryRenderedFeatures({ layers: ['cbsas-join'] })
                //const fu = mapgl.querySourceFeatures('cbsaData', { sourceLayer: 'boundaries_stats_2' })
                const f = fu.filter((feature) => feature.state && feature.state.requestedKPI)
                if (f.length > 0) {
                    var bb = bbox({ type: 'FeatureCollection', features: f });
                    mapgl.fitBounds(bb, {padding: 50});
                    mapgl.off("idle", autozoomCBSA)
                }
            }
        }

        function autozoomZip() {
            if(mapgl.getSource('zipData') && mapgl.isSourceLoaded('zipData')) {
                const fu = mapgl.queryRenderedFeatures({ layers: ['zips-join'] })
                //const fu = mapgl.querySourceFeatures('cbsaData', { sourceLayer: 'boundaries_stats_2' })
                const f = fu.filter((feature) => feature.state && feature.state.requestedKPI)
                if (f.length > 0) {
                    var bb = bbox({ type: 'FeatureCollection', features: f });
                    mapgl.fitBounds(bb, {padding: 50});
                    mapgl.off("idle", autozoomZip)
                }
            }
        }

        runVisUpdate()

        function runVisUpdate() {
            mapgl.on("idle", autozoomCBSA)
            mapgl.on("idle", autozoomZip)

            const updateStates = () => {
                const lookupData = filterLookupTable();

                function filterLookupTable() {
                    const lookupData = {};
                    const searchData = stateData.adm1.data.all;
        
                    Object.keys(searchData).forEach((key) => {
                        const featureData = searchData[key]
                        if(featureData.iso_3166_1 === 'US') lookupData[featureData['name']] = featureData
                    })
                    return lookupData;
                }

                mapgl.removeFeatureState({source: "statesData", sourceLayer: 'boundaries_admin_1'})

                for (let i = 0; i < data.length; i++) {
                    const row = data[i]
                    if(!lookupData.hasOwnProperty(row["dim_zi_map_vis.state"].value)) continue;
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
                console.log("Updating CBSA's", data)
                const lookupData = filterLookupTable();

                function filterLookupTable() {
                    const lookupData = {};
                    const searchData = cbsaData.sta2.data.all
        
                    Object.keys(searchData).forEach((key) => {
                        const featureData = searchData[key]
                        if(featureData.iso_3166_1 === 'US') lookupData[featureData['name'].replace(",", "")] = featureData
                    })
                    return lookupData;
                }

                mapgl.removeFeatureState({source: "cbsaData", sourceLayer: 'boundaries_stats_2'})

                for (let i = 0; i < data.length; i++) {
                    const row = data[i]
                    if(!lookupData.hasOwnProperty(row["dim_zi_map_vis.cbsa"].value)) continue;
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
                    const searchData = zipData.pos4.data.all;
        
                    Object.keys(searchData).forEach(function (key) {
                        const featureData = searchData[key];
                        if(featureData.iso_3166_1 === 'US') {
                            lookupData[featureData['unit_code']] = featureData;
                        }
                    })
                    return lookupData;
                }

                mapgl.removeFeatureState({source: "zipData", sourceLayer: 'boundaries_postal_4'});

                for (let i = 0; i < data.length; i++) {
                    const row = data[i];
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

                const maxValue = getMaxZip(lookupData);

                createLegend(data, "dim_zi_map_vis.zip", maxValue);

                mapgl.setPaintProperty(
                    'zips-join', 
                    'fill-color', 
                    ['case', ['!=', ['feature-state', 'requestedKPI'], null], ['interpolate', ['linear'], ['feature-state', 'requestedKPI'], 1, 'rgba(255,237,234,0.6)', maxValue, 'rgba(179,18,31,0.6)'],'rgba(255, 255, 255, 0)']
                );
            }

            if(mapgl.getSource('statesData') && mapgl.isSourceLoaded('statesData')) updateStates();
            if(mapgl.getSource('cbsaData') && mapgl.isSourceLoaded('cbsaData')) updateCBSAs();
            if(mapgl.getSource('zipData') && mapgl.isSourceLoaded('zipData')) updateZips();
        }
        
        done()
    }
});
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
          {"Large": "large"},
          {"Small": "small"}
        ],
        display: "radio",
        default: "large"
      }
    },
    // Set up the initial state of the visualization
    create: function(element, config) {
  
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
      var container = element.appendChild(document.createElement("div"));
      container.className = "hello-world-vis";
  
      // Create an element to contain the text.
      this._blockElement1 = container.appendChild(document.createElement("div"));
      this._blockElement2 = container.appendChild(document.createElement("div"));
      this._blockElement3 = container.appendChild(document.createElement("div"));

      this._blockElement1.className = "centered-block"
      this._blockElement2.className = "centered-block"
      this._blockElement3.className = "centered-block"

      this._blockElement1Main = this._blockElement1.appendChild(document.createElement("div"))
      this._blockElement2Main = this._blockElement2.appendChild(document.createElement("div"))
      this._blockElement3Main = this._blockElement3.appendChild(document.createElement("div"))

      this._blockElement1TitleWrapper = this._blockElement1Main.appendChild(document.createElement("div"));
      this._blockElement2TitleWrapper = this._blockElement2Main.appendChild(document.createElement("div"));
      this._blockElement3TitleWrapper = this._blockElement3Main.appendChild(document.createElement("div"));

      this._blockElement1TitleWrapper.className = "inner-block__title";
      this._blockElement2TitleWrapper.className = "inner-block__title";
      this._blockElement3TitleWrapper.className = "inner-block__title";

      this._blockElement1TitleWrapper.innerHTML = "<h2>Companies with Intent</h2>"
      this._blockElement2TitleWrapper.innerHTML = "<h2>Avg Company Intent</h2>"
      this._blockElement3TitleWrapper.innerHTML = "<h2>Avg HQ Headcount</h2>"

      this._blockElement1ValueWrapper = this._blockElement1Main.appendChild(document.createElement("div"));
      this._blockElement2ValueWrapper = this._blockElement2Main.appendChild(document.createElement("div"));
      this._blockElement3ValueWrapper = this._blockElement3Main.appendChild(document.createElement("div"));

      this._blockElement1ValueWrapper.className = "inner-block__value";
      this._blockElement2ValueWrapper.className = "inner-block__value";
      this._blockElement3ValueWrapper.className = "inner-block__value";

      this._blockElement1SubtitleWrapper = this._blockElement1Main.appendChild(document.createElement("div"));
      this._blockElement2SubtitleWrapper = this._blockElement2Main.appendChild(document.createElement("div"));
      this._blockElement3SubtitleWrapper = this._blockElement3Main.appendChild(document.createElement("div"));

      this._blockElement1SubtitleWrapper.className = "inner-block__subtitle";
      this._blockElement2SubtitleWrapper.className = "inner-block__subtitle";
      this._blockElement3SubtitleWrapper.className = "inner-block__subtitle";
    },
    // Render in response to the data or settings changing
    updateAsync: function(data, element, config, queryResponse, details, done) {
      // Clear any errors from previous updates
      this.clearErrors(queryResponse.fields);

      console.log(queryResponse)

      // Throw some errors and exit if the shape of the data isn't what this chart needs
      if (queryResponse.fields.measures.length == 0) {
        this.addError({title: "No Measures", message: "This chart requires measures."});
        return;
      }
  
      // Insert the data into the page
      this._blockElement1ValueWrapper.innerHTML = `<h3>${numberWithCommas(Math.round(data[0]["dim_zi_company_entities.count"].value))}</h3>`
      this._blockElement2ValueWrapper.innerHTML = `<h3>${numberWithCommas(Math.round(data[0]["dim_zi_intent_metrics.monthly_intent_12_mos_per_company"].value))}</h3>`
      this._blockElement3ValueWrapper.innerHTML = `<h3>${numberWithCommas(Math.round(data[0]["dim_zi_company_entities.average_zi_c_company_employees"].value))}</h3>`
      
      this._blockElement1SubtitleWrapper.innerHTML = `<h5>Total Locations: ${numberWithCommas(Math.round(data[0]["dim_zi_company_entities.total_zi_c_num_locations"].value))}</h5>`
      this._blockElement2SubtitleWrapper.innerHTML = `<h5>Total Intent: ${numberWithCommas(Math.round(data[0]["dim_zi_intent_metrics.monthly_intent_12_mos"].value))}</h5>`
      this._blockElement3SubtitleWrapper.innerHTML = `<h5>Avg HQ Annual Revenue (K): ${numberWithCommas(Math.round(data[0]["dim_zi_company_entities.avg_company_revenue"].value))}</h5>`
  
      
      // We are done rendering! Let Looker know.
      done()
    }
  });
function numberWithCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

looker.plugins.visualizations.add({
    id: "thrive_custom_companies_synopsis",
    label: "Custom Companies Synopsis",
    // Set up the initial state of the visualization
    create: function(element, config) {
  
      // Insert a <style> tag with some styles we'll use later.
      element.innerHTML = `
        <style>
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
                font: 47px/59px Helvetica;
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
                font: 16px/20px Helvetica;
                font-weight: 400 !important;
                margin: 0;
            }

            .inner-block__value h3 {
                font: 47px/59px Helvetica;
                font-weight: 400 !important;
                margin: 0;
            }

            .inner-block__subtitle h5 {
                font: 14px/20px Helvetica;
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

      this._blockElement1.className = "centered-block"
      this._blockElement2.className = "centered-block"

      this._blockElement1Main = this._blockElement1.appendChild(document.createElement("div"))
      this._blockElement2Main = this._blockElement2.appendChild(document.createElement("div"))

      this._blockElement1TitleWrapper = this._blockElement1Main.appendChild(document.createElement("div"));
      this._blockElement2TitleWrapper = this._blockElement2Main.appendChild(document.createElement("div"));

      this._blockElement1TitleWrapper.className = "inner-block__title";
      this._blockElement2TitleWrapper.className = "inner-block__title";

      this._blockElement1TitleWrapper.innerHTML = "<h2>Companies</h2>"
      this._blockElement2TitleWrapper.innerHTML = "<h2>Avg HQ Headcount</h2>"

      this._blockElement1ValueWrapper = this._blockElement1Main.appendChild(document.createElement("div"));
      this._blockElement2ValueWrapper = this._blockElement2Main.appendChild(document.createElement("div"));

      this._blockElement1ValueWrapper.className = "inner-block__value";
      this._blockElement2ValueWrapper.className = "inner-block__value";

      this._blockElement1SubtitleWrapper = this._blockElement1Main.appendChild(document.createElement("div"));
      this._blockElement2SubtitleWrapper = this._blockElement2Main.appendChild(document.createElement("div"));

      this._blockElement1SubtitleWrapper.className = "inner-block__subtitle";
      this._blockElement2SubtitleWrapper.className = "inner-block__subtitle";
    },
    // Render in response to the data or settings changing
    updateAsync: function(data, element, config, queryResponse, details, done) {
  
      // Clear any errors from previous updates
      this.clearErrors(queryResponse.fields);

      // Throw some errors and exit if the shape of the data isn't what this chart needs
      if (queryResponse.fields.measures.length == 0) {
        this.addError({title: "No Measures", message: "This chart requires measures."});
        return;
      }
  
      // Grab the first cell of the data
      var firstRow = data[0];
      var firstCell = firstRow[queryResponse.fields.measures[0].name];
      
      // Insert the data into the page
      this._blockElement1ValueWrapper.innerHTML = `<h3>${numberWithCommas(Math.round(data[0]["dim_zi_company_entities.count"].value))}</h3>`
      this._blockElement2ValueWrapper.innerHTML = `<h3>${numberWithCommas(Math.round(data[0]["dim_zi_company_entities.average_zi_c_company_employees"].value))}</h3>`
      
      this._blockElement1SubtitleWrapper.innerHTML = `<h5>Total Locations: ${numberWithCommas(Math.round(data[0]["dim_zi_company_entities.total_zi_c_num_locations"].value))}</h5>`
      this._blockElement2SubtitleWrapper.innerHTML = `<h5>Avg HQ Annual Revenue (K): ${numberWithCommas(Math.round(data[0]["dim_zi_company_entities.avg_company_revenue"].value))}</h5>`
  
      // We are done rendering! Let Looker know.
      done()
    }
  });
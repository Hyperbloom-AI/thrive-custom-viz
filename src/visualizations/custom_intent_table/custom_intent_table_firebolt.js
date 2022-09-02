function numberWithCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

function abbrState(input, to) {

    var states = [
        ['Arizona', 'AZ'],
        ['Alabama', 'AL'],
        ['Alaska', 'AK'],
        ['Arkansas', 'AR'],
        ['California', 'CA'],
        ['Colorado', 'CO'],
        ['Connecticut', 'CT'],
        ['Delaware', 'DE'],
        ['Florida', 'FL'],
        ['Georgia', 'GA'],
        ['Hawaii', 'HI'],
        ['Idaho', 'ID'],
        ['Illinois', 'IL'],
        ['Indiana', 'IN'],
        ['Iowa', 'IA'],
        ['Kansas', 'KS'],
        ['Kentucky', 'KY'],
        ['Louisiana', 'LA'],
        ['Maine', 'ME'],
        ['Maryland', 'MD'],
        ['Massachusetts', 'MA'],
        ['Michigan', 'MI'],
        ['Minnesota', 'MN'],
        ['Mississippi', 'MS'],
        ['Missouri', 'MO'],
        ['Montana', 'MT'],
        ['Nebraska', 'NE'],
        ['Nevada', 'NV'],
        ['New Hampshire', 'NH'],
        ['New Jersey', 'NJ'],
        ['New Mexico', 'NM'],
        ['New York', 'NY'],
        ['North Carolina', 'NC'],
        ['North Dakota', 'ND'],
        ['Ohio', 'OH'],
        ['Oklahoma', 'OK'],
        ['Oregon', 'OR'],
        ['Pennsylvania', 'PA'],
        ['Rhode Island', 'RI'],
        ['South Carolina', 'SC'],
        ['South Dakota', 'SD'],
        ['Tennessee', 'TN'],
        ['Texas', 'TX'],
        ['Utah', 'UT'],
        ['Vermont', 'VT'],
        ['Virginia', 'VA'],
        ['Washington', 'WA'],
        ['West Virginia', 'WV'],
        ['Wisconsin', 'WI'],
        ['Wyoming', 'WY'],
        ['District Of Columbia', 'DC']
    ];

    if (to == 'abbr') {
        input = input.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
        for (i = 0; i < states.length; i++) {
            if (states[i][0] == input) {
                return (states[i][1]);
            }
        }
    } else if (to == 'name') {
        input = input.toUpperCase();
        for (i = 0; i < states.length; i++) {
            if (states[i][1] == input) {
                return (states[i][0]);
            }
        }
    }
}

looker.plugins.visualizations.add({
    id: "thrive_table",
    label: "Company Detail",
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
              padding-left: 22px;
              padding-right: 22px;
            }

            .thrive-table {
                width: 100%;
                border-collapse: collapse;
                border-left: none;
                border-right: none;
                border-top: 1px solid #CFD0CF;
                padding: 20px
            }

            .thrive-table thead tr th {
                font: 12px/16px Helvetica;
                color: #727171;
                text-align:left
            }
            .company-name {
                font: 14px/16px Helvetica;
                font-weight: 700;
                margin: 0;
                margin-bottom: 11px
            }
            .locale-number__wrapper {
                font: 10px/9px Helvetica;
                font-weight: 700;
                margin-top: auto;
                display: flex;
                justify-content: space-between;
            }
            .company-topic {
                font: 14px/16px Helvetica;
            }

            .company-more-topics {
                font: 10px/9px Helvetica;
                color: #A1A1A1;
                font-weight: 700;
                margin-top: auto;
            }

            .topics-wrapper {
                display: flex;
                flex-flow: column;
            }

            .name-location__wrapper {
                display: flex;
                flex-flow: column;
            }
            tr {
                height: 1px
            }
            td > div {
                padding-top: 10px;
                padding-bottom: 10px;
                height: 100%          
            }

            td {
                height: inherit;
                border-left: none;
                border-right: none;
                border-top: none
            }

            

            tbody tr {
                border-bottom: 1px solid #CFD0CF;
                border-left: none;
                border-right: none;
                border-top: none;
            }

            thead, thead tr th, thead tr {
                border: none
            }

            th > div {
                padding-bottom: 11px;
                padding-top: 12px;
                border-bottom: 1px solid #CFD0CF;
                height: 100%
            }

            th {
                height: inherit;
            }

            th:not(:last-child) > div {
                margin-right: 50px;
            }

            td:not(:last-child) > div {
                margin-right: 50px;
            }

            .company-intent, .revenue-range, .employee-range, .business-type {
                font: 14px/16px Helvetica;
            }

            table {
                padding-left: 22px
            }

            .table-function__wrapper {
                display: flex;
                flex-flow: row;
                justify-content: space-between;
                align-items: center;
            }

            .chart-title {
                font: 20px/25px Helvetica;
            }

            .chart-function-button {
                color: #fff;
                font: 14px/20px Helvetica;
                padding: 10px 20px;
                border: none;
                background-color: #BC3733;
                height: fit-content;
                cursor: pointer
            }
        </style>
      `;

        // Create a container element to let us center the text.
        this.__title_button__wrapper = element.appendChild(document.createElement("div"))
        this.__title_button__wrapper.className = "table-function__wrapper"
        var table = element.appendChild(document.createElement("table"));
        table.className = "thrive-table";
        table.border = 1
        var tableHead = table.appendChild(document.createElement("thead"))
        var tableHeadRow = tableHead.appendChild(document.createElement("tr"))
        var thCompanyName = tableHeadRow.appendChild(document.createElement("th"))
        var thCompanyNameDiv = thCompanyName.appendChild(document.createElement("div"))
        thCompanyNameDiv.innerHTML = "Company Name"

        var thCompanyName = tableHeadRow.appendChild(document.createElement("th"))
        var thCompanyNameDiv = thCompanyName.appendChild(document.createElement("div"))
        thCompanyNameDiv.innerHTML = "Company Website"

        var thCompanyName = tableHeadRow.appendChild(document.createElement("th"))
        var thCompanyNameDiv = thCompanyName.appendChild(document.createElement("div"))
        thCompanyNameDiv.innerHTML = "Company Description"

        var thTopic = tableHeadRow.appendChild(document.createElement("th"))
        var thTopicDiv = thTopic.appendChild(document.createElement("div"))
        thTopicDiv.innerHTML = "Topic"
        var thMonthlyIntent12Mo = tableHeadRow.appendChild(document.createElement("th"))
        var thMonthlyIntent12MoDiv = thMonthlyIntent12Mo.appendChild(document.createElement("div"))
        thMonthlyIntent12MoDiv.innerHTML = "Monthly Intent (12 mo)"
        var thRevenueRange = tableHeadRow.appendChild(document.createElement("th"))
        var thRevenueRangeDiv = thRevenueRange.appendChild(document.createElement("div"))
        thRevenueRangeDiv.innerHTML = "Revenue Range"
        var thEmployeeRange = tableHeadRow.appendChild(document.createElement("th"))
        var thEmployeeRangeDiv = thEmployeeRange.appendChild(document.createElement("div"))
        thEmployeeRangeDiv.innerHTML = "Employee Range"
        var thBusinessType = tableHeadRow.appendChild(document.createElement("th"))
        var thBusinessTypeDiv = thBusinessType.appendChild(document.createElement("div"))
        thBusinessTypeDiv.innerHTML = "Business Type"
        this.__tableBody = table.appendChild(document.createElement("tbody"))

    },
    // Render in response to the data or settings changing
    updateAsync: function (data, element, config, queryResponse, details, done) {

        function throwMessage() {
            window.parent.parent.postMessage({ message: "sendCompanyData", value: data }, "*")
        }
        // Clear any errors from previous updates
        this.clearErrors(queryResponse.fields);




        while (this.__tableBody.firstChild) {
            this.__tableBody.removeChild(this.__tableBody.firstChild)
        }

        while (this.__title_button__wrapper.firstChild) {
            this.__title_button__wrapper.removeChild(this.__title_button__wrapper.firstChild)
        }

        // Throw some errors and exit if the shape of the data isn't what this chart needs
        if (queryResponse.fields.dimensions.length == 0) {
            this.addError({ title: "No Dimensions", message: "This chart requires dimensions." });
            return;
        }

        var title = this.__title_button__wrapper.appendChild(document.createElement('h2'))
        title.innerHTML = 'Company & Intent'
        title.className = "chart-title"
        this.__button = this.__title_button__wrapper.appendChild(document.createElement('button'))
        this.__button.innerHTML = "REQUEST CONTACTS"
        this.__button.className = "chart-function-button"

        this.__button.addEventListener('click', throwMessage, true)

        // Grab the first cell of the data
        data.map((row) => {
            const rowEl = this.__tableBody.appendChild(document.createElement("tr"))
            const rowName = row["dim_zi_company_entities.zi_c_company_name"]
            const tdCompanyName__rowLocation = rowEl.appendChild(document.createElement("td"))
            const wrapperForNameLocation = tdCompanyName__rowLocation.appendChild(document.createElement('div'))
            wrapperForNameLocation.className = "name-location__wrapper"
            const rowCity = row["dim_zi_company_entities.zi_c_hq_city"].value
            const rowStateAbbr = abbrState(row["dim_zi_company_entities.zi_c_hq_state"].value, 'abbr')
            const tdCompanyNameHalf = wrapperForNameLocation.appendChild(document.createElement('div'))
            const companyNameName = tdCompanyNameHalf.appendChild(document.createElement('h2'))
            companyNameName.innerHTML = LookerCharts.Utils.htmlForCell(rowName);
            companyNameName.className = "company-name"
            const tdLocaleNumberHalf = wrapperForNameLocation.appendChild(document.createElement('div'))
            const tdLocaleNumberHalf__locale = tdLocaleNumberHalf.appendChild(document.createElement('div'))
            tdLocaleNumberHalf__locale.innerHTML = `<span>${rowCity}, ${rowStateAbbr}</span>`
            tdLocaleNumberHalf.className = "locale-number__wrapper"
            const tdLocaleNumberHalf__number = tdLocaleNumberHalf.appendChild(document.createElement('div'))
            const companyID = row["dim_zi_company_entities.zi_c_company_id"].value
            tdLocaleNumberHalf__number.innerHTML = `<span>${companyID}</span>`

            const tdCompanyWebsite = rowEl.appendChild(document.createElement("td"))
            const companyWebsiteWrapper = tdCompanyWebsite.appendChild(document.createElement('div'))
            companyWebsiteWrapper.className = "company-website"
            const rowWebsite = row["dim_zi_company_entities.zi_c_company_url"].value
            companyWebsiteWrapper.innerHTML = `<span>${rowWebsite}</span>`

            const tdCompanyDescription = rowEl.appendChild(document.createElement("td"))
            const companyDescriptionWrapper = tdCompanyDescription.appendChild(document.createElement('div'))
            companyDescriptionWrapper.className = "company-description"
            //const rowDescription = row["dim_zi_company_entities.zi_c_company_url"].value
            companyDescriptionWrapper.innerHTML = `<span>${"[Company Description]"}</span>`

            const tdCompanyTopic = rowEl.appendChild(document.createElement("td"))
            const companyTopicWrapper = tdCompanyTopic.appendChild(document.createElement('div'))
            companyTopicWrapper.className = "topics-wrapper"
            const tdCompanyTopic_topicHalf = companyTopicWrapper.appendChild(document.createElement('div'))
            const tdCompanyTopic_moreTopicsHalf = companyTopicWrapper.appendChild(document.createElement('div'))
            const rowTopic = row["dim_zi_intent_by_entity_topic.topic"].value
            const rowMoreTopics = row["dim_zi_intent_by_entity_topic.company_topic_count"].value
            tdCompanyTopic_topicHalf.innerHTML = `<span>${rowTopic}</span>`
            tdCompanyTopic_topicHalf.className = "company-topic"
            tdCompanyTopic_moreTopicsHalf.innerHTML = rowMoreTopics > 1 ? `<span>+${(rowMoreTopics - 1)} more topics</span>` : ""
            tdCompanyTopic_moreTopicsHalf.className = "company-more-topics"
            const companyIntent = numberWithCommas(Math.round(row["dim_zi_intent_by_entity_topic.monthly_intent_12_mos"].value))
            const tdCompanyMonthlyIntent = rowEl.appendChild(document.createElement("td"))
            const companyIntentEl = tdCompanyMonthlyIntent.appendChild(document.createElement("div"))
            companyIntentEl.innerHTML = `<span>${companyIntent}</span>`
            companyIntentEl.className = "company-intent"
            const rowRevenueRange = row["dim_zi_company_entities.zi_c_company_revenue_range"].value
            const tdRevenueRange = rowEl.appendChild(document.createElement("td"))
            const revenueRangeEl = tdRevenueRange.appendChild(document.createElement("div"))
            revenueRangeEl.innerHTML = `<span>${rowRevenueRange}</span>`
            revenueRangeEl.className = "revenue-range"
            const rowEmployeeRange = row["dim_zi_company_entities.zi_c_company_employee_range"].value
            const tdEmployeeRange = rowEl.appendChild(document.createElement("td"))
            const employeeRangeEl = tdEmployeeRange.appendChild(document.createElement("div"))
            employeeRangeEl.innerHTML = `<span>${rowEmployeeRange}</span>`
            employeeRangeEl.className = "employee-range"
            const isB2B = (row["dim_zi_company_entities.zi_c_is_b2_b"].value) == "Yes"
            const isB2C = (row["dim_zi_company_entities.zi_c_is_b2_c"].value) == "Yes"
            const rowBusinessType = (isB2B && isB2C ? "B2C&B2B" : (isB2B ? "B2B" : "B2C"))
            const tdBusinessType = rowEl.appendChild(document.createElement("td"))
            const businessTypeEl = tdBusinessType.appendChild(document.createElement("div"))
            businessTypeEl.innerHTML = `<span>${rowBusinessType}</span>`
            businessTypeEl.className = "business-type"
        })

        // We are done rendering! Let Looker know.
        done()
    }
});
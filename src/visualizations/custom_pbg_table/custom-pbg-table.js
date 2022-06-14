function groupBy(arr, property) {
    return arr.reduce(function(memo, x) {
        if (!memo[x[property].rendered]) { 
            memo[x[property].rendered] = []; 
        }
        memo[x[property].rendered].push(x);
        return memo;
    }, {});
}

function numberWithCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

function getAverage(arr, property) {
    const average = (arr.reduce((accumulator, object) => accumulator + object[property].value, 0) / arr.length)
    console.log(arr[0][property].rendered)
    var avgSymb = () => {
        if(!arr[0][property].rendered) {
            return "";
        }
        if((arr[0][property].rendered).includes('$')) {
            return '$' + numberWithCommas(average.toFixed(0))
        } else if((arr[0][property].rendered).includes('%')) {
            return (average * 100).toFixed(1) + '%'
        } else if((arr[0][property].rendered).includes('x')) {
            return average.toFixed(1) + 'x'
        } else {
            return average.toFixed(1)
        }
    }

    return avgSymb()
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
                color: #fff;
                text-align:left;
                background-color: #595958;
                padding: 8px;
                text-align: left; 
                vertical-align: middle;
            }

            .thrive-table thead tr th:not(:first-child) {
                font: 16px/20px Helvetica;
                color: #fff;
                text-align:left;
                background-color: #595958;
                padding: 8px;
                text-align: center; 
                vertical-align: middle;
                border-left: 2px solid #fff
            }

            td {
                height: inherit;
                border-left: none;
                border-right: none;
                border-top: none;
                padding: 5px;
                font: 16px/20px Helvetica;
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

            tbody > tr > td:first-child: {
                border-bottom: none;
                border-top: none;
            }

            tbody tr {
                background-color: #eeeeee
            }

            tbody tr:nth-child(even) {
                background-color: #ffffff;
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

            .subtotal-row {
                border-top: 1px solid black;
            }

            .subtotal-row td {
                font-weight: bold;
                font-style: italic;
            }

            tr.last {
                border-bottom: 1px solid black;
            }
        </style>
      `;

        // Create a container element to let us center the text.
        var table = element.appendChild(document.createElement("table"));
        table.className = "thrive-table";
        //table.border = 1
        var tableHead = table.appendChild(document.createElement("thead"))

        var tableHeadRow = tableHead.appendChild(document.createElement("tr"))

        const columnNames = [
            "REV Growth '21-'22 Bin", 
            "Name", "Market Cap ($M)", 
            "TEV ($M)", 
            "Share Price (Last Close)", 
            "Share Price (% of 52W High)", 
            "TEV / REV Run Rate",
            "TEV / REV '22E",
            "TEV / REV '23E",
            "1 Yr. Fwd REV Growth",
            "EBIDTA Margin (CY '22E)",
            "Rule of 40",
            "S&M Payback (Months)"
        ]

        for(let i = 0; i < columnNames.length; i++) {
            var thCol = tableHeadRow.appendChild(document.createElement("th"));
            thCol.innerHTML = columnNames[i]
        }
        
        this.__tableBody = table.appendChild(document.createElement("tbody"))

    },
    // Render in response to the data or settings changing
    updateAsync: function (data, element, config, queryResponse, details, done) {

        // Clear any errors from previous updates
        this.clearErrors(queryResponse.fields);

        this.__tableBody.innerHTML = "";


        // Throw some errors and exit if the shape of the data isn't what this chart needs
        if (queryResponse.fields.dimensions.length == 0) {
            this.addError({ title: "No Dimensions", message: "This chart requires dimensions." });
            return;
        }

        console.log(queryResponse)

        var queryNames = [
            "current_company_metrics.revenue_growth_bin",
            "current_company_metrics.companyname",
            "current_company_metrics._marketcap",
            "current_company_metrics._tev",
            "current_company_metrics._share_price",
            "current_company_metrics._share_price_of_52",
            "current_company_metrics.tev_revenue_run_rate_metric",
            "current_company_metrics.tev_revenue_2022E_metric",
            "current_company_metrics.tev_revenue_2023E_metric",
            "current_company_metrics._revenue_growth_yoy_fwd",
            "current_company_metrics.EBIDTA_2022_cy_est_margin",
            "current_company_metrics.rule_of_40",
            "current_company_metrics.sm_payback"
        ]

        var groupedData = groupBy(data, "current_company_metrics.revenue_growth_bin")
        var groupedArrays = Object.values(groupedData)

        console.log(groupedArrays)

        for (let k = 0; k < groupedArrays.length; k++) {
            groupedArrays[k].map((row, index) => {

                const newRow = this.__tableBody.appendChild(document.createElement("tr"))
                for(var i = 0; i < queryNames.length; i++) {
                    const tdCol = newRow.appendChild(document.createElement("td"))
                    if((i === 0 && index === 0) || (i !== 0)) {
                        if(row[queryNames[i]].rendered) {
                            tdCol.innerHTML = row[queryNames[i]].rendered
                        } else {
                            tdCol.innerHTML = row[queryNames[i]].value
                        }
                    } else {
                        tdCol.innerHTML = ""
                    }
                }

                if(index === groupedArrays[k].length - 1) {
                    newRow.className = "last"
                }
            })

            const subtotalRow = this.__tableBody.appendChild(document.createElement("tr"))
            subtotalRow.className = "subtotal-row"
            const doubleCol = subtotalRow.appendChild(document.createElement("td"))
            doubleCol.colSpan = "2"
            doubleCol.innerHTML = "Group Average"

            for(let s = 2; s < queryNames.length; s++) {
                const subTd = subtotalRow.appendChild(document.createElement("td"))
                subTd.innerHTML = getAverage(groupedArrays[k], queryNames[s])
            }
        }

        

        

        // We are done rendering! Let Looker know.
        done()
    }
});
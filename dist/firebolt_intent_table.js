!function(e,n){"object"==typeof exports&&"object"==typeof module?module.exports=n():"function"==typeof define&&define.amd?define([],n):"object"==typeof exports?exports.firebolt_intent_table=n():e.firebolt_intent_table=n()}(window,(function(){return function(e){var n={};function t(a){if(n[a])return n[a].exports;var i=n[a]={i:a,l:!1,exports:{}};return e[a].call(i.exports,i,i.exports,t),i.l=!0,i.exports}return t.m=e,t.c=n,t.d=function(e,n,a){t.o(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:a})},t.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},t.t=function(e,n){if(1&n&&(e=t(e)),8&n)return e;if(4&n&&"object"==typeof e&&e&&e.__esModule)return e;var a=Object.create(null);if(t.r(a),Object.defineProperty(a,"default",{enumerable:!0,value:e}),2&n&&"string"!=typeof e)for(var i in e)t.d(a,i,function(n){return e[n]}.bind(null,i));return a},t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},t.p="",t(t.s=5)}({5:function(e,n){looker.plugins.visualizations.add({id:"thrive_table",label:"Company Detail",options:{font_size:{type:"string",label:"Font Size",values:[{Large:"large"},{Small:"small"}],display:"radio",default:"large"}},create:function(e,n){e.innerHTML="\n        <style>\n            * {\n              box-sizing: border-box;\n            }\n\n            html, body, #vis {\n              height: 100%;\n              margin: 0;\n              padding: 0;\n              border: none;\n            }\n\n            #vis {\n              height: 100%;\n              width: 100%;\n              margin: 0;\n              padding-left: 22px;\n              padding-right: 22px;\n            }\n\n            .thrive-table {\n                width: 100%;\n                border-collapse: collapse;\n                border-left: none;\n                border-right: none;\n                border-top: 1px solid #CFD0CF;\n                padding: 20px\n            }\n\n            .thrive-table thead tr th {\n                font: 12px/16px Helvetica;\n                color: #727171;\n                text-align:left\n            }\n            .company-name {\n                font: 14px/16px Helvetica;\n                font-weight: 700;\n                margin: 0;\n                margin-bottom: 11px\n            }\n            .locale-number__wrapper {\n                font: 10px/9px Helvetica;\n                font-weight: 700;\n                margin-top: auto;\n                display: flex;\n                justify-content: space-between;\n            }\n            .company-topic {\n                font: 14px/16px Helvetica;\n            }\n\n            .company-more-topics {\n                font: 10px/9px Helvetica;\n                color: #A1A1A1;\n                font-weight: 700;\n                margin-top: auto;\n            }\n\n            .topics-wrapper {\n                display: flex;\n                flex-flow: column;\n            }\n\n            .name-location__wrapper {\n                display: flex;\n                flex-flow: column;\n            }\n            tr {\n                height: 1px\n            }\n            td > div {\n                padding-top: 10px;\n                padding-bottom: 10px;\n                height: 100%          \n            }\n\n            td {\n                height: inherit;\n                border-left: none;\n                border-right: none;\n                border-top: none\n            }\n\n            \n\n            tbody tr {\n                border-bottom: 1px solid #CFD0CF;\n                border-left: none;\n                border-right: none;\n                border-top: none;\n            }\n\n            thead, thead tr th, thead tr {\n                border: none\n            }\n\n            th > div {\n                padding-bottom: 11px;\n                padding-top: 12px;\n                border-bottom: 1px solid #CFD0CF;\n                height: 100%\n            }\n\n            th {\n                height: inherit;\n            }\n\n            th:not(:last-child) > div {\n                margin-right: 50px;\n            }\n\n            td:not(:last-child) > div {\n                margin-right: 50px;\n            }\n\n            .company-intent, .revenue-range, .employee-range, .business-type {\n                font: 14px/16px Helvetica;\n            }\n\n            table {\n                padding-left: 22px\n            }\n\n            .table-function__wrapper {\n                display: flex;\n                flex-flow: row;\n                justify-content: space-between;\n                align-items: center;\n            }\n\n            .chart-title {\n                font: 20px/25px Helvetica;\n            }\n\n            .chart-function-button {\n                color: #fff;\n                font: 14px/20px Helvetica;\n                padding: 10px 20px;\n                border: none;\n                background-color: #BC3733;\n                height: fit-content;\n                cursor: pointer\n            }\n        </style>\n      ",this.__title_button__wrapper=e.appendChild(document.createElement("div")),this.__title_button__wrapper.className="table-function__wrapper";var t=e.appendChild(document.createElement("table"));t.className="thrive-table",t.border=1;var a=t.appendChild(document.createElement("thead")).appendChild(document.createElement("tr"));a.appendChild(document.createElement("th")).appendChild(document.createElement("div")).innerHTML="Company Name",a.appendChild(document.createElement("th")).appendChild(document.createElement("div")).innerHTML="Topic",a.appendChild(document.createElement("th")).appendChild(document.createElement("div")).innerHTML="Monthly Intent (12 mo)",a.appendChild(document.createElement("th")).appendChild(document.createElement("div")).innerHTML="Revenue Range",a.appendChild(document.createElement("th")).appendChild(document.createElement("div")).innerHTML="Employee Range",a.appendChild(document.createElement("th")).appendChild(document.createElement("div")).innerHTML="Business Type",this.__tableBody=t.appendChild(document.createElement("tbody"))},updateAsync:function(e,n,t,a,o,r){var d=this;for(this.clearErrors(a.fields);this.__tableBody.firstChild;)this.__tableBody.removeChild(this.__tableBody.firstChild);for(;this.__title_button__wrapper.firstChild;)this.__title_button__wrapper.removeChild(this.__title_button__wrapper.firstChild);if(0!=a.fields.dimensions.length){var l=this.__title_button__wrapper.appendChild(document.createElement("h2"));l.innerHTML="Company & Intent",l.className="chart-title",this.__button=this.__title_button__wrapper.appendChild(document.createElement("button")),this.__button.innerHTML="REQUEST CONTACTS",this.__button.className="chart-function-button",this.__button.addEventListener("click",(function(){window.parent.parent.postMessage({message:"sendCompanyData",value:e},"*")}),!0),e.map((function(e){var n=d.__tableBody.appendChild(document.createElement("tr")),t=e["dim_zi_company_entities.zi_c_company_name"],a=n.appendChild(document.createElement("td")).appendChild(document.createElement("div"));a.className="name-location__wrapper";var o=e["dim_zi_company_entities.zi_c_hq_city"].value,r=function(e,n){var t=[["Arizona","AZ"],["Alabama","AL"],["Alaska","AK"],["Arkansas","AR"],["California","CA"],["Colorado","CO"],["Connecticut","CT"],["Delaware","DE"],["Florida","FL"],["Georgia","GA"],["Hawaii","HI"],["Idaho","ID"],["Illinois","IL"],["Indiana","IN"],["Iowa","IA"],["Kansas","KS"],["Kentucky","KY"],["Louisiana","LA"],["Maine","ME"],["Maryland","MD"],["Massachusetts","MA"],["Michigan","MI"],["Minnesota","MN"],["Mississippi","MS"],["Missouri","MO"],["Montana","MT"],["Nebraska","NE"],["Nevada","NV"],["New Hampshire","NH"],["New Jersey","NJ"],["New Mexico","NM"],["New York","NY"],["North Carolina","NC"],["North Dakota","ND"],["Ohio","OH"],["Oklahoma","OK"],["Oregon","OR"],["Pennsylvania","PA"],["Rhode Island","RI"],["South Carolina","SC"],["South Dakota","SD"],["Tennessee","TN"],["Texas","TX"],["Utah","UT"],["Vermont","VT"],["Virginia","VA"],["Washington","WA"],["West Virginia","WV"],["Wisconsin","WI"],["Wyoming","WY"],["District Of Columbia","DC"]];for(e=e.replace(/\w\S*/g,(function(e){return e.charAt(0).toUpperCase()+e.substr(1).toLowerCase()})),i=0;i<t.length;i++)if(t[i][0]==e)return t[i][1]}(e["dim_zi_company_entities.zi_c_hq_state"].value),l=a.appendChild(document.createElement("div")).appendChild(document.createElement("h2"));l.innerHTML=LookerCharts.Utils.htmlForCell(t),l.className="company-name";var p=a.appendChild(document.createElement("div"));p.appendChild(document.createElement("div")).innerHTML="<span>".concat(o,", ").concat(r,"</span>"),p.className="locale-number__wrapper";var c=p.appendChild(document.createElement("div")),s=e["dim_zi_company_entities.zi_c_company_id"].value;c.innerHTML="<span>".concat(s,"</span>");var m=n.appendChild(document.createElement("td")).appendChild(document.createElement("div"));m.className="topics-wrapper";var u=m.appendChild(document.createElement("div")),_=m.appendChild(document.createElement("div")),h=e["dim_zi_intent_by_entity_topic.topic"].value,f=e["dim_zi_intent_by_entity_topic.company_topic_count"].value;u.innerHTML="<span>".concat(h,"</span>"),u.className="company-topic",_.innerHTML=f>1?"<span>+".concat(f-1," more topics</span>"):"",_.className="company-more-topics";var b,v=((b=Math.round(e["dim_zi_intent_by_entity_topic.monthly_intent_12_mos"].value).toString().split("."))[0]=b[0].replace(/\B(?=(\d{3})+(?!\d))/g,","),b.join(".")),y=n.appendChild(document.createElement("td")).appendChild(document.createElement("div"));y.innerHTML="<span>".concat(v,"</span>"),y.className="company-intent";var C=e["dim_zi_company_entities.zi_c_company_revenue_range"].value,g=n.appendChild(document.createElement("td")).appendChild(document.createElement("div"));g.innerHTML="<span>".concat(C,"</span>"),g.className="revenue-range";var x=e["dim_zi_company_entities.zi_c_company_employee_range"].value,E=n.appendChild(document.createElement("td")).appendChild(document.createElement("div"));E.innerHTML="<span>".concat(x,"</span>"),E.className="employee-range";var M="Yes"==e["dim_zi_company_entities.zi_c_is_b2_b"].value,w="Yes"==e["dim_zi_company_entities.zi_c_is_b2_c"].value,N=M&&w?"B2C&B2B":M?"B2B":"B2C",T=n.appendChild(document.createElement("td")).appendChild(document.createElement("div"));T.innerHTML="<span>".concat(N,"</span>"),T.className="business-type"})),r()}else this.addError({title:"No Dimensions",message:"This chart requires dimensions."})}})}})}));
!function(e,n){"object"==typeof exports&&"object"==typeof module?module.exports=n():"function"==typeof define&&define.amd?define([],n):"object"==typeof exports?exports.custom_intent_synopsis=n():e.custom_intent_synopsis=n()}(window,(function(){return function(e){var n={};function t(l){if(n[l])return n[l].exports;var i=n[l]={i:l,l:!1,exports:{}};return e[l].call(i.exports,i,i.exports,t),i.l=!0,i.exports}return t.m=e,t.c=n,t.d=function(e,n,l){t.o(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:l})},t.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},t.t=function(e,n){if(1&n&&(e=t(e)),8&n)return e;if(4&n&&"object"==typeof e&&e&&e.__esModule)return e;var l=Object.create(null);if(t.r(l),Object.defineProperty(l,"default",{enumerable:!0,value:e}),2&n&&"string"!=typeof e)for(var i in e)t.d(l,i,function(n){return e[n]}.bind(null,i));return l},t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},t.p="",t(t.s=37)}({37:function(e,n){function t(e){var n=e.toString().split(".");return n[0]=n[0].replace(/\B(?=(\d{3})+(?!\d))/g,","),n.join(".")}looker.plugins.visualizations.add({id:"hello_world",label:"Hello World",options:{font_size:{type:"string",label:"Font Size",values:[{Large:"large"},{Small:"small"}],display:"radio",default:"large"}},create:function(e,n){e.innerHTML="\n        <style>\n\n            @import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');\n            @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap');\n\n            * {\n              box-sizing: border-box;\n            }\n\n            html, body, #vis {\n              height: 100%;\n              margin: 0;\n              padding: 0;\n              border: none;\n            }\n\n            #vis {\n              height: 100%;\n              width: 100%;\n              margin: 0\n            }\n\n            .hello-world-vis {\n                /* Vertical centering */\n                height: 100%;\n                display: flex;\n                flex-flow: row nowrap;\n                justify-content: space-around;\n                align-items: center;\n                font: 47px/59px 'Roboto', sans-serif;\n                padding: 20px;\n            }\n            .hello-world-vis > div {\n                flex: 1 1 0;\n                display: flex;\n            }\n            .centered-block {\n              display: flex;\n              justify-content: center\n            }\n            .centered-block > div {\n              width: fit-content\n            }\n            .hello-world-vis > div > *:not(:last-child) {\n                margin-bottom: 10px\n            }\n            .inner-block__title h2 {\n                font: 16px/20px 'Roboto', sans-serif;\n                font-weight: 400 !important;\n                margin: 0;\n            }\n\n            .inner-block__value h3 {\n                font: 47px/59px 'Roboto', sans-serif;\n                font-weight: 400 !important;\n                margin: 0;\n            }\n\n            .inner-block__subtitle h5 {\n                font: 14px/20px 'Roboto Mono', monospace;\n                font-weight: 400 !important;\n                margin: 0;\n                color: #898889;\n            }\n        </style>\n      ";var t=e.appendChild(document.createElement("div"));t.className="hello-world-vis",this._blockElement1=t.appendChild(document.createElement("div")),this._blockElement2=t.appendChild(document.createElement("div")),this._blockElement3=t.appendChild(document.createElement("div")),this._blockElement1.className="centered-block",this._blockElement2.className="centered-block",this._blockElement3.className="centered-block",this._blockElement1Main=this._blockElement1.appendChild(document.createElement("div")),this._blockElement2Main=this._blockElement2.appendChild(document.createElement("div")),this._blockElement3Main=this._blockElement3.appendChild(document.createElement("div")),this._blockElement1TitleWrapper=this._blockElement1Main.appendChild(document.createElement("div")),this._blockElement2TitleWrapper=this._blockElement2Main.appendChild(document.createElement("div")),this._blockElement3TitleWrapper=this._blockElement3Main.appendChild(document.createElement("div")),this._blockElement1TitleWrapper.className="inner-block__title",this._blockElement2TitleWrapper.className="inner-block__title",this._blockElement3TitleWrapper.className="inner-block__title",this._blockElement1TitleWrapper.innerHTML="<h2>Companies with Intent</h2>",this._blockElement2TitleWrapper.innerHTML="<h2>Avg Company Intent</h2>",this._blockElement3TitleWrapper.innerHTML="<h2>Avg HQ Headcount</h2>",this._blockElement1ValueWrapper=this._blockElement1Main.appendChild(document.createElement("div")),this._blockElement2ValueWrapper=this._blockElement2Main.appendChild(document.createElement("div")),this._blockElement3ValueWrapper=this._blockElement3Main.appendChild(document.createElement("div")),this._blockElement1ValueWrapper.className="inner-block__value",this._blockElement2ValueWrapper.className="inner-block__value",this._blockElement3ValueWrapper.className="inner-block__value",this._blockElement1SubtitleWrapper=this._blockElement1Main.appendChild(document.createElement("div")),this._blockElement2SubtitleWrapper=this._blockElement2Main.appendChild(document.createElement("div")),this._blockElement3SubtitleWrapper=this._blockElement3Main.appendChild(document.createElement("div")),this._blockElement1SubtitleWrapper.className="inner-block__subtitle",this._blockElement2SubtitleWrapper.className="inner-block__subtitle",this._blockElement3SubtitleWrapper.className="inner-block__subtitle"},updateAsync:function(e,n,l,i,o,r){this.clearErrors(i.fields),0!=i.fields.measures.length?(this._blockElement1ValueWrapper.innerHTML="<h3>".concat(t(Math.round(e[0]["dim_zi_intent_metrics.companies_with_intent"].value)),"</h3>"),this._blockElement2ValueWrapper.innerHTML="<h3>".concat(t(Math.round(e[0]["dim_zi_intent_metrics.monthly_intent_12_mos_per_company"].value)),"</h3>"),this._blockElement3ValueWrapper.innerHTML="<h3>".concat(t(Math.round(e[0]["dim_zi_company_entities.average_zi_c_company_employees"].value)),"</h3>"),this._blockElement1SubtitleWrapper.innerHTML="<h5>Total Locations: ".concat(t(Math.round(e[0]["dim_zi_company_entities.total_zi_c_num_locations"].value)),"</h5>"),this._blockElement2SubtitleWrapper.innerHTML="<h5>Total Intent: ".concat(t(Math.round(e[0]["dim_zi_intent_metrics.monthly_intent_12_mos"].value)),"</h5>"),this._blockElement3SubtitleWrapper.innerHTML="<h5>Avg HQ Annual Revenue (K): ".concat(t(Math.round(e[0]["dim_zi_company_entities.avg_company_revenue"].value)),"</h5>"),r()):this.addError({title:"No Measures",message:"This chart requires measures."})}})}})}));
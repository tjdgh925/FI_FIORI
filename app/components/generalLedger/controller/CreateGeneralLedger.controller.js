sap.ui.define(['sap/ui/core/mvc/Controller',
"sap/ui/model/Filter",
"sap/ui/model/FilterOperator",
"sap/ui/model/Sorter",
"sap/ui/core/Fragment",
"sap/ui/model/json/JSONModel",
"sap/ui/export/Spreadsheet",
"sap/ui/export/library" ], function (Controller, Filter, FilterOperator, Sorter, Fragment, JSONModel, Spreadsheet, library) {
    'use strict';
  
    return Controller.extend('projectGL.controller.CreateGeneralLedger', {
      // onBack: function () {

      //   this.getOwnerComponent().getRouter().navTo("GeneralLedger");
      // },
  
      onCreate: async function () {

        var temp = {
          GL_CODE: this.byId("GL_CODE").getValue(),
          GL_COA: this.byId("GL_COA").getValue(),
          GL_ACCOUNTTYPE: this.byId("GL_ACCOUNTTYPE").getValue(),
          GL_ACCOUNTGROUP: this.byId("GL_ACCOUNTGROUP").getValue(),
          GL_PL_ACCOUNTTYPE: this.byId("GL_PL_ACCOUNTTYPE").getValue(),
          GL_NAME: this.byId("GL_NAME").getValue(),
          GL_DESCRIPTION: this.byId("GL_DESCRIPTION").getValue(),
          GL_TRADINGPARTNER: this.byId("GL_TRADINGPARTNER").getValue(),
        }
        console.log(temp);
        await $.ajax({
          type: "POST",
          url: "/general-ledger/GL",
          contentType: "application/json;IEEE754Compatible=true",
          data: JSON.stringify(temp)
        });
        // this.onBack();
        this.onReset();
      },

      onReset: function () {
        this.byId("GL_CODE").setValue("");
        this.byId("GL_COA").setValue("");
        this.byId("GL_ACCOUNTTYPE").setValue("");
        this.byId("GL_ACCOUNTGROUP").setValue("");
        this.byId("GL_PL_ACCOUNTTYPE").setValue("");
        this.byId("GL_NAME").setValue("");
        this.byId("GL_DESCRIPTION").setValue("");
        this.byId("GL_TRADINGPARTNER").setValue("");
  
      },
  
    });
  });
  
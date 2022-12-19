sap.ui.define([
      "sap/ui/core/mvc/Controller",
      "sap/base/Log",
      "sap/ui/model/json/JSONModel",
      "sap/m/MessageToast",
      "sap/ui/core/format/DateFormat",
      "sap/ui/thirdparty/jquery"
  
  
  ], function (Controller, Log, JSONModel, MessageToast, DateFormat, jQuery) {
    'use strict';
  
    return Controller.extend('projectBP.controller.MassCreateBusinessPartner_organization', {
      onInit() {
              // // set explored app's demo model on this sample
              var oJSONModel = {
          MassCollection_organization:[
            {
              "Id": "",
              "Name" : ""
            },
            // {
            //   "Id": "",
            //   "Name" : ""
            // },
            // {
            //   "Id": "",
            //   "Name" : ""
            // },
            // {
            //   "Id": "",
            //   "Name" : ""
            // },
            // {
            //   "Id": "",
            //   "Name" : ""
            // },
            // {
            //   "Id": "",
            //   "Name" : ""
            // },
            // {
            //   "Id": "",
            //   "Name" : ""
            // },
            // {
            //   "Id": "",
            //   "Name" : ""
            // },
            // {
            //   "Id": "",
            //   "Name" : ""
            // }
          ]
        };
              this.getView().setModel(new JSONModel(oJSONModel));
      },


      onBack: function(){
        this.getOwnerComponent().getRouter().navTo("BusinessPartner");
    }
  
  
    });
  });
  
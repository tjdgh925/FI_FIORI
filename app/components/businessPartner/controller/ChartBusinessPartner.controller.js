sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"],
  function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("projectBP.controller.ChartBusinessPartner", {
      onInit() {
        var oData = {
          First: 0,
          Second: 0,
          Third: 0,
          Others: 0,
        };
        var oModel = new JSONModel(oData);
        this.getView().setModel(oModel, "BP_COUNTRY_REGION");
        this.onDataView();
      },

      onBusinessPartnerHome: function () {
        this.getOwnerComponent().getRouter().navTo("BusinessPartnerHome");
      },

      onDataView: async function () {
        var view = this.getView();

        const BusinessPartner = await $.ajax({
          type: "get",
          url: "/business-partner/BP?$apply=groupby((BP_COUNTRY),aggregate($count%20as%20COUNT))&$orderby=COUNT%20desc&$top=4",
        });

        let BusinessPartnerModel = new JSONModel(BusinessPartner.value);
        view.setModel(BusinessPartnerModel, "BusinessPartnerModel");
        var dataArr = BusinessPartner.value;

        let a = 0.0,
          b = 0.0,
          c = 0.0,
          d = 0.0;
        
        for (const data in dataArr) {
          if (dataArr[data].BP_COUNTRY === "") d = dataArr[data].COUNT;
          if (dataArr[data].BP_COUNTRY === "KR") a = dataArr[data].COUNT;
          if (dataArr[data].BP_COUNTRY === "JP") b = dataArr[data].COUNT;
          if (dataArr[data].BP_COUNTRY === "CN") c = dataArr[data].COUNT;
        }

        view.getModel("BP_COUNTRY_REGION").setProperty("/First", a  );
        view.getModel("BP_COUNTRY_REGION").setProperty("/Second", b);
        view.getModel("BP_COUNTRY_REGION").setProperty("/Third", c);
        view.getModel("BP_COUNTRY_REGION").setProperty("/Others", d);
        view.getModel("BP_COUNTRY_REGION").setProperty("/Sum", (a + b + c + d));

        
      },
    });
  }
);

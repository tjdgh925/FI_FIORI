sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"],
  function (Controller, JSONModel) {
    "use strict";
    return Controller.extend("projectBP.controller.ChartBusinessPartner", {
      onInit() {
        this.getOwnerComponent()
          .getRouter()
          .getRoute("ChartBusinessPartner")
          .attachPatternMatched(this.onMyRoutePatternMatched, this);
      },
      onMyRoutePatternMatched: function () {
        var oData = {
          0: 0,
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          others: 0,
        };
        var oDataLabel = {
          0: "",
          1: "",
          2: "",
          3: "",
          4: "",
          others: 0,
        };
        var oDataPercent = {
          0: 0.0,
          1: 0.0,
          2: 0.0,
          3: 0.0,
          4: 0.0,
          others: 0.0,
        };
        var oModel = new JSONModel(oData);
        var oModelLabel = new JSONModel(oDataLabel);
        var oModelPercent = new JSONModel(oDataPercent);

        this.getView().setModel(oModel, "BP_COUNTRY_REGION");
        this.getView().setModel(oModelLabel, "BP_COUNTRY_REGION_LABEL");
        this.getView().setModel(oModelPercent, "BP_COUNTRY_REGION_PERCENT");
        this.onDataView();
      },

      onBusinessPartnerHome: function () {
        this.getOwnerComponent().getRouter().navTo("BusinessPartnerHome");
      },

      onDataView: async function () {
        var view = this.getView();

        const BusinessPartner = await $.ajax({
          type: "get",
          url: "/business-partner/BP?$apply=groupby((BP_COUNTRY),aggregate($count%20as%20COUNT))&$orderby=COUNT%20desc",
        });

        let BusinessPartnerModel = new JSONModel(BusinessPartner.value);
        view.setModel(BusinessPartnerModel, "BusinessPartnerModel");
        var dataArr = BusinessPartner.value;
        var labelArr = dataArr.map((data) => {
          return data.BP_COUNTRY;
        });
        var countArr = dataArr.map((data) => {
          return data.COUNT;
        });
        var countrySum = 0;
        var countryCnt = dataArr.length;

        for (let i = 0; i < countArr.length; i++) {
          countrySum += countArr[i];
        }
        console.log(dataArr);
        console.log(labelArr);
        console.log(countArr);
        console.log(countryCnt);

        for (let i = 0; i < dataArr.length; i++) {
          if (i <= 4) {
            var index = "/" + i;
            view.getModel("BP_COUNTRY_REGION").setProperty(index, countArr[i]);
            view
              .getModel("BP_COUNTRY_REGION_LABEL")
              .setProperty(index, labelArr[i]);
            view
              .getModel("BP_COUNTRY_REGION_PERCENT")
              .setProperty(
                index,
                ((countArr[i] / countrySum) * 100).toFixed(2)
              );
          } else {
            var sum = view.getModel("BP_COUNTRY_REGION").getProperty("/others");
            sum += countArr[i];
            view.getModel("BP_COUNTRY_REGION").setProperty("/others", sum);
            var labelCnt = view
              .getModel("BP_COUNTRY_REGION_LABEL")
              .getProperty("/others");
            view
              .getModel("BP_COUNTRY_REGION_LABEL")
              .setProperty("/others", ++labelCnt);
          }
        }

        var sum = view.getModel("BP_COUNTRY_REGION").getProperty("/others");
        view
          .getModel("BP_COUNTRY_REGION_PERCENT")
          .setProperty("/others", ((sum / countrySum) * 100).toFixed(2));

        view.getModel("BP_COUNTRY_REGION").setProperty("/Sum", countryCnt);
      },
    });
  }
);

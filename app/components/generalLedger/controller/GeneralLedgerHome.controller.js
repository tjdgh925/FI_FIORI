sap.ui.define(["sap/ui/core/mvc/Controller",
"../model/formatter",
"sap/ui/model/json/JSONModel"


], function (Controller,formatter,JSONModel) {
  "use strict";

  return Controller.extend("projectGL.controller.GeneralLedgerHome", {
    formatter: formatter,
    onInit: async function () {
      this.getOwnerComponent()
        .getRouter()
        .getRoute("GeneralLedgerHome")
        .attachPatternMatched(this.onMyRoutePatternMatched, this);
    },
    onMyRoutePatternMatched: async function () {
      const GeneralLedger = await $.ajax({
        type: "get",
        url: "/general-ledger/GL?$orderby=GL_CODE desc&$top=5",
      });
      let GeneralLedgerModel = new JSONModel(GeneralLedger.value);
      this.getView().setModel(GeneralLedgerModel, "GeneralLedgerModel");
    },

    onDisplayGL: function () {
      this.getOwnerComponent().getRouter().navTo("GeneralLedger");
    },
    onCreateGL: function () {
      this.getOwnerComponent().getRouter().navTo("CreateGeneralLedger");
    },
   
    onTest: function (oEvent) {
      console.log(oEvent);
      // let mParams = oEvent.getParameters();
      console.log(oEvent.getSource());
      let sPath = oEvent.oSource.oBindingContexts.GeneralLedgerModel.sPath;
      // console.log(sPath);
      let data = this.getView()
        .getModel("GeneralLedgerModel")
        .getProperty(sPath);
      // console.log(data);

      let SelectedNum = data.GL_CODE;

      this.getOwnerComponent()
        .getRouter()
        .navTo("GeneralLedgerDetail", { num: SelectedNum });
      // console.log(SelectedNum);
    },
  });
});

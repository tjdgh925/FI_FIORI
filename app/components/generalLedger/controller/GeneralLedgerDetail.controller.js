sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/ui/export/Spreadsheet",
    "sap/ui/export/library",
  ],
  function (
    Controller,
    Filter,
    FilterOperator,
    Sorter,
    Fragment,
    JSONModel,
    Spreadsheet,
    library
  ) {
    "use strict";
    var SelectedNum;

    return Controller.extend("projectGL.controller.GeneralLedgerDetail", {
      onInit: async function () {
        var oData = { edit: false };
        var oModel = new JSONModel(oData);
        this.getView().setModel(oModel, "editModel");
        this.getOwnerComponent()
          .getRouter()
          .getRoute("GeneralLedgerDetail")
          .attachPatternMatched(this.onMyRoutePatternMatched, this);
      },

      onMyRoutePatternMatched: async function (oEvent) {
        this.onTest3();
        
        // console.log(oEvent);
        SelectedNum = oEvent.getParameter("arguments").num;
        let url = "/general-ledger/GL/" + SelectedNum;
        const GeneralLedger = await $.ajax({
          type: "get",
          url: url,
        });
        //console.log(GeneralLedger);
        let GeneralLedgerModel = new JSONModel(GeneralLedger);
        this.getView().setModel(GeneralLedgerModel, "GeneralLedgerModel");

        // //table용 데이터 모델에 저장
        let url2 = "/general-ledger/CompanyCode";
        const GeneralLedgerTable = await $.ajax({
          type: "get",
          url: url2,
        });
        let GeneralLedgerTableModel = new JSONModel(GeneralLedgerTable.value);
        this.getView().setModel(
          GeneralLedgerTableModel,
          "GeneralLedgerTableModel"
        );

      },

      onTest: async function () {
        //let temp = new JSONModel().oData;

        var temp = {
          GL_CODE: this.byId("GL_CODE").getText(),
          GL_COA: this.byId("GL_COA").getValue(),
          GL_ACCOUNTTYPE: this.byId("GL_ACCOUNTTYPE").getValue(),
          GL_ACCOUNTGROUP: this.byId("GL_ACCOUNTGROUP").getValue(),
          GL_PL_ACCOUNTTYPE: this.byId("GL_PL_ACCOUNTTYPE").getValue(),
          GL_NAME: this.byId("GL_NAME").getValue(),
          GL_DESCRIPTION: this.byId("GL_DESCRIPTION").getValue(),
          GL_TRADINGPARTNER: this.byId("GL_TRADINGPARTNER").getValue(),
        };

        this.byId("GL_COA").setValueState("None");
        this.byId("GL_ACCOUNTTYPE").setValueState("None");
        this.byId("GL_ACCOUNTGROUP").setValueState("None");
        this.byId("GL_NAME").setValueState("None");
        if (
          !temp.GL_COA ||
          !temp.GL_ACCOUNTTYPE ||
          !temp.GL_ACCOUNTGROUP ||
          !temp.GL_NAME
        ) {
          if (!temp.GL_COA) {
            this.byId("GL_COA").setValueState("Error");
            this.byId("GL_COA").setValueStateText("계정과목표를 입력해주세요.");
          }
          if (!temp.GL_ACCOUNTTYPE) {
            this.byId("GL_ACCOUNTTYPE").setValueState("Error");
            this.byId("GL_ACCOUNTTYPE").setValueStateText(
              "계정 유형을 입력해주세요."
            );
          }
          if (!temp.GL_ACCOUNTGROUP) {
            this.byId("GL_ACCOUNTGROUP").setValueState("Error");
            this.byId("GL_ACCOUNTGROUP").setValueStateText(
              "계정 그룹을 입력해주세요."
            );
          }
          if (!temp.GL_NAME) {
            this.byId("GL_NAME").setValueState("Error");
            this.byId("GL_NAME").setValueStateText("내역을 입력해주세요.");
          }
          return 0;
        }

        let url = "/general-ledger/GL/" + temp.GL_CODE;
        console.log(url);
        await $.ajax({
          type: "patch",
          url: url,
          contentType: "application/json;IEEE754Compatible=true",
          data: JSON.stringify(temp),
        });
        console.log(temp);

        this.onTest3();
        //await this.onUpdate(url,temp);
      },

      onTest2: function () {
        this.getView().getModel("editModel").setProperty("/edit", true);
      },

      onTest3: function () {
        this.getView().getModel("editModel").setProperty("/edit", false);
        //this.onReset();
                
        // this.byId("GL_COA").setText();
        // this.byId("GL_ACCOUNTTYPE").setText();
        
        // this.getView().getModel("editModel").setProperty("/edit", false );
        // this.getOwnerComponent().getRouter().navTo("Company");
      },
      onBack: function () {
        this.getOwnerComponent().getRouter().navTo("GeneralLedger");
      },
      // onReset: function () {
      //   this.byId("RejectReason").setValue("");
      // },
    });
  }
);

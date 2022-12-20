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

    return Controller.extend("projectGL.controller.CopyCreateGeneralLedger", {
      onInit: async function () {
        var oData = { edit: false };
        var oModel = new JSONModel(oData);
        this.getView().setModel(oModel, "editModel");
        this.getOwnerComponent()
          .getRouter()
          .getRoute("CopyCreateGeneralLedger")
          .attachPatternMatched(this.onMyRoutePatternMatched, this);
      },

      onMyRoutePatternMatched: async function (oEvent) {
        SelectedNum = oEvent.getParameter("arguments").num;
        let url = "/general-ledger/GL/" + SelectedNum;
        const GeneralLedger = await $.ajax({
          type: "get",
          url: url,
        });
        let GeneralLedgerModel = new JSONModel(GeneralLedger);
        this.getView().setModel(GeneralLedgerModel, "GeneralLedgerModel");


        let url2 = "/general-ledger/GL";
        const FullData = await $.ajax({
          type: "get",
          url: url2,
        });
        let FullDataModel = new JSONModel(FullData);
        this.getView().setModel(FullDataModel, "FullDataModel");
        console.log(FullDataModel);
        let CopyGL = Number(FullDataModel.oData.value[FullDataModel.oData.value.length - 1].GL_CODE) + 1;
        this.getView().byId("GL_CODE").setValue(CopyGL);
      

        //table용 데이터 모델에 저장
        let url3 = "/general-ledger/CompanyCode";
        const GeneralLedgerTable = await $.ajax({
          type: "get",
          url: url3,
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
          GL_CODE: this.byId("GL_CODE").getValue(),
          GL_COA: this.byId("GL_COA").getValue(),
          GL_ACCOUNTTYPE: this.byId("GL_ACCOUNTTYPE").getValue(),
          GL_ACCOUNTGROUP: this.byId("GL_ACCOUNTGROUP").getValue(),
          GL_PL_ACCOUNTTYPE: this.byId("GL_PL_ACCOUNTTYPE").getValue(),
          GL_NAME: this.byId("GL_NAME").getValue(),
          GL_DESCRIPTION: this.byId("GL_DESCRIPTION").getValue(),
          GL_TRADINGPARTNER: this.byId("GL_TRADINGPARTNER").getValue(),
        };

        //var temp는 그냥 뷰의 정보를 갖고 오는것.
        //처음(oninit)에 DB에서 정보를 받아오고, 그 정보를 (~~)Model에 저장 후 View 파일에 (임시)저장을 한다.
        //이러한 과정을 통해 결국 DB에서 데이터를 갖고오는것은 맞지만 Contorller->View->Contorller 순으로 이동한다.

        this.byId("GL_CODE").setValueState("None");
        this.byId("GL_COA").setValueState("None");
        this.byId("GL_ACCOUNTTYPE").setValueState("None");
        this.byId("GL_ACCOUNTGROUP").setValueState("None");
        this.byId("GL_NAME").setValueState("None");
        if (
          !temp.GL_CODE ||
          !temp.GL_COA ||
          !temp.GL_ACCOUNTTYPE ||
          !temp.GL_ACCOUNTGROUP ||
          !temp.GL_NAME
        ) {
          if (!temp.GL_CODE) {
            this.byId("GL_CODE").setValueState("Error");
            this.byId("GL_CODE").setValueStateText("G/L 계정을 입력해주세요.");
          }
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

        await $.ajax({
          type: "POST",
          url: "/general-ledger/GL",
          contentType: "application/json;IEEE754Compatible=true",
          data: JSON.stringify(temp),
        });
        this.onTest3();
      },
      
      onTest3: function () {
        this.getOwnerComponent().getRouter().navTo("GeneralLedger");
      },
      onTest4: function () {
        this.getView().getModel("editModel").setProperty("/edit", false);
      }
    });
  }
);

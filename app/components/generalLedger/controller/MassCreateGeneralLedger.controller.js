sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/SearchField",
    "sap/m/Token",
    "sap/ui/model/type/String",
    "sap/ui/table/Column",
    "sap/m/Column",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
  ],
  function (
    Controller,
    JSONModel,
    Fragment,
    SearchField,
    Token,
    TypeString,
    UIColumn,
    MColumn,
    Filter,
    FilterOperator,
    MessageBox
  ) {
    "use strict";

    var gl_code;
    var accGroupFilter = [];
    //테이블 저장 실행시 값 변경을 담을 변수
    var tablecheckflag = false;
    return Controller.extend("projectGL.controller.MassCreateGeneralLedger", {
      async onInit() {
        var data = [
          { key: "", name: "" },
          { key: "P", name: "P(1차 원가 또는 수익)" },
          { key: "S", name: "S(2차 원가)" },
          { key: "X", name: "X(대차대조표 계정)" },
          { key: "N", name: "N(영업 외 비용 또는 수익)" },
          { key: "C", name: "C(현금 계정)" },
        ];
        var oModel = new JSONModel(data);
        this.getView().setModel(oModel, "selectAccountType");

        var initData = [];
        this.getView().setModel(new JSONModel(initData), "MassCreateModel");

        const firstData = await $.ajax({
          type: "GET",
          url: "/general-ledger/GL?$orderby=GL_CODE desc&$top=1",
        });

        const coaData = await $.ajax({
          type: "GET",
          url: "/general-ledger/COA",
        });
        this.getView().setModel(new JSONModel(coaData.value), "CoaModel");

        gl_code = firstData.value[0].GL_CODE;

        const accountData = await $.ajax({
          type: "GET",
          url: "/general-ledger/AccountGroup",
        });
        this.getView().setModel(
          new JSONModel(accountData.value),
          "AccountGroup"
        );

        const companyCodeData = await $.ajax({
          type: "GET",
          url: "/general-ledger/CompanyCode",
        });
        this.getView().setModel(
          new JSONModel(companyCodeData.value),
          "CompanyCode"
        );

        //GL 라우터 이동했을 경우
        this.getOwnerComponent()
          .getRouter()
          .getRoute("MassCreateGeneralLedger")
          .attachPatternMatched(this.onMyRoutePatternMatched, this);
      },

      // 라우터 이름 일치할 경우 실행 함수
      onMyRoutePatternMatched: async function (oEvent) {
        var initData = [];
        this.getView().setModel(new JSONModel(initData), "MassCreateModel");

        const GeneralLedger = await $.ajax({
          type: "get",
          url: "/general-ledger/GL",
        });
        let GeneralLedgerModel = new JSONModel(GeneralLedger.value);
        this.getView().setModel(GeneralLedgerModel, "GeneralLedgerModel");

        //화면 라우팅될때마다 생성시 변한 값 초기화
        tablecheckflag = false;
        this.tablevalidateclear("massCreateTable");
      },

      // 몇개 생성할지 dialog
      onMassCreationNumber: async function () {
        if (!this.byId("MassCreateNumberDialog")) {
          Fragment.load({
            id: this.getView().getId(),
            name: "projectGL.view.fragments.MassCreateNumberDialog",
            controller: this,
          }).then(
            function (oDialog) {
              this.getView().addDependent(oDialog);
              oDialog.open();
            }.bind(this)
          );
        } else {
          this.byId("MassCreateNumberDialog").open();
        }
      },

      onMassCreationDialogCancel: function () {
        this.byId("MassCreateNumberDialog").close();
      },

      onMassCreationDialogApprove: function () {
        const amount = this.byId("massCreationNumber").getValue();

        let massInputModel = this.getView().getModel("MassCreateModel").oData;

        for (var i = 1; i <= amount; i++) {
          massInputModel.push(this.createEmptyInput(i));
        }
        console.log(massInputModel);
        this.getView().setModel(
          new JSONModel(massInputModel),
          "MassCreateModel"
        );

        this.onMassCreationDialogCancel();
        this.byId("MassCreateNumberDialog").destroy();
      },

      createEmptyInput: function () {
        var emptyData = {
          GL_COA: null,
          GL_ACCOUNTTYPE: null,
          GL_ACCOUNTGROUP: null,
          GL_PL_ACCOUNTTYPE: null,
          GL_NAME: null,
          GL_DESCRIPTION: null,
          GL_TRADINGPARTNER: null,
          GL_COMPANY_CODE: null,
        };

        return emptyData;
      },
      // 개별 삭제
      onClearMassCreate: function (e) {
        const path = e.getSource().getParent().getRowBindingContext().getPath();
        const index = path.split("/")[1];

        let massDeleteModel = this.getView().getModel("MassCreateModel").oData;
        massDeleteModel.splice(index, 1);

        this.getView().setModel(
          new JSONModel(massDeleteModel),
          "MassCreateModel"
        );
      },

      onMassCreationApprove: async function () {
        //생성 버튼 클릭시 validate함수가 실행될 수 있게 설정
        tablecheckflag = true;

        var check = await this.tablevalidate("massCreateTable");
        if (check == true) {
          MessageBox.error(
            "필수값이 입력되지 않았습니다.\n필수 값을 확인해주세요."
          );
          return;
        }

        // console.log(this.getView().byId("massCreateTable").getBinding("rows"));
        // console.log(this.getView().getModel("MassCreateModel"));
        let inputData = this.getView().getModel("MassCreateModel").oData;
        if (inputData.length <= 0) return 0;
        var cnt = 0;

        await inputData.forEach((data) => {
          var companyCode = "";
          var selectedCompanyCodes = inputData[cnt].GL_COMPANY_CODE;
          for (var i = 0; i < selectedCompanyCodes.length; i++) {
            let data = selectedCompanyCodes[i];
            if (i === selectedCompanyCodes.length - 1) {
              companyCode += data;
            } else {
              companyCode += data + ", ";
            }
          }

          Object.assign(data, {
            GL_COA: inputData[cnt].GL_COA,
            GL_ACCOUNTTYPE: inputData[cnt].GL_ACCOUNTTYPE,
            GL_ACCOUNTGROUP: inputData[cnt].GL_ACCOUNTGROUP,
            GL_COMPANY_CODE: companyCode,
            GL_CODE: (parseInt(gl_code) + ++cnt).toString(),
          });
          console.log(data);
          $.ajax({
            type: "POST",
            url: "/general-ledger/GL",
            contentType: "application/json;IEEE754Compatible=true",
            data: JSON.stringify(data),
          });
        });

        this.onBack();
        this.onReset();
      },

      tablevalidate: function (tableid) {
        //생성이 클릭이 한번이라도 될 경우에만 실행할 수 있게 조건문 작성
        if (tablecheckflag == false) {
          return;
        }
        var check = false;
        var datalength =
          this.getView().getModel("MassCreateModel").oData.length;
        if (datalength > 30) {
          datalength = 30;
        }
        var rows = this.byId("massCreateTable").mAggregations.rows;
        for (var i = 0; i < datalength; i++) {
          console.log(rows[i]);
          var cells = rows[i].mAggregations.cells;
          for (var j = 0; j < cells.length; j++) {
            var element = cells[j].getMetadata().getElementName().split(".")[2];
            // if(cells[j].getMetadata().getElementName())
            if (
              element == "Input" ||
              element == "Combobox" ||
              element == "DatePicker"
            ) {
              cells[j].setValueState("None");
              cells[j].setValueStateText(null);
              if (cells[j].mProperties.required == true) {
                if (
                  cells[j].mProperties.value == "" ||
                  cells[j].mProperties.value == null ||
                  cells[j].mProperties.value == undefined
                ) {
                  cells[j].setValueState("Error");
                  cells[j].setValueStateText("필수값입니다.");

                  check = true;
                }
              }
            } else if (element == "Select") {
              if (cells[j].mProperties.required == true) {
                cells[j].setValueState("None");
                cells[j].setValueStateText(null);
                if (
                  cells[j].mProperties.selectedKey == "" ||
                  cells[j].mProperties.selectedKey == null ||
                  cells[j].mProperties.selectedKey == undefined
                ) {
                  cells[j].setValueState("Error");
                  cells[j].setValueStateText("필수값입니다.");

                  check = true;
                }
              }
            } else if (element == "MultiComboBox") {
              if (cells[j].mProperties.required == true) {
                cells[j].setValueState("None");
                cells[j].setValueStateText(null);
                if (
                  cells[j].mProperties.selectedKeys == "" ||
                  cells[j].mProperties.selectedKeys == null ||
                  cells[j].mProperties.selectedKeys == undefined
                ) {
                  cells[j].setValueState("Error");
                  cells[j].setValueStateText("필수값입니다.");

                  check = true;
                }
              }
            }
          }
        }
        return check;
      },
      tablevalidateclear: function (tableid) {
        var rows = this.byId(tableid).mAggregations.rows;
        var datalength =
          this.getView().getModel("MassCreateModel").oData.length;
        if (datalength > 30) {
          datalength = 30;
        }
        for (var i = 0; i < 30; i++) {
          var cells = rows[i].mAggregations.cells;
          for (var j = 0; j < cells.length; j++) {
            var element = cells[j].getMetadata().getElementName().split(".")[2];
            if (
              element == "Input" ||
              element == "Combobox" ||
              element == "DatePicker"
            ) {
              cells[j].setValueState("None");
              cells[j].setValueStateText(null);
            } else if (element == "Select") {
              cells[j].setValueState("None");
              cells[j].setValueStateText(null);
            } else if (element == "MultiComboBox") {
              cells[j].setValueState("None");
              cells[j].setValueStateText(null);
            }
          }
        }
      },

      onBack: function () {
        this.onReset();
        this.tablevalidateclear("massCreateTable");
        this.getOwnerComponent().getRouter().navTo("GeneralLedger");
      },

      onReset: function () {
        this.getView().setModel(new JSONModel([]), "MassCreateModel");
      },

      getAccountGroupData: async function (oEvent) {
        var coa = oEvent.getParameters().selectedItem.mProperties.key;

        var accgroup = oEvent
          .getSource()
          .oParent.mAggregations.cells[2].getBinding("items");
        accgroup.filter(new Filter("AC_COA", FilterOperator.EQ, coa));
      },
    });
  }
);

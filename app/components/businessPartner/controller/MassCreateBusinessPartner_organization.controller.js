sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
  ],
  function (Controller, JSONModel, Fragment, MessageBox) {
    "use strict";

    var bp_code;
        //테이블 저장 실행시 값 변경을 담을 변수
    var tablecheckflag=false;
    return Controller.extend(
      "projectBP.controller.MassCreateBusinessPartner_organization",
      {
        onInit() {
          this.getOwnerComponent()
            .getRouter()
            .getRoute("MassCreateBusinessPartner_organization")
            .attachPatternMatched(this.onMyRoutePatternMatched, this);
        },
        onMyRoutePatternMatched: async function () {
        var initData = [];
          this.getView().setModel(new JSONModel(initData), "MassCreateModel");
          console.log(this.getView().getModel( "MassCreateModel"));

          const firstData = await $.ajax({
            type: "GET",
            url: "/business-partner/BP?$orderby=BP_CODE desc&$top=1",
          });

          bp_code = firstData.value[0].BP_CODE;

          const countryData = await $.ajax({
            type: "GET",
            url: "/business-partner/Country",
          });

          this.getView().setModel(
            new JSONModel(countryData.value),
            "CountryData"
          );
          //화면 라우팅될때마다 생성시 변한 값 초기화
          tablecheckflag=false;
          this.tablevalidateclear("massCreate_organization");
          
        },
        
        onMassCreationNumber: async function () {
          if (!this.byId("MassCreateNumberDialog")) {
            Fragment.load({
              id: this.getView().getId(),
              name: "projectBP.view.fragments.MassCreateNumberDialog",
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

          this.getView().setModel(
            new JSONModel(massInputModel),
            "MassCreateModel"
          );

          this.onMassCreationDialogCancel();
          this.byId("MassCreateNumberDialog").destroy();
        },

        createEmptyInput: function () {
          var emptyData = {
            BP_CATEGORY: "B",
            BP_ORG_DIVISION: null,
            BP_COUNTRY: null,
            BP_NAME: null,
            BP_ADDRESS: null,
            BP_POSTCODE: null,
            BP_SPECIFIC_ADDRESS: null,
            BP_CITY: null,
            BP_REGION: null,
            BP_COMPANY_CODE: null,
            BP_REGISTRATION_NUMBER: null,
          };

          return emptyData;
        },

        onClearMassCreate: function (e) {
          const path = e
            .getSource()
            .getParent()
            .getRowBindingContext()
            .getPath();
          const index = path.split("/")[1];

          let massDeleteModel =
            this.getView().getModel("MassCreateModel").oData;
          massDeleteModel.splice(index, 1);

          this.getView().setModel(
            new JSONModel(massDeleteModel),
            "MassCreateModel"
          );
        },

        onMassCreationApprove: async function () {
          tablecheckflag=true;

          var check = await this.tablevalidate("massCreate_organization");
          if (check == true) {
            MessageBox.error(
              "필수값이 입력되지 않았습니다.\n필수 값을 확인해주세요."
            );
            return;
          }

          let inputData = this.getView().getModel("MassCreateModel").oData;
          var cnt = 0;
          await inputData.forEach((data) => {
            Object.assign(data, {
              BP_ORG_DIVISION: inputData[cnt].BP_ORG_DIVISION,
              BP_COUNTRY: inputData[cnt].BP_COUNTRY,
              BP_CODE: (parseInt(bp_code) + ++cnt).toString(),
            });

            $.ajax({
              type: "POST",
              url: "/business-partner/BP",
              contentType: "application/json;IEEE754Compatible=true",
              data: JSON.stringify(data),
            });
          });
          this.onReset();
          this.onBack();
        },
        tablevalidate: function (tableid) {
          if(tablecheckflag==false){
            return;
          }
          var check = false;
          var datalength = this.getView().getModel("MassCreateModel").oData.length;
            if(datalength>20){
              datalength=20;
            }
          var rows = this.byId("massCreate_organization").mAggregations.rows;
          for (var i = 0; i < datalength; i++) {
            var cells = rows[i].mAggregations.cells;
            for (var j = 0; j < cells.length; j++) {
              var element = cells[j]
                .getMetadata()
                .getElementName()
                .split(".")[2];
              // if(cells[j].getMetadata().getElementName())
              console.log(cells[j]);
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
              }
            }
          }
          return check;
        },
        
        tablevalidateclear: function (tableid) {
          var rows = this.byId(tableid).mAggregations.rows;
          for (var i = 0; i < 20; i++) {
            var cells = rows[i].mAggregations.cells;
            for (var j = 0; j < cells.length; j++) {
              var element = cells[j].getMetadata().getElementName().split(".")[2];
              if (
                element == "Input"  ||
                element == "Combobox"  ||
                element == "DatePicker"
              ) {
                cells[j].setValueState("None");
                cells[j].setValueStateText(null);
              } else if (element == "Select") {
                cells[j].setValueState("None");
                cells[j].setValueStateText(null);
              }
            }
          }
        },
        
        onBack: function () {
          this.getOwnerComponent().getRouter().navTo("BusinessPartner");
          this.tablevalidateclear("massCreate_organization");
        },

        onReset: function () {
          this.getView().setModel(new JSONModel([]), "MassCreateModel");
        },
      }
    );
  }
);

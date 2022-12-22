sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/type/String",
    "sap/m/ColumnListItem",
    "sap/m/Label",
    "sap/m/SearchField",
    "sap/m/Token",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/table/Column",
    "sap/m/Column",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Sorter",
    "sap/ui/core/Fragment",
  ],
  function (
    Controller,
    TypeString,
    ColumnListItem,
    Label,
    SearchField,
    Token,
    Filter,
    FilterOperator,
    UIColumn,
    MColumn,
    JSONModel,
    Fragment
  ) {
    "use strict";
    var SelectedNum;

    var accGroupFilter = [];

    return Controller.extend("projectGL.controller.GeneralLedgerDetail", {
      onInit: async function () {
        var oData = { edit: false };
        var oModel = new JSONModel(oData);
        this.getView().setModel(oModel, "editModel");
        this.getOwnerComponent()
          .getRouter()
          .getRoute("GeneralLedgerDetail")
          .attachPatternMatched(this.onMyRoutePatternMatched, this);

        var data = [
          { key: "P", name: "P(1차 원가 또는 수익)" },
          { key: "S", name: "S(2차 원가)" },
          { key: "X", name: "X(대차대조표 계정)" },
          { key: "N", name: "N(영업 외 비용 또는 수익)" },
          { key: "C", name: "C(현금 계정)" },
        ];
        var oModel = new JSONModel(data);
        this.getView().setModel(oModel, "selectAccountType");

        const coaData = await $.ajax({
          type: "GET",
          url: "/general-ledger/COA",
        });
        this.getView().setModel(new JSONModel(coaData.value), "COA");

        // coa Multi Input 설정
        var coaMultiInput = this.byId("coaMulti");
        console.log(coaMultiInput);
        coaMultiInput.addValidator(this._onMultiInputValidate);
        this._oMultiInput = coaMultiInput;
        //acc Multi Input 설정
        var accGroupMultiInput;
        accGroupMultiInput = this.byId("accGroupMulti");
        accGroupMultiInput.addValidator(this._onMultiInputValidate);
        this._oMultiInput2 = accGroupMultiInput;

        const accGroupData = await $.ajax({
          type: "GET",
          url: "/general-ledger/AccountGroup",
        });

        this.getView().setModel(new JSONModel(accGroupData.value), "accGroup");

        var companyCodeMulti;
        companyCodeMulti = this.byId("companyCodeMulti");
        companyCodeMulti.addValidator(this._onMultiInputValidate);
        this._oMultiInput3 = companyCodeMulti;

        const companyData = await $.ajax({
          type: "GET",
          url: "/general-ledger/CompanyCode",
        });

        this.getView().setModel(
          new JSONModel(companyData.value),
          "CompanyData"
        );
        this.onFilterCompanyCode();
      },

      onMyRoutePatternMatched: async function (oEvent) {
        this.onTest3();
        this.byId("coaMulti").setTokens([]);
        this.byId("accGroupMulti").setTokens([]);
        // console.log(oEvent);
        SelectedNum = oEvent.getParameter("arguments").num;
        let url = "/general-ledger/GL/" + SelectedNum;
        const GeneralLedger = await $.ajax({
          type: "get",
          url: url,
        });

        let GeneralLedgerModel = new JSONModel(GeneralLedger);
        this.getView().setModel(GeneralLedgerModel, "GeneralLedgerModel");

        var coa = GeneralLedger.GL_COA;
        var acGroup = GeneralLedger.GL_ACCOUNTGROUP;

        console.log(this.byId("coaMulti"));
        this.byId("coaMulti").addToken(new Token({ key: coa, text: coa }));
        this.byId("accGroupMulti").addToken(
          new Token({ key: acGroup, text: acGroup })
        );
        this.byId("GL_ACCOUNTTYPE").setSelectedKey(
          GeneralLedger.GL_ACCOUNTTYPE
        );

        // //table용 데이터 모델에 저장
        this.onFilterCompanyCode();
      },

      getRefreshedData: async function () {
        let url = "/general-ledger/GL/" + SelectedNum;
        const GeneralLedger = await $.ajax({
          type: "get",
          url: url,
        });

        let GeneralLedgerModel = new JSONModel(GeneralLedger);
        this.getView().setModel(GeneralLedgerModel, "GeneralLedgerModel");
      },

      onFilterCompanyCode: async function (edit) {
        let url2 = "/general-ledger/CompanyCode";
        const CopmpanyCodeData = await $.ajax({
          type: "get",
          url: url2,
        });

        this.byId("companyCodeMulti").setTokens([]);

        var GeneralLedger = this.getView().getModel("GeneralLedgerModel").oData;
        console.log(GeneralLedger);
        let companyCodeArr;
        if (GeneralLedger.GL_COMPANY_CODE)
          companyCodeArr = GeneralLedger.GL_COMPANY_CODE.split(", ");
        if (companyCodeArr) {
          companyCodeArr.forEach((companyCode) => {
            this.byId("companyCodeMulti").addToken(
              new Token({ key: companyCode, text: companyCode })
            );
          });
        }

        var filteredCompanyCodes;
        var companyCodeValues = CopmpanyCodeData.value;

        if (companyCodeArr) {
          filteredCompanyCodes = companyCodeValues.map((companyCodeData) => {
            console.log(companyCodeArr);
            if (companyCodeArr.includes(companyCodeData.CC_COMPANY_CODE))
              return companyCodeData;
          });

          filteredCompanyCodes = filteredCompanyCodes.filter(function (
            element
          ) {
            return element !== undefined;
          });

          console.log(filteredCompanyCodes);
        }
        console.log(edit);

        let CopmpanyCodeDataModel =
          edit === true
            ? new JSONModel(CopmpanyCodeData.value)
            : new JSONModel(filteredCompanyCodes);

        console.log(CopmpanyCodeData);
        if (CopmpanyCodeData === null) {
          CopmpanyCodeDataModel = [];
        }

        console.log(CopmpanyCodeDataModel);
        this.getView().setModel(CopmpanyCodeDataModel, "CompanyData");
      },

      onTest: async function () {
        //let temp = new JSONModel().oData;

        let companyCodeData = this.byId("companyCodeMulti")
          .getTokens()
          .map((data) => {
            return data.mProperties.key;
          });

        let companyCode = "";

        for (var i = 0; i < companyCodeData.length; i++) {
          let data = companyCodeData[i];
          if (i === companyCodeData.length - 1) {
            companyCode += data;
          } else {
            companyCode += data + ", ";
          }
        }

        var temp = {
          GL_CODE: this.byId("GL_CODE").getText(),
          GL_COA: this.byId("coaMulti").getTokens(),
          GL_ACCOUNTTYPE: this.byId("GL_ACCOUNTTYPE").getSelectedKey(),
          GL_ACCOUNTGROUP: this.byId("accGroupMulti").getTokens(),
          GL_PL_ACCOUNTTYPE: this.byId("GL_PL_ACCOUNTTYPE").getValue(),
          GL_NAME: this.byId("GL_NAME").getValue(),
          GL_DESCRIPTION: this.byId("GL_DESCRIPTION").getValue(),
          GL_TRADINGPARTNER: this.byId("GL_TRADINGPARTNER").getValue(),
          GL_COMPANY_CODE: companyCode,
        };

        this.byId("coaMulti").setValueState("None");
        this.byId("GL_ACCOUNTTYPE").setValueState("None");
        this.byId("accGroupMulti").setValueState("None");
        this.byId("GL_NAME").setValueState("None");
        this.byId("companyCodeMulti").setValueState("None");

        if (
          temp.GL_COA.length === 0 ||
          !temp.GL_ACCOUNTTYPE ||
          temp.GL_ACCOUNTGROUP.length === 0 ||
          !temp.GL_NAME ||
          !temp.GL_COMPANY_CODE
        ) {
          if (temp.GL_COA.length === 0) {
            this.byId("coaMulti").setValueState("Error");
            this.byId("coaMulti").setValueStateText(
              "계정과목표를 입력해주세요."
            );
          }
          if (!temp.GL_ACCOUNTTYPE) {
            this.byId("GL_ACCOUNTTYPE").setValueState("Error");
            this.byId("GL_ACCOUNTTYPE").setValueStateText(
              "계정 유형을 입력해주세요."
            );
          }
          if (temp.GL_ACCOUNTGROUP.length === 0) {
            this.byId("accGroupMulti").setValueState("Error");
            this.byId("accGroupMulti").setValueStateText(
              "계정 그룹을 입력해주세요."
            );
          }
          if (!temp.GL_NAME) {
            this.byId("GL_NAME").setValueState("Error");
            this.byId("GL_NAME").setValueStateText("내역을 입력해주세요.");
          }
          if (!temp.GL_COMPANY_CODE) {
            this.byId("companyCodeMulti").setValueState("Error");
            this.byId("companyCodeMulti").setValueStateText(
              "회사 코드를 선택해주세요."
            );
          }
          return 0;
        }

        temp.GL_COA = temp.GL_COA[0].mProperties.key;
        temp.GL_ACCOUNTGROUP = temp.GL_ACCOUNTGROUP[0].mProperties.key;

        let url = "/general-ledger/GL/" + temp.GL_CODE;
        console.log(url);
        await $.ajax({
          type: "patch",
          url: url,
          contentType: "application/json;IEEE754Compatible=true",
          data: JSON.stringify(temp),
        });
        this.getView()
          .getModel("GeneralLedgerModel")
          .setProperty("/GL_COMPANY_CODE", temp.GL_COMPANY_CODE);

        // this.byId("accGroupMulti").setTokens([]);
        // this.byId("coaMulti").setTokens([]);

        await this.onFilterCompanyCode();
        this.getRefreshedData();
        this.onTest3();
        //await this.onUpdate(url,temp);
      },

      onTest2: function () {
        this.getView().getModel("editModel").setProperty("/edit", true);
        this.onFilterCompanyCode(true);
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
      onValueHelpRequested: function () {
        if (!this._oBasicSearchField)
          this._oBasicSearchField = new SearchField();
        if (!this.pDialog) {
          this.pDialog = this.loadFragment({
            name: "projectGL.view.fragments.GeneralLedgerCoaDialog",
          });
        }
        this.pDialog.then(
          function (oDialog) {
            var oFilterBar = oDialog.getFilterBar();
            this._oVHD = oDialog;
            // Initialise the dialog with model only the first time. Then only open it
            if (this._bDialogInitialized) {
              // Re-set the tokens from the input and update the table

              oDialog.setTokens([]);
              oDialog.setTokens(this._oMultiInput.getTokens());
              oDialog.update();

              this._oBasicSearchField.setValue("");
              this.onFilterBarSearch();

              oDialog.open();
              return;
            }
            this.getView().addDependent(oDialog);

            // Set key fields for filtering in the Define Conditions Tab
            oDialog.setRangeKeyFields([
              {
                label: "COA_CODE",
                key: "COA_CODE",
                type: "string",
                typeInstance: new TypeString(
                  {},
                  {
                    maxLength: 7,
                  }
                ),
              },
            ]);

            // Set Basic Search for FilterBar
            oFilterBar.setFilterBarExpanded(false);
            oFilterBar.setBasicSearch(this._oBasicSearchField);

            // Trigger filter bar search when the basic search is fired
            this._oBasicSearchField.attachSearch(function () {
              oFilterBar.search();
            });

            oDialog.getTableAsync().then(
              function (oTable) {
                oTable.setModel(this.getView().getModel("COA"));
                oTable.setSelectionMode("Single");

                // For Desktop and tabled the default table is sap.ui.table.Table
                if (oTable.bindRows) {
                  // Bind rows to the ODataModel and add columns
                  oTable.bindAggregation("rows", {
                    path: "COA>/",
                    events: {
                      dataReceived: function () {
                        oDialog.update();
                      },
                    },
                  });
                  oTable.addColumn(
                    new UIColumn({
                      label: "COA_CODE",
                      template: "COA>COA_CODE",
                    })
                  );
                  oTable.addColumn(
                    new UIColumn({
                      label: "COA_NAME",
                      template: "COA>COA_NAME",
                    })
                  );
                }

                // For Mobile the default table is sap.m.Table
                if (oTable.bindItems) {
                  // Bind items to the ODataModel and add columns
                  oTable.bindAggregation("items", {
                    path: "COA>/",
                    template: new ColumnListItem({
                      cells: [
                        new Label({ text: "{COA_CODE}" }),
                        new Label({ text: "{COA_NAME}" }),
                      ],
                    }),
                    events: {
                      dataReceived: function () {
                        oDialog.update();
                      },
                    },
                  });
                  oTable.addColumn(
                    new MColumn({ header: new Label({ text: "COA_CODE" }) })
                  );
                  oTable.addColumn(
                    new MColumn({ header: new Label({ text: "COA_NAME" }) })
                  );
                }
                oDialog.update();
              }.bind(this)
            );

            oDialog.setTokens(this._oMultiInput.getTokens());

            // set flag that the dialog is initialized

            this._bDialogInitialized = true;
            oDialog.open();
          }.bind(this)
        );
      },
      getFirstCoaToken: function () {
        let coaTokens = this.byId("coaMulti").getTokens();
        if (coaTokens.length > 0) return coaTokens[0].mProperties.key;
        else return null;
      },

      onAccGroupValueHelpRequested: function () {
        var coaToken = this.getFirstCoaToken();

        accGroupFilter = [];
        if (coaToken) {
          accGroupFilter.push(
            new Filter("AC_COA", FilterOperator.Contains, coaToken)
          );
        }

        if (!this._oBasicSearchField2)
          this._oBasicSearchField2 = new SearchField();
        if (!this.pDialog2) {
          this.pDialog2 = this.loadFragment({
            name: "projectGL.view.fragments.GeneralLedgerACGroupDialog",
          });
        }
        this.pDialog2.then(
          function (oDialog2) {
            var oFilterBar2 = oDialog2.getFilterBar();
            this._oVHD2 = oDialog2;
            // Initialise the dialog with model only the first time. Then only open it
            if (this._bDialogInitialized2) {
              // Re-set the tokens from the input and update the table
              oDialog2.setTokens([]);
              oDialog2.setTokens(this._oMultiInput2.getTokens());
              oDialog2.update();

              this._oBasicSearchField2.setValue("");
              this.onAcGroupFilterBarSearch();

              this._filterTable2(
                new Filter({
                  filters: accGroupFilter,
                  and: true,
                })
              );

              oDialog2.open();
              return;
            }
            this.getView().addDependent(oDialog2);

            // Set key fields for filtering in the Define Conditions Tab
            oDialog2.setRangeKeyFields([
              {
                label: "AC_GROUP_CODE",
                key: "AC_GROUP_CODE",
                type: "string",
                typeInstance: new TypeString(
                  {},
                  {
                    maxLength: 7,
                  }
                ),
              },
            ]);

            // Set Basic Search for FilterBar
            oFilterBar2.setFilterBarExpanded(false);
            oFilterBar2.setBasicSearch(this._oBasicSearchField2);

            // Trigger filter bar search when the basic search is fired
            this._oBasicSearchField2.attachSearch(function () {
              oFilterBar2.search();
            });

            oDialog2.getTableAsync().then(
              function (oTable2) {
                this._oMultiInput2.setTokens([]);
                oTable2.setSelectionMode("Single");
                oTable2.setModel(this.getView().getModel("accGroup"));

                // For Desktop and tabled the default table is sap.ui.table.Table
                if (oTable2.bindRows) {
                  // Bind rows to the ODataModel and add columns
                  oTable2.bindAggregation("rows", {
                    path: "accGroup>/",
                    events: {
                      dataReceived: function () {
                        oDialog2.update();
                      },
                    },
                  });
                  oTable2.addColumn(
                    new UIColumn({
                      label: "AC_GROUP_CODE",
                      template: "accGroup>AC_GROUP_CODE",
                    })
                  );
                  oTable2.addColumn(
                    new UIColumn({
                      label: "AC_COA",
                      template: "accGroup>AC_COA",
                    })
                  );
                  oTable2.addColumn(
                    new UIColumn({
                      label: "AC_NAME",
                      template: "accGroup>AC_NAME",
                    })
                  );
                }

                // For Mobile the default table is sap.m.Table
                if (oTable2.bindItems) {
                  // Bind items to the ODataModel and add columns
                  oTable2.bindAggregation("items", {
                    path: "COA>/",
                    template: new ColumnListItem({
                      cells: [
                        new Label({ text: "{AC_GROUP_CODE}" }),
                        new Label({ text: "{AC_COA}" }),
                        new Label({ text: "{AC_NAME}" }),
                      ],
                    }),
                    events: {
                      dataReceived: function () {
                        oDialog2.update();
                      },
                    },
                  });
                  oTable2.addColumn(
                    new MColumn({
                      header: new Label({ text: "AC_GROUP_CODE" }),
                    })
                  );
                  oTable2.addColumn(
                    new MColumn({ header: new Label({ text: "AC_COA" }) })
                  );
                  oTable2.addColumn(
                    new MColumn({ header: new Label({ text: "AC_NAME" }) })
                  );
                }
                oDialog2.update();
              }.bind(this)
            );

            oDialog2.setTokens(this._oMultiInput2.getTokens());

            // set flag that the dialog is initialized

            this._filterTable2(
              new Filter({
                filters: accGroupFilter,
                and: true,
              })
            );

            this._bDialogInitialized2 = true;

            oDialog2.open();
          }.bind(this)
        );
      },
      onCompanyCodeValueHelpRequest: function () {
        this._oBasicSearchField3 = new SearchField();
        if (!this.pDialog3) {
          this.pDialog3 = this.loadFragment({
            name: "projectGL.view.fragments.GeneralLedgerCompanyCodeDialog",
          });
        }
        this.pDialog3.then(
          function (oDialog3) {
            var oFilterBar3 = oDialog3.getFilterBar();
            this._oVHD3 = oDialog3;
            // Initialise the dialog with model only the first time. Then only open it
            if (this._bDialogInitialized3) {
              // Re-set the tokens from the input and update the table
              oDialog3.setTokens([]);
              oDialog3.setTokens(this._oMultiInput3.getTokens());
              oDialog3.update();

              this._oBasicSearchField3.setValue("");
              this.onCompnayCodeFilterBarSearch();

              oDialog3.open();
              return;
            }
            this.getView().addDependent(oDialog3);

            // Set key fields for filtering in the Define Conditions Tab
            oDialog3.setRangeKeyFields([
              {
                label: "CC_COMPANY_CODE",
                key: "CC_COMPANY_CODE",
                type: "string",
                typeInstance: new TypeString(
                  {},
                  {
                    maxLength: 7,
                  }
                ),
              },
            ]);

            // Set Basic Search for FilterBar
            oFilterBar3.setFilterBarExpanded(false);
            oFilterBar3.setBasicSearch(this._oBasicSearchField3);

            // Trigger filter bar search when the basic search is fired
            this._oBasicSearchField3.attachSearch(function () {
              oFilterBar3.search();
            });

            oDialog3.getTableAsync().then(
              function (oTable3) {
                oTable3.setModel(this.getView().getModel("CompanyData"));

                // For Desktop and tabled the default table is sap.ui.table.Table
                if (oTable3.bindRows) {
                  // Bind rows to the ODataModel and add columns
                  oTable3.bindAggregation("rows", {
                    path: "CompanyData>/",
                    events: {
                      dataReceived: function () {
                        oDialog3.update();
                      },
                    },
                  });
                  oTable3.addColumn(
                    new UIColumn({
                      label: "CC_COMPANY_CODE",
                      template: "CompanyData>CC_COMPANY_CODE",
                    })
                  );
                  oTable3.addColumn(
                    new UIColumn({
                      label: "CC_COMPANY_NAME",
                      template: "CompanyData>CC_COMPANY_NAME",
                    })
                  );
                  oTable3.addColumn(
                    new UIColumn({
                      label: "CC_CURRENCY",
                      template: "CompanyData>CC_CURRENCY",
                    })
                  );
                  oTable3.addColumn(
                    new UIColumn({
                      label: "CC_COA",
                      template: "CompanyData>",
                    })
                  );
                }

                // For Mobile the default table is sap.m.Table
                if (oTable3.bindItems) {
                  // Bind items to the ODataModel and add columns
                  oTable3.bindAggregation("items", {
                    path: "CompanyData>/",
                    template: new ColumnListItem({
                      cells: [
                        new Label({ text: "{CC_COMPANY_CODE}" }),
                        new Label({ text: "{CC_COMPANY_NAME}" }),
                        new Label({ text: "{CC_CURRENCY}" }),
                        new Label({ text: "{CC_COA}" }),
                      ],
                    }),
                    events: {
                      dataReceived: function () {
                        oDialog3.update();
                      },
                    },
                  });
                  oTable3.addColumn(
                    new MColumn({
                      header: new Label({ text: "CC_COMPANY_CODE" }),
                    })
                  );
                  oTable3.addColumn(
                    new MColumn({
                      header: new Label({ text: "CC_COMPANY_NAME" }),
                    })
                  );
                  oTable3.addColumn(
                    new MColumn({ header: new Label({ text: "CC_CURRENCY" }) })
                  );
                  oTable3.addColumn(
                    new MColumn({ header: new Label({ text: "CC_COA" }) })
                  );
                }
                oDialog3.update();
              }.bind(this)
            );

            oDialog3.setTokens(this._oMultiInput3.getTokens());

            // set flag that the dialog is initialized

            this._filterTable3(
              new Filter({
                filters: accGroupFilter,
                and: true,
              })
            );

            this._bDialogInitialized3 = true;

            oDialog3.open();
          }.bind(this)
        );
      },

      onValueHelpOkPress: function (oEvent) {
        var aTokens = oEvent.getParameter("tokens");
        var arr = [];
        aTokens.map((token) => {
          arr.push(
            new Token({
              key: token.mProperties.key,
              text: token.mProperties.key,
            })
          );
        });
        this._oMultiInput.setTokens(arr);
        this._oMultiInput2.setTokens([]);
        this._oVHD.close();
      },
      onACGroupOkPress: function (oEvent) {
        var aTokens = oEvent.getParameter("tokens");
        var arr = [];
        aTokens.map((token) => {
          arr.push(
            new Token({
              key: token.mProperties.key,
              text: token.mProperties.key,
            })
          );
        });
        this._oMultiInput2.setTokens(arr);
        this._oVHD2.close();
      },
      onCompanyCodeOkPress: function (oEvent) {
        var aTokens = oEvent.getParameter("tokens");
        var arr = [];
        aTokens.map((token) => {
          arr.push(
            new Token({
              key: token.mProperties.key,
              text: token.mProperties.key,
            })
          );
        });
        this._oMultiInput3.setTokens(arr);
        this._oVHD3.close();
      },

      onACGroupCancelPress: function () {
        this._oVHD2.close();
      },
      onValueHelpCancelPress: function () {
        this._oVHD.close();
      },
      onCompanyCodeCancelPress: function () {
        this._oVHD3.close();
      },
      // #endregion

      // #region Value Help Dialog filters with suggestions

      _inputTextFormatter: function (oItem) {
        var sOriginalText = oItem.getText(),
          sWhitespace = " ",
          sUnicodeWhitespaceCharacter = "\u00A0"; // Non-breaking whitespace

        if (typeof sOriginalText !== "string") {
          return sOriginalText;
        }

        return sOriginalText.replaceAll(
          sWhitespace + sUnicodeWhitespaceCharacter,
          sWhitespace + sWhitespace
        );
      },

      // #endregion
      onFilterBarSearch: function () {
        var sSearchQuery = this._oBasicSearchField.getValue();

        var aFilters = [];

        aFilters.push(
          new Filter({
            filters: [
              new Filter({
                path: "COA_CODE",
                operator: FilterOperator.Contains,
                value1: sSearchQuery,
              }),
              new Filter({
                path: "COA_NAME",
                operator: FilterOperator.Contains,
                value1: sSearchQuery,
              }),
            ],
            and: false,
          })
        );

        this._filterTable(
          new Filter({
            filters: aFilters,
            and: true,
          })
        );
      },
      onCompnayCodeFilterBarSearch: function () {
        var sSearchQuery = this._oBasicSearchField3.getValue();

        var aFilters = [];

        aFilters.push(
          new Filter({
            filters: [
              new Filter({
                path: "CC_COMPANY_CODE",
                operator: FilterOperator.Contains,
                value1: sSearchQuery,
              }),
              new Filter({
                path: "CC_COMPANY_NAME",
                operator: FilterOperator.Contains,
                value1: sSearchQuery,
              }),
              new Filter({
                path: "CC_CURRENCY",
                operator: FilterOperator.Contains,
                value1: sSearchQuery,
              }),
              new Filter({
                path: "CC_COA",
                operator: FilterOperator.Contains,
                value1: sSearchQuery,
              }),
            ],
            and: false,
          })
        );

        this._filterTable3(
          new Filter({
            filters: aFilters,
            and: true,
          })
        );
      },

      onAcGroupFilterBarSearch: function () {
        var sSearchQuery = this._oBasicSearchField2.getValue();

        var accGroupFilter = [];

        if (sSearchQuery.length > 0) {
          accGroupFilter.push(
            new Filter({
              filters: [
                new Filter({
                  path: "AC_GROUP_CODE",
                  operator: FilterOperator.Contains,
                  value1: sSearchQuery,
                }),
                new Filter({
                  path: "AC_COA",
                  operator: FilterOperator.Contains,
                  value1: sSearchQuery,
                }),
                new Filter({
                  path: "AC_NAME",
                  operator: FilterOperator.Contains,
                  value1: sSearchQuery,
                }),
              ],
              and: false,
            })
          );
        } else {
          accGroupFilter = [];
          var coaToken = this.getFirstCoaToken();

          accGroupFilter = [];
          if (coaToken) {
            accGroupFilter.push(
              new Filter("AC_COA", FilterOperator.Contains, coaToken)
            );
          }
        }

        this._filterTable2(
          new Filter({
            filters: accGroupFilter,
            and: true,
          })
        );
      },

      // @endregion
      // Internal helper methods

      _onMultiInputValidate: function (oArgs) {
        var sWhitespace = " ",
          sUnicodeWhitespaceCharacter = "\u00A0"; // Non-breaking whitespace

        if (oArgs.suggestionObject) {
          var oObject = oArgs.suggestionObject.getBindingContext().getObject(),
            oToken = new Token(),
            sOriginalText = oObject.ProductCode.replaceAll(
              sWhitespace + sWhitespace,
              sWhitespace + sUnicodeWhitespaceCharacter
            );

          oToken.setKey(oObject.ProductCode);
          oToken.setText(oObject.ProductName + " (" + sOriginalText + ")");
          return oToken;
        }
        return null;
      },
      _filterTable: function (oFilter) {
        var oVHD = this._oVHD;

        oVHD.getTableAsync().then(function (oTable) {
          if (oTable.bindRows) {
            oTable.getBinding("rows").filter(oFilter);
          }
          if (oTable.bindItems) {
            oTable.getBinding("items").filter(oFilter);
          }

          // This method must be called after binding update of the table.
          oVHD.update();
        });
      },
      _filterTable2: function (oFilter) {
        var oVHD2 = this._oVHD2;

        oVHD2.getTableAsync().then(function (oTable2) {
          if (oTable2.bindRows) {
            oTable2.getBinding("rows").filter(oFilter);
          }
          if (oTable2.bindItems) {
            oTable2.getBinding("items").filter(oFilter);
          }

          // This method must be called after binding update of the table.
          oVHD2.update();
        });
      },
      _filterTable3: function (oFilter) {
        var oVHD3 = this._oVHD3;

        oVHD3.getTableAsync().then(function (oTable3) {
          if (oTable3.bindRows) {
            oTable3.getBinding("rows").filter(oFilter);
          }
          if (oTable3.bindItems) {
            oTable3.getBinding("items").filter(oFilter);
          }

          // This method must be called after binding update of the table.
          oVHD3.update();
        });
      },

      onCheckSelect() {},
    });
  }
);

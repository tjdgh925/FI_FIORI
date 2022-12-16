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
    "sap/ui/export/Spreadsheet",
    "sap/ui/export/library",
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
    Sorter,
    Fragment,
    Spreadsheet,
    exportLibrary
  ) {
    "use strict";
    const EdmType = exportLibrary.EdmType;
    return Controller.extend("projectGL.controller.GeneralLedger", {
      onInit: async function () {
        this.getOwnerComponent()
          .getRouter()
          .getRoute("GeneralLedger")
          .attachPatternMatched(this.onMyRoutePatternMatched, this);

        const GeneralLedger = await $.ajax({
          type: "get",
          url: "/general-ledger/GL",
        });
        let GeneralLedgerModel = new JSONModel(GeneralLedger.value);
        this.getView().setModel(GeneralLedgerModel, "GeneralLedgerModel");

        var sum = this.getView().getModel("GeneralLedgerModel").oData.length;

        this.byId("TableName").setText("총계정원장(" + sum + ")");

        var oMultiInput, oMultiInputWithSuggestions;
        oMultiInput = this.byId("coaMulti");
        oMultiInput.addValidator(this._onMultiInputValidate);
        this._oMultiInput = oMultiInput;

        const coaData = await $.ajax({
          type: "GET",
          url: "/general-ledger/COA",
        });
        this.getView().setModel(new JSONModel(coaData.value), "COA");
      },

      onMyRoutePatternMatched: async function (oEvent) {
        const GeneralLedger = await $.ajax({
          type: "get",
          url: "/general-ledger/GL",
        });
        let GeneralLedgerModel = new JSONModel(GeneralLedger.value);
        this.getView().setModel(GeneralLedgerModel, "GeneralLedgerModel");
      },

      onSearch: function () {
        let coaTokens = this.byId("coaMulti").getTokens();
        let COA = coaTokens.map((token) => {
          return token.mProperties.key;
        });

        let account = this.byId("account").getValue();
        let accountTypes = this.byId("accountType").getSelectedKeys();
        let accountGroup = this.byId("accountGroup").getValue();

        console.log(accountTypes);

        var aFilter = [];
        var coaFilter = [];
        var acGroupFilter = [];
        if (COA.length > 0) {
          COA.forEach((coa) => {
            coaFilter.push(new Filter("GL_COA", FilterOperator.Contains, coa));
          });
          aFilter.push(new Filter(coaFilter, false));
        }
        if (account) {
          aFilter.push(new Filter("GL_CODE", FilterOperator.EQ, account));
        }
        if (accountTypes.length > 0) {
          accountTypes.forEach((accountType) => {
            acGroupFilter.push(
              new Filter("GL_ACCOUNTTYPE", FilterOperator.Contains, accountType)
            );
          });
          aFilter.push(new Filter(acGroupFilter, false));
        }
        if (accountGroup) {
          aFilter.push(
            new Filter("GL_ACCOUNTGROUP", FilterOperator.Contains, accountGroup)
          );
        }
        let oTable = this.byId("GeneralLedgerTable").getBinding("rows");
        oTable.filter(aFilter);

        var sumSearch = oTable.aIndices.length;
        this.byId("TableName").setText("총계정원장(" + sumSearch + ")");
      },

      onSearch2: function (oEvent) {
        let search = this.byId("search").getValue();

        var aFilter = [];

        if (search) {
          aFilter.push(new Filter("GL_COA", FilterOperator.Contains, search));
        }
        if (search) {
          aFilter.push(new Filter("GL_CODE", FilterOperator.Contains, search));
        }
        if (search) {
          aFilter.push(
            new Filter("GL_ACCOUNTTYPE", FilterOperator.Contains, search)
          );
        }
        if (search) {
          aFilter.push(
            new Filter("GL_ACCOUNTGROUP", FilterOperator.Contains, search)
          );
        }
        if (search) {
          aFilter.push(new Filter("GL_NAME", FilterOperator.Contains, search));
        }
        var allFilter = new Filter(aFilter, false);

        if (oEvent.getParameters().clearButtonPressed == true) {
          allFilter = [];
        }
        let oTable = this.byId("GeneralLedgerTable").getBinding("rows");
        oTable.filter(allFilter);

        var sumSearch2 = oTable.aIndices.length;
        this.byId("TableName").setText("총계정원장(" + sumSearch2 + ")");
      },

      onReset: function () {
        this.byId("search").setValue(null);
        this.byId("coaMulti").setTokens([]);
        this.byId("account").setValue(null);
        this.byId("accountType").setSelectedKeys([]);
        this.byId("accountGroup").setValue(null);

        var aFilter = [];
        let oTable = this.byId("GeneralLedgerTable").getBinding("rows");
        oTable.filter(aFilter);
        // this.onSearch();
      },

      onNavToDetail: function (oEvent) {
        let mParams = oEvent.getParameters();
        let sPath = mParams.row.oBindingContexts.GeneralLedgerModel.sPath;
        let data = this.getView()
          .getModel("GeneralLedgerModel")
          .getProperty(sPath);

        let SelectedNum = data.GL_CODE;

        this.getOwnerComponent()
          .getRouter()
          .navTo("GeneralLedgerDetail", { num: SelectedNum });
      },

      onCreateGL: function () {
        this.getOwnerComponent().getRouter().navTo("CreateGeneralLedger");
      },

      onDeleteGL: async function () {
        var totalNumber =
          this.getView().getModel("GeneralLedgerModel").oData.length;
        let model = this.getView().getModel("GeneralLedgerModel");
        let i;
        for (i = 0; i < totalNumber; i++) {
          let chk = "/" + i + "/CHK";
          let key = "/" + i + "/GL_CODE";

          if (model.getProperty(chk) === true) {
            model.getProperty(key);
            let GL_CODE = model.getProperty(key);
            let url = "/general-ledger/GL/" + GL_CODE;
            await $.ajax({
              type: "DELETE",
              url: url,
            });
          }
        }
        this.onMyRoutePatternMatched();
      },

      onSort: function () {
        if (!this.byId("SortDialog")) {
          Fragment.load({
            id: this.getView().getId(),
            name: "projectGL.view.fragments.SortDialog",
            controller: this,
          }).then(
            function (oDialog) {
              this.getView().addDependent(oDialog);
              oDialog.open("filter");
            }.bind(this)
          );
        } else {
          this.byId("SortDialog").open("filter");
        }
        this.onSearch();
      },

      onConfirmSortDialog: function (oEvent) {
        let mParams = oEvent.getParameters();
        let sPath = mParams.sortItem.getKey(); //정렬기준
        let bDescending = mParams.sortDescending; //정렬순서
        let aSorters = [];

        aSorters.push(new Sorter(sPath, bDescending));

        let oBinding = this.byId("GeneralLedgerTable").getBinding("rows");
        oBinding.sort(aSorters);
      },

      onDataExport: function () {
        let aCols, oRowBinding, oSettings, oSheet, oTable;
        oTable = this.byId("GeneralLedgerTable");
        oRowBinding = oTable.getBinding("rows");
        aCols = this.createColumnConfig();

        let oList = [];

        for (let j = 0; j < oRowBinding.oList.length; j++) {
          if (oRowBinding.aIndices.indexOf(j) > -1) {
            oList.push(oRowBinding.oList[j]);
          }
        }

        oSettings = {
          workbook: {
            columns: aCols,
            //컬럼이 뭐가있는지
            hierarchyLevel: "Level",
          },
          dataSource: oList,
          //무슨데이터가 들어갈지(194line)
          fileName: "GeneralLedger.xlsx",
          worker: false,
        };

        oSheet = new Spreadsheet(oSettings);
        oSheet.build().finally(function () {
          oSheet.destroy();
        });
      },
      createColumnConfig: function () {
        // 엑셀 컬럼 정의
        const aCols = [];
        aCols.push({
          label: "G/L 계정",
          property: "GL_CODE",
          type: EdmType.String,
        });
        aCols.push({
          label: "내역",
          property: "GL_NAME",
          type: EdmType.String,
        });
        aCols.push({
          label: "계정과목표",
          property: "GL_COA",
          type: EdmType.String,
        });
        aCols.push({
          label: "G/L 계정 유형",
          property: "GL_ACCOUNTTYPE",
          type: EdmType.String,
        });
        aCols.push({
          label: "계정 그룹",
          property: "GL_ACCOUNTGROUP",
          type: EdmType.String,
        });

        return aCols;
      },

      onExit: function () {
        if (this.oProductsModel) {
          this.oProductsModel.destroy();
          this.oProductsModel = null;
        }
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
        this._oVHD.close();
      },

      onValueHelpCancelPress: function () {
        this._oVHD.close();
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
      onFilterBarSearch: function (oEvent) {
        var sSearchQuery = this._oBasicSearchField.getValue(),
          aSelectionSet = oEvent.getParameter("selectionSet");

        var filter = [];

        var aFilters = aSelectionSet.reduce(function (aResult, oControl) {
          if (oControl.getValue()) {
            aResult.push(
              new Filter({
                path: oControl.getName(),
                operator: FilterOperator.Contains,
                value1: oControl.getValue(),
              })
            );
          }

          return aResult;
        }, []);

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

      onCheckSelect() {},
    });
  }
);

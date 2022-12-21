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
    "../model/formatter",
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
    exportLibrary,
    formatter
  ) {
    "use strict";
    const EdmType = exportLibrary.EdmType;

    var accGroupFilter = [];
    return Controller.extend("projectGL.controller.GeneralLedger", {
      formatter: formatter,
      onInit: async function () {
        //formatter
        var data = [
          { key: "P", name: "P(1차 원가 또는 수익)" },
          { key: "S", name: "S(2차 원가)" },
          { key: "X", name: "X(대차대조표 계정)" },
          { key: "N", name: "N(영업 외 비용 또는 수익)" },
          { key: "C", name: "C(현금 계정)" },
        ];
        var oModel = new JSONModel(data);
        this.getView().setModel(oModel, "selectAccountType");

      

        //GL 데이터 가져오는 과정
        const GeneralLedger = await $.ajax({
          type: "get",
          url: "/general-ledger/GL",
        });
        let GeneralLedgerModel = new JSONModel(GeneralLedger.value);
        this.getView().setModel(GeneralLedgerModel, "GeneralLedgerModel");

        //총계정원장 개수 계산
        var sum = this.getView().getModel("GeneralLedgerModel").oData.length;

        this.byId("TableName").setText("총계정원장(" + sum + ")");

        // coa Multi Input 설정
        var coaMultiInput;
        coaMultiInput = this.byId("coaMulti");
        coaMultiInput.addValidator(this._onMultiInputValidate);
        this._oMultiInput = coaMultiInput;

        const coaData = await $.ajax({
          type: "GET",
          url: "/general-ledger/COA",
        });
        this.getView().setModel(new JSONModel(coaData.value), "COA");

        //acc Multi Input 설정
        var accGroupMultiInput;
        accGroupMultiInput = this.byId("accGroupMulti");
        accGroupMultiInput.addValidator(this._onMultiInputValidate);
        this._oMultiInput2 = accGroupMultiInput;

        const accGroupData = await $.ajax({
          type: "GET",
          url: "/general-ledger/AccountGroup",
        });

        //console.log(accGroupData);
        this.getView().setModel(new JSONModel(accGroupData.value), "accGroup");
        
          //GL 라우터 이동했을 경우
          this.getOwnerComponent()
          .getRouter()
          .getRoute("GeneralLedger")
          .attachPatternMatched(this.onMyRoutePatternMatched, this);
         
      },

      // 라우터 이름 일치할 경우 실행 함수
      onMyRoutePatternMatched: async function (oEvent) {
        const GeneralLedger = await $.ajax({
          type: "get",
          url: "/general-ledger/GL",
        });
        let GeneralLedgerModel = new JSONModel(GeneralLedger.value);
        this.getView().setModel(GeneralLedgerModel, "GeneralLedgerModel");
        
        var sum = this.getView().getModel("GeneralLedgerModel").oData.length;

        this.byId("TableName").setText("총계정원장(" + sum + ")");
        this.onReset();

      },

      // 검색 함수
      onSearch: function () {
        console.log(this.byId("coaMulti"));
        let coaTokens = this.byId("coaMulti").getTokens();
        let COA = coaTokens.map((token) => {
          return token.mProperties.key;
        });

        let account = this.byId("account").getValue();
        let accountTypes = this.byId("accountType").getSelectedKeys();

        let accountGroupTokens = this.byId("accGroupMulti").getTokens();
        let acGroups = accountGroupTokens.map((acGroup) => {
          return acGroup.mProperties.key;
        });
        // this.byId("accountGroup").getValue();

        //필수값 지정
        this.byId("coaMulti").setValueState("None");

        if (COA.length === 0) {
          this.byId("coaMulti").setValueState("Error");
          this.byId("coaMulti").setValueStateText("계정과목표를 입력해주세요.");
          return 0;
        }

        console.log(accountTypes);

        var aFilter = [];
        var coaFilter = [];
        var acGroupFilter = [];
        var acTypeFilter = [];
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
            acTypeFilter.push(
              new Filter("GL_ACCOUNTTYPE", FilterOperator.Contains, accountType)
            );
          });
          aFilter.push(new Filter(acTypeFilter, false));
        }

        if (acGroups.length > 0) {
          acGroups.forEach((acGroup) => {
            acGroupFilter.push(
              new Filter("GL_ACCOUNTGROUP", FilterOperator.Contains, acGroup)
            );
          });
          aFilter.push(new Filter(acGroupFilter, false));
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

        if (
          oEvent.getParameters().clearButtonPressed == true ||
          !this.byId("search").getValue()
        ) {
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
        this.byId("accGroupMulti").setTokens([]);

        var aFilter = [];
        let oTable = this.byId("GeneralLedgerTable").getBinding("rows");
        oTable.filter(aFilter);
        // this.onSearch();

        this.byId("coaMulti").setValueState("None");
        var sumSearch4 = oTable.aIndices.length;
        this.byId("TableName").setText("총계정원장(" + sumSearch4 + ")");
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

      onCreateButtonGL: function (oEvent) {
        var oButton = oEvent.getSource();
        this.byId("actionSheet").openBy(oButton);
      },

      onCreateGL: function () {
        this.getOwnerComponent().getRouter().navTo("CreateGeneralLedger");
      },

      onCopyCreateGL: function () {
        var totalNumber =
          this.getView().getModel("GeneralLedgerModel").oData.length;
        let model = this.getView().getModel("GeneralLedgerModel");
        let i;
        let GL_CODE;
        //for문 바깥으로 꺼내서 선언(let GL_CODE)
        for (i = 0; i < totalNumber; i++) {
          let chk = "/" + i + "/CHK";
          let key = "/" + i + "/GL_CODE";
          if (model.getProperty(chk) === true) {
            model.getProperty(key);
            GL_CODE = model.getProperty(key);

            // let test = this.getView().byId("GeneralLedgerTable").getBinding("rows");  // 테이블 바인딩
            // let GL_CODE;  // 변수 GL_CODE 선언
            // for (let i=0; i< test.oList.length; i++) {  // 테이블 바인딩 데이터 for문 순회
            //   if (test.oList[i].CHK) {    // 만약 CHK 필드 값(선택)이 true일 때
            //     GL_CODE = test.oList[i].GL_CODE;  // 변수 GL_CODE에 값 할당
            //     break;   // GL_CODE에 값을 할당하면 for문 탈출
            //   }
            // }
            this.getOwnerComponent()
              .getRouter()
              .navTo("CopyCreateGeneralLedger", { num: GL_CODE });
            //num: GL_CODE를 for문 안으로 넣어서 돌려버린다는 마인드 중괄호로 묶어묶어!
          }
          // 복사 생성 페이지로 이동
        }
      },

      onCreateGL: function () {
        this.getOwnerComponent().getRouter().navTo("CreateGeneralLedger");
      },
      onCopyCreateGL: function () {
        this.getOwnerComponent().getRouter().navTo("CopyCreateGeneralLedger");
      },
      onMassCreateGL: function () {
        this.getOwnerComponent().getRouter().navTo("MassCreateGeneralLedger");
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
      getCoaTokens: function () {
        let coaTokens = this.byId("coaMulti").getTokens();
        return coaTokens.map((token) => {
          return token.mProperties.key;
        });
      },

      getaccGroupMultiTokens: function () {
        let coaTokens = this.byId("accGroupMulti").getTokens();
        return coaTokens.map((token) => {
          return token.mProperties.key;
        });
      },
      

      onAccGroupValueHelpRequested: function () {
        var coaTokens = this.getCoaTokens();
        var coaFilter = [];
        accGroupFilter = [];
        if (coaTokens.length > 0) {
          coaTokens.forEach((coa) => {
            coaFilter.push(new Filter("AC_COA", FilterOperator.Contains, coa));
          });
          accGroupFilter.push(new Filter(coaFilter, false));
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
                console.log(oTable2);
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
        
        var arr2 = [];

        for(let i=0; i<aTokens.length; i++) {
            arr2.push(
              new Token({
                key: aTokens[i].mAggregations.customData[0].getValue()["AC_COA"],
                text: aTokens[i].mAggregations.customData[0].getValue()["AC_COA"],
              })
            );
            console.log(arr2);

            // 중복제거
            for (let j=0; j<arr2.length-1; j++) {
              if (arr2[j].getProperty("key") == aTokens[i].mAggregations.customData[0].getValue()["AC_COA"]) {
                arr2.pop();
              }
            }
        }

        this._oMultiInput.setTokens(arr2);

        this._oVHD2.close();
      },

      onACGroupCancelPress: function () {
        this._oVHD2.close();
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

      onAcGroupFilterBarSearch: function (oEvent) {
        var sSearchQuery = this._oBasicSearchField2.getValue(),
          aSelectionSet = oEvent.getParameter("selectionSet");

        console.log(aSelectionSet);
        console.log(sSearchQuery);

        var filter = [];
        aSelectionSet.reduce(function (aResult, oControl) {
          if (oControl.getValue()) {
            accGroupFilter.push(
              new Filter({
                path: oControl.getName(),
                operator: FilterOperator.Contains,
                value1: oControl.getValue(),
              })
            );
          }
        }, []);

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
          var coaTokens = this.getCoaTokens();
          var coaFilter = [];
          accGroupFilter = [];
          if (coaTokens.length > 0) {
            coaTokens.forEach((coa) => {
              coaFilter.push(
                new Filter("AC_COA", FilterOperator.Contains, coa)
              );
            });
            accGroupFilter.push(new Filter(coaFilter, false));
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

      onCheckSelect() {},
    });
  }
);

sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    "sap/ui/model/json/JSONModel",
    "sap/ui/export/Spreadsheet",
    "sap/ui/export/library",
    "sap/ui/model/type/String",
    "sap/m/ColumnListItem",
    "sap/m/Label",
    "sap/m/SearchField",
    "sap/m/Token",
    "sap/ui/table/Column",
    "sap/m/Column",
  ],
  function (
    Controller,
    formatter,
    Filter,
    FilterOperator,
    Fragment,
    Sorter,
    JSONModel,
    Spreadsheet,
    library,
    TypeString,
    ColumnListItem,
    Label,
    SearchField,
    Token,
    UIColumn,
    MColumn
  ) {
    "use strict";
    let totalNumber;
    let that;
    const EdmType = library.EdmType;

    return Controller.extend("projectBP.controller.BusinessPartner", {
      formatter: formatter,

      onInit: async function () {
        this.getOwnerComponent()
          .getRouter()
          .getRoute("BusinessPartner")
          .attachPatternMatched(this.onMyRoutePatternMatched, this);

        var oMultiInput;
        // Value Help Dialog standard use case with filter bar without filter suggestions
        oMultiInput = this.byId("bp_country");
        oMultiInput.addValidator(this._onMultiInputValidate);
        this._oMultiInput = oMultiInput;

        const countryData = await $.ajax({
          type: "GET",
          url: "/business-partner/Country",
        });
        console.log(countryData);
        this.getView().setModel(new JSONModel(countryData.value), "Country");

        // 고객 테이블 행갯수 카운트
        const BusinessPartner = await $.ajax({
          type: "get",
          url: "/business-partner/BP",
        });
        let BusinessPartnerModel = new JSONModel(BusinessPartner.value);
        this.getView().setModel(BusinessPartnerModel, "BusinessPartnerModel");
        var sum = this.getView().getModel("BusinessPartnerModel").oData.length;

        this.byId("bp_tableName").setText("고객 (" + sum + ")");
      },

      onMyRoutePatternMatched: async function () {
        that = this;
        const BusinessPartner = await $.ajax({
          type: "get",
          url: "/business-partner/BP",
        });

        let BusinessPartnerModel = new JSONModel(BusinessPartner.value);
        this.getView().setModel(BusinessPartnerModel, "BusinessPartnerModel");
      },

      onCellClick: function (e) {
        console.log(e.getSource());
        var sPath = e.getSource().oBindingContexts.BusinessPartnerModel.sPath;
        var detailNum = this.getView()
          .getModel("BusinessPartnerModel")
          .getProperty(sPath).BP_CODE;
        this.getOwnerComponent()
          .getRouter()
          .navTo("DetailBusinessPartner", { num: detailNum });
      },

      onSearch: function () {
        let bp_postCode = this.byId("bp_postCode").getValue();
        let bp_name = this.byId("bp_name").getValue();
        let bp_address = this.byId("bp_address").getValue();
        let bp_city = this.byId("bp_city").getValue();
        let bp_countries = this.byId("bp_country").getTokens();
        let bp_category = this.byId("bp_category").getSelectedKey();
        let bp_company_code = this.byId("bp_company_code").getValue();

        let countryTokens = bp_countries.map((country) => {
          return country.mProperties.key;
        });

        console.log("Tokens = ", countryTokens);

        var aFilter = [];
        var countryFilter = [];
        var nameFilter = [];

        if (countryTokens.length > 0) {
          countryTokens.forEach((country) => {
            countryFilter.push(
              new Filter("BP_COUNTRY", FilterOperator.Contains, country)
            );
          });
          aFilter.push(new Filter(countryFilter, false));
        }

        if (bp_postCode) {
          aFilter.push(
            new Filter("BP_POSTCODE", FilterOperator.Contains, bp_postCode)
          );
        }
        if (bp_name) {
          nameFilter.push(
            new Filter("BP_NAME", FilterOperator.Contains, bp_name)
          );
          nameFilter.push(
            new Filter("BP_CODE", FilterOperator.Contains, bp_name)
          );
          aFilter.push(new Filter(nameFilter, false));
        }
        if (bp_address) {
          aFilter.push(
            new Filter("BP_ADDRESS", FilterOperator.Contains, bp_address)
          );
        }
        if (bp_city) {
          aFilter.push(new Filter("BP_CITY", FilterOperator.Contains, bp_city));
        }
        if (bp_category) {
          aFilter.push(
            new Filter("BP_CATEGORY", FilterOperator.Contains, bp_category)
          );
        }
        if (bp_company_code) {
          aFilter.push(
            new Filter(
              "BP_COMPANY_CODE",
              FilterOperator.Contains,
              bp_company_code
            )
          );
        }

        let oTable = this.byId("BusinessPartnerTable").getBinding("items");
        oTable.filter(aFilter);

        // 고객 테이블 행갯수 카운트 (검색 필터링)
        var sumSearch = oTable.aIndices.length;
        this.byId("bp_tableName").setText("고객 (" + sumSearch + ")");
      },

      onReset: function () {
        this.byId("bp_postCode").setValue("");
        this.byId("bp_name").setValue("");
        this.byId("bp_address").setValue("");
        this.byId("bp_city").setValue("");
        this.byId("bp_country").setTokens([]);
        this.byId("bp_category").setSelectedKey("");
        this.byId("bp_company_code").setValue("");

        this.onSearch();
      },

      // 팝업 : '생성'버튼 클릭 시 개인생성,조직생성 택1 메뉴 작동
      onCreate: function (oEvent) {
        var oButton = oEvent.getSource();
        this.byId("bp_createAction").openBy(oButton);
      },

      // 팝업 : '개인 생성' 화면 기능
      onCreate_person: function () {
        if (!this.byId("bp_personDialog")) {
          Fragment.load({
            id: this.getView().getId(),
            name: "projectBP.view.fragments.CreateBusinessPartnerDialog_person",
            controller: this,
          }).then(
            function (oDialog) {
              this.getView().addDependent(oDialog);
              oDialog.open();
            }.bind(this)
          );
        } else {
          this.byId("bp_personDialog").open();
        }
      },

      onCreateDialog_person: async function () {
        let Test = this.byId("bp_category_person").getText();
        if (Test == 1) {
          Test = "A";
        } else {
          Test = "B";
        }

        var temp = {
          BP_CODE: this.byId("bp_code_person").getValue(),
          BP_ADDRESS: this.byId("bp_address_person").getValue(),
          BP_COMPANY_CODE: this.byId("bp_company_code_person").getValue(),
          BP_CATEGORY: Test,
          // BP_SPECIFIC_ADDRESS: this.byId("bp_specific_address_person").getValue(),
          BP_NAME_TITLE: this.byId("bp_name_title_person").getValue(),
          BP_POSTCODE: this.byId("bp_postCode_person").getValue(),
          BP_NAME: this.byId("bp_name_person").getValue(),
          BP_CITY: this.byId("bp_city_person").getValue(),
          BP_COUNTRY: this.byId("bp_country_person").getValue(),
          // BP_REGION: this.byId("bp_region_person").getValue(),
        };

        this.byId("bp_code_person").setValueState("None");
        this.byId("bp_company_code_person").setValueState("None");
        this.byId("bp_name_person").setValueState("None");
        if (!temp.BP_COMPANY_CODE || !temp.BP_CODE || !temp.BP_NAME) {
          if (!temp.BP_COMPANY_CODE) {
            this.byId("bp_company_code_person").setValueState("Error");
            this.byId("bp_company_code_person").setValueStateText(
              "회사 코드를 입력해주세요."
              );
            } 

          if (!temp.BP_CODE) {
            this.byId("bp_code_person").setValueState("Error");
            this.byId("bp_code_person").setValueStateText(
              "BP 코드를 입력해주세요."
            );
          }
          if (!temp.BP_NAME) {
            this.byId("bp_name_person").setValueState("Error");
            this.byId("bp_name_person").setValueStateText(
              "BP 이름을 입력해주세요."
            );
          }
          return 0;
        }

        await $.ajax({
          type: "POST",
          url: "/business-partner/BP",
          contentType: "application/json;IEEE754Compatible=true",
          data: JSON.stringify(temp),
        });

        that.onMyRoutePatternMatched();
        this.byId("bp_personDialog").destroy();
      },

      onCancelDialog_person: function () {
        this.byId("bp_personDialog").destroy();
      },

      // '생성'버튼 눌렀을 때 개인생성,조직생성 택1 메뉴 작동
      onCreate: function (oEvent) {
        var oButton = oEvent.getSource();
        this.byId("bp_createAction").openBy(oButton);
      },

      // 팝업 : '조직 생성' 화면 기능
      onCreate_organization: function () {
        if (!this.byId("bp_organizationDialog")) {
          Fragment.load({
            id: this.getView().getId(),
            name: "projectBP.view.fragments.CreateBusinessPartnerDialog_organization",
            controller: this,
          }).then(
            function (oDialog) {
              this.getView().addDependent(oDialog);
              oDialog.open();
            }.bind(this)
          );
        } else {
          this.byId("bp_organizationDialog").open();
        }
      },

      // '삭제 아이콘' 클릭 시 정렬
      onCreateDialog_organization: async function () {
        let Test = this.byId("bp_category_organization").getText();
        if (Test == 1) {
          Test = "A";
        } else {
          Test = "B";
        }

        var temp = {
          BP_CODE: this.byId("bp_code_organization").getValue(),
          BP_ADDRESS: this.byId("bp_address_organization").getValue(),
          BP_COMPANY_CODE: this.byId("bp_company_code_organization").getValue(),
          BP_CATEGORY: Test,
          // BP_SPECIFIC_ADDRESS: this.byId("bp_specific_address_person").getValue(),
          BP_NAME_TITLE: this.byId("bp_org_division_organization").getValue(),
          BP_POSTCODE: this.byId("bp_postCode_organization").getValue(),
          BP_NAME: this.byId("bp_name_organization").getValue(),
          BP_CITY: this.byId("bp_city_organization").getValue(),
          BP_COUNTRY: this.byId("bp_country_organization").getValue(),
          // BP_REGION: this.byId("bp_region_person").getValue(),
        };

        this.byId("bp_company_code_organization").setValueState("None");
        this.byId("bp_code_organization").setValueState("None");
        this.byId("bp_name_organization").setValueState("None");
        if (!temp.BP_COMPANY_CODE || !temp.BP_CODE || !temp.BP_NAME) {
          if (!temp.BP_COMPANY_CODE) {
            this.byId("bp_company_code_organization").setValueState("Error");
            this.byId("bp_company_code_organization").setValueStateText(
              "회사 코드를 입력해주세요."
              );
            } 

          if (!temp.BP_CODE) {
            this.byId("bp_code_organization").setValueState("Error");
            this.byId("bp_code_organization").setValueStateText(
              "BP 코드를 입력해주세요."
            );
          }
          if (!temp.BP_NAME) {
            this.byId("bp_name_organization").setValueState("Error");
            this.byId("bp_name_organization").setValueStateText(
              "BP 이름을 입력해주세요."
            );
          }
          return 0;
        }

        await $.ajax({
          type: "POST",
          url: "/business-partner/BP",
          contentType: "application/json;IEEE754Compatible=true",
          data: JSON.stringify(temp),
        });

        that.onMyRoutePatternMatched();
        this.byId("bp_organizationDialog").destroy();
      },

      onCancelDialog_organization: function () {
        this.byId("bp_organizationDialog").destroy();
      },

      // '정렬 아이콘' 클릭 시
      onSort: function () {
        if (!this.byId("bp_sortDialog")) {
          Fragment.load({
            id: this.getView().getId(),
            name: "projectBP.view.fragments.SortBusinessPartnerDialog",
            controller: this,
          }).then(
            function (oDialog) {
              this.getView().addDependent(oDialog);
              oDialog.open();
            }.bind(this)
          );
        } else {
          this.byId("bp_sortDialog").open();
        }
        this.onSearch();
      },

      onConfirmSortDialog: function (oEvent) {
        let mParams = oEvent.getParameters();
        let sPath = mParams.sortItem.getKey();
        let bDescending = mParams.sortDescending;
        let aSorters = [];

        aSorters.push(new Sorter(sPath, bDescending));

        let oBinding = this.byId("BusinessPartnerTable").getBinding("items");
        oBinding.sort(aSorters);
      },

      onDelete: async function () {
        totalNumber = this.getView().getModel("BusinessPartnerModel").oData
          .length;
        let model = this.getView().getModel("BusinessPartnerModel");
        let i;
        for (i = 0; i < totalNumber; i++) {
          let chk = "/" + i + "/CHK";
          let key = "/" + i + "/BP_CODE";
          if (
            this.getView().getModel("BusinessPartnerModel").getProperty(chk) ===
            true
          ) {
            let BP_CODE = this.getView()
              .getModel("BusinessPartnerModel")
              .getProperty(key);
            let url = "/business-partner/BP/" + BP_CODE;
            await $.ajax({
              type: "DELETE",
              url: url,
            });
          }
          this.onMyRoutePatternMatched();
        }
      },

      onDataExport: function () {
        let aCols, oRowBinding, oSettings, oSheet, oTable;
        oTable = this.byId("BusinessPartnerTable");
        console.log(oTable);
        oRowBinding = oTable.getBinding("items");
        console.log(oRowBinding);
        aCols = this.createColumnConfig();

        //필터링 된 값만 받기위해 데이터를 선언 (oList를 담기)
        let oList = [];

        for (let j = 0; j < oRowBinding.oList.length; j++) {
          if (oRowBinding.aIndices.indexOf(j) > -1) {
            oList.push(oRowBinding.oList[j]);
          }
        }

        oSettings = {
          workbook: {
            columns: aCols,
            hierarchyLevel: "Level",
          },
          dataSource: oList,
          fileName: "BusinessPartnerTable.xlsx",
          worker: false,
        };
        oSheet = new Spreadsheet(oSettings);
        oSheet.build().finally(function () {
          oSheet.destroy();
        });
      },

      createColumnConfig: function () {
        const aCols = [];
        aCols.push({
          label: "비즈니스 파트너",
          property: "BP_CODE",
          type: EdmType.String,
        });
        aCols.push({
          label: "회사 코드",
          property: "BP_COMPANY_CODE",
          type: EdmType.String,
        });
        aCols.push({
          label: "도로 주소",
          property: "BP_ADDRESS",
          type: EdmType.String,
        });
        aCols.push({
          label: "시",
          property: "BP_CITY",
          type: EdmType.String,
        });
        aCols.push({
          label: "우편번호",
          property: "BP_POSTCODE",
          type: EdmType.String,
        });
        aCols.push({
          label: "국가/지역",
          property: "BP_COUNTRY",
          type: EdmType.String,
        });
        aCols.push({
          label: "BP 범주",
          property: "BP_CATEGORY",
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

      // #region Value Help Dialog standard use case with filter bar without filter suggestions
      onValueHelpRequested: function () {
        if (!this._oBasicSearchField)
          this._oBasicSearchField = new SearchField();
        if (!this.pDialog) {
          this.pDialog = this.loadFragment({
            name: "projectBP.view.fragments.BusinessPartnerCountryDialog",
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
                label: "COUNTRY_CODE",
                key: "COUNTRY_CODE",
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
                oTable.setModel(this.getView().getModel("Country"));

                // For Desktop and tabled the default table is sap.ui.table.Table
                if (oTable.bindRows) {
                  // Bind rows to the ODataModel and add columns
                  oTable.bindAggregation("rows", {
                    path: "Country>/",
                    events: {
                      dataReceived: function () {
                        oDialog.update();
                      },
                    },
                  });
                  oTable.addColumn(
                    new UIColumn({
                      label: "COUNTRY_CODE",
                      template: "Country>COUNTRY_CODE",
                    })
                  );
                  oTable.addColumn(
                    new UIColumn({
                      label: "COUNTRY_NAME",
                      template: "Country>COUNTRY_NAME",
                    })
                  );
                }

                // For Mobile the default table is sap.m.Table
                if (oTable.bindItems) {
                  // Bind items to the ODataModel and add columns
                  oTable.bindAggregation("items", {
                    path: "Country>/",
                    template: new ColumnListItem({
                      cells: [
                        new Label({ text: "{COUNTRY_CODE}" }),
                        new Label({ text: "{COUNTRY_NAME}" }),
                      ],
                    }),
                    events: {
                      dataReceived: function () {
                        oDialog.update();
                      },
                    },
                  });
                  oTable.addColumn(
                    new MColumn({ header: new Label({ text: "COUNTRY_CODE" }) })
                  );
                  oTable.addColumn(
                    new MColumn({ header: new Label({ text: "COUNTRY_NAME" }) })
                  );
                }
                oDialog.update();
              }.bind(this)
            );

            console.log(this._oMultiInput);
            oDialog.setTokens(this._oMultiInput.getTokens());

            // set flag that the dialog is initialized
            this._bDialogInitialized = true;
            oDialog.open();
          }.bind(this)
        );
      },

      onValueHelpOkPress: function (oEvent) {
        console.log(oEvent);
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
        console.log(oEvent.getParameters());

        var sSearchQuery = this._oBasicSearchField.getValue(),
          aSelectionSet = oEvent.getParameter("selectionSet");

        console.log(aSelectionSet);

        var filter = [];

        var aFilters = aSelectionSet.reduce(function (aResult, oControl) {
          console.log(aResult, oControl.getValue());
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
                path: "COUNTRY_CODE",
                operator: FilterOperator.Contains,
                value1: sSearchQuery,
              }),
              new Filter({
                path: "COUNTRY_NAME",
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
    });
  }
);

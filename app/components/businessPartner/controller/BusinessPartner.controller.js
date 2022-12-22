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
    var bp_code;
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
        countryData.value.push({
          COUNTRY_CODE: "ETC",
          COUNTRY_NAME: "OTHERS",
        });
        this.getView().setModel(new JSONModel(countryData.value), "Country");

        const CompanyCode = await $.ajax({
          type: "get",
          url: "/general-ledger/CompanyCode",
        });
        let CompanyCodeModel = new JSONModel(CompanyCode.value);
        this.getView().setModel(CompanyCodeModel, "CompanyCode");

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
        const firstData = await $.ajax({
          type: "GET",
          url: "/business-partner/BP?$orderby=BP_CODE desc&$top=1",
        });

        bp_code = parseInt(firstData.value[0].BP_CODE) + 1;

        this.getView().setModel(new JSONModel({ code: bp_code }), "BP_CODE");
        that = this;

        const BusinessPartner = await $.ajax({
          type: "get",
          url: "/business-partner/BP",
        });

        const countryData = await $.ajax({
          type: "GET",
          url: "/business-partner/Country",
        });

        let BusinessPartnerModel = new JSONModel(BusinessPartner.value);
        this.getView().setModel(BusinessPartnerModel, "BusinessPartnerModel");
        this.getView().setModel(
          new JSONModel(countryData.value),
          "CountryData"
        );

        var sum = this.getView().getModel("BusinessPartnerModel").oData.length;
        this.byId("bp_tableName").setText("고객 (" + sum + ")");
        this.onReset();
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

        var aFilter = [];
        var countryFilter = [];
        var nameFilter = [];

        var countryArr = this.getView().getModel("Country").oData;
        countryArr = countryArr.map((country) => {
          return country.COUNTRY_CODE;
        });

        let ETCcount = false;
        let notSelectedCountry;

        if (countryTokens.length > 0) {
          countryTokens.forEach((country) => {
            if (country === "ETC") {
              ETCcount = true;
            }
          });

          if (ETCcount) {
            countryArr.forEach((tokenKey) => {
              notSelectedCountry = false;

              countryTokens.forEach((countryKey) => {
                if (tokenKey === countryKey) {
                  notSelectedCountry = true;
                  return;
                }
              });

              if (!notSelectedCountry) {
                countryFilter.push(
                  new Filter("BP_COUNTRY", FilterOperator.NE, tokenKey)
                );
              }
            });
            aFilter.push(new Filter(countryFilter, true));
          } else {
            countryTokens.forEach((countryKey) => {
              countryFilter.push(
                new Filter("BP_COUNTRY", FilterOperator.EQ, countryKey)
              );
            });
            aFilter.push(new Filter(countryFilter, false));
          }
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
        let categorySelect = this.byId("bp_category_person").getText();
        if (categorySelect == "개인 (1)") {
          categorySelect = "A";
        } else {
          categorySelect = "B";
        }

        var temp = {
          BP_CODE: (bp_code++).toString(),
          BP_ADDRESS: this.byId("bp_address_person").getValue(),
          BP_COMPANY_CODE: this.byId("bp_company_code_person").getSelectedKey(),
          BP_CATEGORY: categorySelect,
          BP_SPECIFIC_ADDRESS: this.byId(
            "bp_specific_address_person"
          ).getValue(),
          BP_NAME_TITLE: this.byId("bp_name_title_person").getSelectedKey(),
          BP_POSTCODE: this.byId("bp_postCode_person").getValue(),
          BP_NAME: this.byId("bp_name_person").getValue(),
          BP_CITY: this.byId("bp_city_person").getValue(),
          BP_COUNTRY: this.byId("bp_country_person").getSelectedKey(),
          BP_REGION: this.byId("bp_region_person").getValue(),
        };

        this.byId("bp_company_code_person").setValueState("None");
        this.byId("bp_name_person").setValueState("None");
        this.byId("bp_country_person").setValueState("None");
        if (!temp.BP_COMPANY_CODE || !temp.BP_NAME || !temp.BP_COUNTRY) {
          if (!temp.BP_COMPANY_CODE) {
            this.byId("bp_company_code_person").setValueState("Error");
            this.byId("bp_company_code_person").setValueStateText(
              "회사 코드를 입력해주세요."
            );
          }

          if (!temp.BP_NAME) {
            this.byId("bp_name_person").setValueState("Error");
            this.byId("bp_name_person").setValueStateText(
              "이름을 입력해주세요."
            );
          }
          console.log(temp.BP_COUNTRY);
          if (!temp.BP_COUNTRY) {
            this.byId("bp_country_person").setValueState("Error");
            this.byId("bp_country_person").setValueStateText(
              "국가/지역을 입력해주세요."
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

      // 뷰 : '개인 생성(대량)' 화면 기능
      onMassCreate_person: function () {
        this.getOwnerComponent()
          .getRouter()
          .navTo("MassCreateBusinessPartner_person");
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
        let categorySelect = this.byId("bp_category_organization").getText();
        if (categorySelect == "개인 (1)") {
          categorySelect = "A";
        } else {
          categorySelect = "B";
        }

        var temp = {
          BP_CODE: (bp_code++).toString(),
          BP_ADDRESS: this.byId("bp_address_organization").getValue(),
          BP_COMPANY_CODE: this.byId(
            "bp_company_code_organization"
          ).getSelectedKey(),
          BP_CATEGORY: categorySelect,
          BP_SPECIFIC_ADDRESS: this.byId(
            "bp_specific_address_organization"
          ).getValue(),
          BP_NAME_TITLE: this.byId(
            "bp_org_division_organization"
          ).getSelectedKey(),
          BP_POSTCODE: this.byId("bp_postCode_organization").getValue(),
          BP_NAME: this.byId("bp_name_organization").getValue(),
          BP_CITY: this.byId("bp_city_organization").getValue(),
          BP_COUNTRY: this.byId("bp_country_organization").getSelectedKey(),
          BP_REGION: this.byId("bp_region_organization").getValue(),
          BP_REGISTRATION_NUMBER: this.byId(
            "bp_registration_number_organization"
          ).getValue(),
        };

        this.byId("bp_company_code_organization").setValueState("None");
        this.byId("bp_name_organization").setValueState("None");
        this.byId("bp_registration_number_organization").setValueState("None");
        this.byId("bp_country_organization").setValueState("None");
        if (
          !temp.BP_COMPANY_CODE ||
          !temp.BP_NAME ||
          !temp.BP_REGISTRATION_NUMBER ||
          !temp.BP_COUNTRY
        ) {
          if (!temp.BP_COMPANY_CODE) {
            this.byId("bp_company_code_organization").setValueState("Error");
            this.byId("bp_company_code_organization").setValueStateText(
              "회사 코드를 입력해주세요."
            );
          }
          if (!temp.BP_NAME) {
            this.byId("bp_name_organization").setValueState("Error");
            this.byId("bp_name_organization").setValueStateText(
              "이름을 입력해주세요."
            );
          }
          if (!temp.BP_REGISTRATION_NUMBER) {
            this.byId("bp_registration_number_organization").setValueState(
              "Error"
            );
            this.byId("bp_registration_number_organization").setValueStateText(
              "사업자등록번호를 입력해주세요."
            );
          }
          if (!temp.BP_COUNTRY) {
            this.byId("bp_country_organization").setValueState("Error");
            this.byId("bp_country_organization").setValueStateText(
              "국가/지역를 입력해주세요."
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

      // 뷰 : '조직 생성(대량)' 화면 기능
      onMassCreate_organization: function () {
        this.getOwnerComponent()
          .getRouter()
          .navTo("MassCreateBusinessPartner_organization");
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

          if (model.getProperty(chk) === true) {
            model.getProperty(key);
            let BP_CODE = model.getProperty(key);
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

        for (let i = 0; i < oList.length; i++) {
          if (oList[i].BP_CATEGORY === "A") {
            oList[i].BP_CATEGORY2 = "개인 (1)";
          }
          if (oList[i].BP_CATEGORY === "B") {
            oList[i].BP_CATEGORY2 = "조직 (2)";
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
          property: "BP_CATEGORY2",
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

      // 조회화면에 국가/지역 valuehelp 추가 : #region Value Help Dialog standard use case with filter bar without filter suggestions
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

              this._oBasicSearchField.setValue("");
              this.onFilterBarSearch();

              oDialog.open();
              return;
            }
            this.getView().addDependent(oDialog);

            // Set key fields for filtering in the Define Conditions Tab
            oDialog.setRangeKeyFields([
              {
                label: "국가/지역 코드",
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
                      label: "국가/지역 코드",
                      template: "Country>COUNTRY_CODE",
                    })
                  );
                  oTable.addColumn(
                    new UIColumn({
                      label: "국가/지역 이름",
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

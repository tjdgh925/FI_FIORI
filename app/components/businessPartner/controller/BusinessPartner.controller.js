sap.ui.define([
  'sap/ui/core/mvc/Controller',
  "../model/formatter",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/core/Fragment",
  "sap/ui/model/Sorter",
  "sap/ui/model/json/JSONModel",
  "sap/ui/export/Spreadsheet",
  "sap/ui/export/library"
], function (Controller, formatter, Filter, FilterOperator, Fragment, Sorter, JSONModel, Spreadsheet, library) {
  'use strict';
  let totalNumber;
  let that;
  const EdmType = library.EdmType;

  return Controller.extend('projectBP.controller.BusinessPartner', {
    formatter: formatter,

    onInit: async function () {
      this.getOwnerComponent()
        .getRouter()
        .getRoute("BusinessPartner")
        .attachPatternMatched(this.onMyRoutePatternMatched, this);

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


    onSearch: function () {
      let bp_postCode = this.byId("bp_postCode").getValue();
      let bp_name = this.byId("bp_name").getValue();
      let bp_address = this.byId("bp_address").getValue();
      let bp_city = this.byId("bp_city").getValue();
      let bp_country = this.byId("bp_country").getValue();
      let bp_category = this.byId("bp_category").getSelectedKey();
      let bp_company_code = this.byId("bp_company_code").getValue();


      var aFilter = [];

      if (bp_postCode) {
        aFilter.push(new Filter("BP_POSTCODE", FilterOperator.Contains, bp_postCode));
      }
      if (bp_name) {
        aFilter.push(new Filter("BP_NAME", FilterOperator.Contains, bp_name));
      }
      if (bp_address) {
        aFilter.push(new Filter("BP_ADDRESS", FilterOperator.Contains, bp_address));
      }
      if (bp_city) {
        aFilter.push(new Filter("BP_CITY", FilterOperator.Contains, bp_city));
      }
      if (bp_country) {
        aFilter.push(new Filter("BP_COUNTRY", FilterOperator.Contains, bp_country));
      }
      if (bp_category) {
        aFilter.push(new Filter("BP_CATEGORY", FilterOperator.Contains, bp_category));
      }
      if (bp_company_code) {
        aFilter.push(new Filter("BP_COMPANY_CODE", FilterOperator.Contains, bp_company_code));
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
      this.byId("bp_country").setValue("");
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
        Test = "A"
      } else {
        Test = "B"
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
        Test = "A"
      } else {
        Test = "B"
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

      await $.ajax({
        type: "POST",
        url: "/business-partner/BP",
        contentType: "application/json;IEEE754Compatible=true",
        data: JSON.stringify(temp),
      });

      that.onMyRoutePatternMatched();
      this.byId("bp_organizationDialog").destroy();
    },

    onCancelDialog_person: function () {
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
      totalNumber = this.getView().getModel("BusinessPartnerModel").oData.length;
      let model = this.getView().getModel("BusinessPartnerModel");
      let i;
      for (i = 0; i < totalNumber; i++) {
        let chk = "/" + i + "/CHK";
        let key = "/" + i + "/BP_CODE";
        if (
          this.getView().getModel("BusinessPartnerModel").getProperty(chk) === true
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
      oTable = this.byId('BusinessPartnerTable');
      console.log(oTable);
      oRowBinding = oTable.getBinding('items');
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
          hierarchyLevel: 'Level'
        },
        dataSource: oList,
        fileName: 'BusinessPartnerTable.xlsx',
        worker: false
      };
      oSheet = new Spreadsheet(oSettings);
      oSheet.build().finally(function () {
        oSheet.destroy();
      });
    },


    createColumnConfig: function () {
      const aCols = [];
      aCols.push({
        label: '비즈니스 파트너',
        property: 'BP_CODE',
        type: EdmType.String
      });
      aCols.push({
        label: '회사 코드',
        property: 'BP_COMPANY_CODE',
        type: EdmType.String
      });
      aCols.push({
        label: '도로 주소',
        property: 'BP_ADDRESS',
        type: EdmType.String
      });
      aCols.push({
        label: '시',
        property: 'BP_CITY',
        type: EdmType.String
      });
      aCols.push({
        label: '우편번호',
        property: 'BP_POSTCODE',
        type: EdmType.String
      });
      aCols.push({
        label: '국가/지역',
        property: 'BP_COUNTRY',
        type: EdmType.String
      });
      aCols.push({
        label: 'BP 범주',
        property: 'BP_CATEGORY',
        type: EdmType.String
      });

      return aCols;
    }

  });
});
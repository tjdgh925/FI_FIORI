sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
    "sap/ui/model/json/JSONModel",
  ],
  function (Controller, formatter, JSONModel) {
    "use strict";
    var SelectedNum;

    return Controller.extend("projectBP.controller.DetailBusinessPartner", {
      formatter: formatter,

      onInit() {
        var oData = {
          edit: false,
        };
        var oModel = new JSONModel(oData);
        this.getView().setModel(oModel, "editModel");

        var oData = {
          FinalSave: false,
        };
        var oModel = new JSONModel(oData);
        this.getView().setModel(oModel, "FinalSaveModel");

        this.getOwnerComponent()
          .getRouter()
          .getRoute("DetailBusinessPartner")
          .attachPatternMatched(this.onMyRoutePatternMatched, this);
      },

      onMyRoutePatternMatched: async function (oEvent) {
        var oData = {
          edit: false,
        };
        var oModel = new JSONModel(oData);
        this.getView().setModel(oModel, "editModel");

        var oData = {
          FinalSave: false,
        };
        var oModel = new JSONModel(oData);
        this.getView().setModel(oModel, "FinalSaveModel");

        if (oEvent !== "?") {
          SelectedNum = oEvent.getParameter("arguments").num;
        }

        let url = "/business-partner/BP/" + SelectedNum;

        const BP = await $.ajax({
          type: "get",
          url: url,
        });

        console.log(BP);
        let BusinessPartnerModel = new JSONModel(BP);

        this.getView().setModel(BusinessPartnerModel, "BusinessPartnerModel");

        var visible = { personal: false };
        let personal_visibleModel = new JSONModel(visible);

        if (BusinessPartnerModel.oData.BP_CATEGORY == "A") {
          personal_visibleModel.oData.personal = true;
        }

        this.getView().setModel(personal_visibleModel, "personal_visibleModel");

        var visible2 = { organization: false };
        let organization_visibleModel = new JSONModel(visible2);

        if (BusinessPartnerModel.oData.BP_CATEGORY == "B") {
          organization_visibleModel.oData.organization = true;
        }

        this.getView().setModel(
          organization_visibleModel,
          "organization_visibleModel"
        );

        var test2 = this.getView().getModel("BusinessPartnerModel").oData
          .createdAt;
        if (test2) {
          var date2 = test2.substring(0, 10);
          var year2 = date2.substring(0, 4);
          var month2 = date2.substring(5, 7);
          var day2 = date2.substring(8, 10);

          this.byId("bp_createdAt").setText(
            year2 + "년 " + month2 + "월 " + day2 + "일"
          );
        }

        var test = this.getView().getModel("BusinessPartnerModel").oData
          .modifiedAt;
        if (test) {
          var date = test.substring(0, 10);
          var year = date.substring(0, 4);
          var month = date.substring(5, 7);
          var day = date.substring(8, 10);

          this.byId("bp_modifiedAt").setText(
            year + "년 " + month + "월 " + day + "일"
          );
        }
        this.byId("bp_name2").setValueState();
        this.byId("bp_country2").setValueState();
        this.byId("bp_registration_number2").setValueState();

        const countryData = await $.ajax({
          type: "GET",
          url: "/business-partner/Country",
        });
        var countryjsonmodel = new JSONModel(countryData.value);
        countryjsonmodel.setSizeLimit(500);
        this.getView().setModel(countryjsonmodel, "CountryData");
        console.log(this.getView().getModel("CountryData"));
        this.byId("");
      },
      //편집버튼 눌렀을때 작동하는 기능
      onEdit: function () {
        this.byId("bp_name2").setValueState("None");
        this.byId("bp_registration_number2").setValueState("None");

        var test2 = this.getView().getModel("BusinessPartnerModel").oData
          .createdAt;
        if (test2) {
          var date2 = test2.substring(0, 10);
          var year2 = date2.substring(0, 4);
          var month2 = date2.substring(5, 7);
          var day2 = date2.substring(8, 10);

          this.byId("bp_createdAt").setText(
            year2 + "년 " + month2 + "월 " + day2 + "일"
          );
        }

        var test = this.getView().getModel("BusinessPartnerModel").oData
          .modifiedAt;
        if (test) {
          var date = test.substring(0, 10);
          var year = date.substring(0, 4);
          var month = date.substring(5, 7);
          var day = date.substring(8, 10);

          this.byId("bp_modifiedAt").setText(
            year + "년 " + month + "월 " + day + "일"
          );
        }

        this.getView().getModel("editModel").setProperty("/edit", true);

        console.log(this.byId("bp_country2").getSelectedKey());

        let orgDivision = this.byId("bp_org_division").getText();
        let bpLegalForm = this.byId("bp_legal_from").getText();
        let bpNameTitle = this.byId("bp_name_title").getText();
        let bpCountry = this.byId("bp_country").getText();


        this.byId("bp_org_division2").setSelectedKey(orgDivision);
        this.byId("bp_legal_from2").setSelectedKey(bpLegalForm);
        this.byId("bp_name_title2").setSelectedKey(bpNameTitle);
        this.byId("bp_country2").setSelectedKey(bpCountry);

        console.log(this.getView().getModel("BusinessPartnerModel"));
        console.log(this.getView().getModel("CountryData"));

        console.log(this.byId("bp_country2").getSelectedKey());
      },

      getBpData: async function () {
        const BP = await $.ajax({
          type: "get",
          url: url,
        });

        console.log(BP);
        let BusinessPartnerModel = new JSONModel(BP);
        this.getView().setModel(BusinessPartnerModel, "BusinessPartnerModel");
      },

      // > 버튼 -> 뒤로가기 기능 (BP조회 테이블 페이지로 돌아감)
      onBack: function () {
        this.getOwnerComponent().getRouter().navTo("BusinessPartner");
      },

      // 확인 버튼 클릭시 동작되는 기능
      onConfirm: function () {
        let bpStatus = this.byId("Status").getText();

        let validData;
        if (bpStatus === "개인 (1)") {
          validData = {
            BP_NAME: this.byId("bp_name2").getValue(),
            BP_COUNTRY: this.byId("bp_country2").getSelectedKey(),
            BP_CATEGORY: "A",
          };
        } else {
          validData = {
            BP_NAME: this.byId("bp_name2").getValue(),

            BP_REGISTRATION_NUMBER: this.byId(
              "bp_registration_number2"
            ).getValue(),
            BP_COUNTRY: this.byId("bp_country2").getSelectedKey(),
            BP_CATEGORY: "B",
          };
        }
        if (
          validData.BP_CATEGORY === "A" &&
          (!validData.BP_NAME || !validData.BP_COUNTRY)
        ) {
          if (!validData.BP_NAME) {
            this.byId("bp_name2").setValueState("Error");
            this.byId("bp_name2").setValueStateText("BP 이름을 입력해주세요.");
          }

          if (!validData.BP_COUNTRY) {
            this.byId("bp_country2").setValueState("Error");
            this.byId("bp_country2").setValueStateText(
              "국가/지역을 입력해주세요."
            );
          }
          return 0;
        }

        if (
          validData.BP_CATEGORY === "B" &&
          (!validData.BP_NAME ||
            !validData.BP_REGISTRATION_NUMBER ||
            !validData.BP_COUNTRY)
        ) {
          if (!validData.BP_NAME) {
            this.byId("bp_name2").setValueState("Error");
            this.byId("bp_name2").setValueStateText("BP 이름을 입력해주세요.");
          } else this.byId("bp_name2").setValueState();

          if (!validData.BP_REGISTRATION_NUMBER) {
            this.byId("bp_registration_number2").setValueState("Error");
            this.byId("bp_registration_number2").setValueStateText(
              "사업자등록번호를 입력해주세요."
            );
          } else this.byId("bp_registration_number2").setValueState();

          if (!validData.BP_COUNTRY) {
            this.byId("bp_country2").setValueState("Error");
            this.byId("bp_country2").setValueStateText(
              "국가/지역을 입력해주세요."
            );
          }
          return 0;
        }

        let orgDivision = this.byId("bp_org_division2").getSelectedKey();
        let bpLegalForm = this.byId("bp_legal_from2").getSelectedKey();
        let bpNameTitle = this.byId("bp_name_title2").getSelectedKey();
        let bpCountry = this.byId("bp_country2").getSelectedKey();

        if (orgDivision == "") orgDivision = "ㅡ";
        if (bpLegalForm == "") bpLegalForm = "ㅡ";
        if (bpNameTitle == "") bpNameTitle = "ㅡ";
        if (bpCountry == "") bpCountry = "ㅡ";

        this.byId("bp_org_division").setText(orgDivision);
        this.byId("bp_legal_from").setText(bpLegalForm);
        this.byId("bp_name_title").setText(bpNameTitle);
        this.byId("bp_country").setText(bpCountry);



        this.getView()
          .getModel("FinalSaveModel")
          .setProperty("/FinalSave", true);
        this.getView().getModel("editModel").setProperty("/edit", false);
      },

      //최종저장하시겠습니까 -> 최종저장 버튼
      onFinalSave: async function () {
        var temp = {
          BP_CODE: this.byId("bp_code").getText(),
          BP_ORG_DIVISION: this.byId("bp_org_division2").getSelectedKey(),
          BP_NAME_TITLE: this.byId("bp_name_title2").getSelectedKey(),
          BP_NAME: this.byId("bp_name2").getValue(),
          BP_REGISTRATION_NUMBER: this.byId(
            "bp_registration_number2"
          ).getValue(),
          BP_SEARCH: this.byId("bp_search2").getValue(),
          BP_AUTH_GROUP: this.byId("bp_auth_group2").getValue(),
          BP_LEGAL_FORM: this.byId("bp_legal_from2").getSelectedKey(),
          BP_ARCHIVING_FLAG: this.byId("bp_archiving_flag2").getValue(),
          BP_CUST_ACCOUNT_GROUP: this.byId("bp_cust_account_group2").getValue(),
          BP_CUST_AUTH_GROUP: this.byId("bp_cust_auth_group2").getValue(),
          BP_DELIVER_RULE: this.byId("bp_deliver_rule2").getValue(),
          BP_DELETE_FLAG: this.byId("bp_delete_flag2").getValue(),
          BP_GROUP_KEY: this.byId("bp_group_key2").getValue(),
          BP_SUPPLIER: this.byId("bp_supplier2").getValue(),
          BP_PROXY_PAYMENT: this.byId("bp_proxy_payment2").getValue(),
          BP_PAYMENT_REASON: this.byId("bp_payment_reason2").getValue(),
          BP_ORDER_HOLD: this.byId("bp_order_hold2").getValue(),
          BP_CLAIM_HOLD: this.byId("bp_claim_hold2").getValue(),
          BP_DELIVER_HOLD: this.byId("bp_deliver_hole2").getValue(),
          BP_ADDRESS: this.byId("bp_address2").getValue(),
          BP_SPECIFIC_ADDRESS: this.byId("bp_specific_address2").getValue(),
          BP_POSTCODE: this.byId("bp_postcode2").getValue(),
          BP_CITY: this.byId("bp_city2").getValue(),
          BP_COUNTRY: this.byId("bp_country2").getSelectedKey(),
          BP_REGION: this.byId("bp_region2").getValue(),
        };

        let url = "/business-partner/BP/" + temp.BP_CODE;

        await $.ajax({
          type: "patch",
          url: url,
          contentType: "application/json;IEEE754Compatible=true",
          data: JSON.stringify(temp),
        });
        this.getView().getModel("editModel").setProperty("/edit", true);
        this.getOwnerComponent().getRouter().navTo("BusinessPartner");
        this.onCancel();
      },

      //취소버튼 기능
      onCancel: function () {
        this.getView().getModel("editModel").setProperty("/edit", false);
        this.onMyRoutePatternMatched("?");
        this.getView()
          .getModel("FinalSaveModel")
          .setProperty("/FinalSave", false);
      },

      //아니오버튼 기능
      onGotopage: function () {
        this.getView().getModel("editModel").setProperty("/edit", false);
        this.getView().getModel("editModel").setProperty("/edit", true);
      },
    });
  }
);

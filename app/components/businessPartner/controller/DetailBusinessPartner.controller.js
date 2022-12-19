sap.ui.define(['sap/ui/core/mvc/Controller',
"../model/formatter",
"sap/ui/model/json/JSONModel",], function (Controller, formatter, JSONModel) {
  'use strict';
  var SelectedNum;
  
 
  return Controller.extend('projectBP.controller.DetailBusinessPartner', {
    formatter:formatter,
    

    

    onInit() {
      var oData = {
          edit: false
      };
      var oModel = new JSONModel(oData);
      this.getView().setModel(oModel, "editModel");

      var oData = {
        FinalSave: false
    };
    var oModel = new JSONModel(oData);
    this.getView().setModel(oModel, "FinalSaveModel");




      this.getOwnerComponent().getRouter().getRoute("DetailBusinessPartner")
                .attachPatternMatched(this.onMyRoutePatternMatched, this);


    

    },

    onEdit: function () {
      this.getView().getModel("editModel").setProperty("/edit", true);
  },

  onMyRoutePatternMatched: async function (oEvent) {
    if(oEvent !=="?") {
      SelectedNum = oEvent.getParameter("arguments").num;
    }
    console.log(SelectedNum);
   
    let url = "/business-partner/BP/" + SelectedNum
   console.log(url);
   const BP = await $.ajax({
       type: "get",
       url: url
   });



   console.log(BP);
   let BusinessPartnerModel = new JSONModel(BP);
   this.getView().setModel(BusinessPartnerModel, "BusinessPartnerModel");
   console.log(this.getView().setModel(BusinessPartnerModel, "BusinessPartnerModel"));

   var visible = { personal: false }
   let personal_visibleModel = new JSONModel(visible);

   if (BusinessPartnerModel.oData.BP_CATEGORY == 'A') {
    personal_visibleModel.oData.personal = true;
   }

   this.getView().setModel(personal_visibleModel, "personal_visibleModel");



   var test2 = this.getView().getModel("BusinessPartnerModel").oData.createdAt;
   var date2 = test2.substring(0,10);
   var year2 = date2.substring(0,4);
   var month2 = date2.substring(5,7);
   var day2 = date2.substring(8,10);
   
   console.log(year2 + "년 " + month2 + "월 " + day2 + "일");
   this.byId("bp_createdAt").setText(year2 + "년 " + month2 + "월 " + day2 + "일");



   var test = this.getView().getModel("BusinessPartnerModel").oData.modifiedAt;
   var date = test.substring(0,10);
   var year = date.substring(0,4);
   var month = date.substring(5,7);
   var day = date.substring(8,10);
   
   console.log(year + "년 " + month + "월 " + day+ "일");
   this.byId("bp_modifiedAt").setText(year + "년 " + month + "월 " + day + "일");



   var visible2 = { organization: false }
   let organization_visibleModel = new JSONModel(visible2);

   if (BusinessPartnerModel.oData.BP_CATEGORY == 'B') {
    organization_visibleModel.oData.organization = true;
   }

   this.getView().setModel(organization_visibleModel, "organization_visibleModel");
  
  

},

onBack: function () {
  this.getOwnerComponent().getRouter().navTo("BusinessPartner");

},



onConfirm: function () {

   
    this.getView().getModel("FinalSaveModel").setProperty("/FinalSave", true);
    this.getView().getModel("editModel").setProperty("/edit", false);

  

},

onFinalSave: async function () {

  var temp = {
    BP_CODE: this.byId("bp_code").getText(),
    BP_ORG_DIVISION: this.byId("bp_org_division2").getValue(),
    BP_NAME: this.byId("bp_name2").getValue(),
    BP_SEARCH: this.byId("bp_search2").getValue(),
    BP_AUTH_GROUP: this.byId("bp_auth_group2").getValue(),
    BP_LEGAL_FORM: this.byId("bp_legal_from2").getValue(),
    // BP_ARCHIVING_FLAG: this.byId("bp_archiving_flag2").getValue(),
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
    //BP_SPECIFIC_ADDRESS: this.byId("bp_specific_address2").getValue(),
    BP_POSTCODE: this.byId("bp_postcode2").getValue(),
    BP_CITY: this.byId("bp_city2").getValue(),
    BP_COUNTRY: this.byId("bp_country2").getValue(),
    //BP_REGION: this.byId("bp_region2").getValue(),
    BP_NAME_TITLE: this.byId("bp_name_title2").getValue(),

  };

  let url = "/business-partner/BP/" + temp.BP_CODE;

  await $.ajax({
      type: "patch",
      url: url,
      contentType: "application/json;IEEE754Compatible=true",
      data: JSON.stringify(temp)
  });
  this.getOwnerComponent().getRouter().navTo("BusinessPartner");
  

},

onCancel: function () {
    this.getView().getModel("editModel").setProperty("/edit", false);
    this.onMyRoutePatternMatched("?");
    this.getView().getModel("FinalSaveModel").setProperty("/FinalSave", false);
   
    // this.onMyRoutePatternMatched("?");
    // this.getView().getModel("editModel").setProperty("/edit", true);
   
    

},
onGotopage: function () {
  this.getView().getModel("editModel").setProperty("/edit", false);
 
  this.getView().getModel("editModel").setProperty("/edit", true);
 
  
}

  });
});

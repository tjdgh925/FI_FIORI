sap.ui.define(['sap/ui/core/mvc/Controller',
"sap/ui/model/json/JSONModel",], function (Controller, JSONModel) {
  'use strict';
  
  var SelectedNum;
  return Controller.extend('projectBP.controller.DetailBusinessPartner', {
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


      

    //   var oData = {
    //     personal: false
    // };
    // var oModel = new JSONModel(oData);
    // this.getView().setModel(oModel, "personalModel");

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

    // this.onBack2();


},

onFinalSave: async function () {
  
  var temp = {
    BP_CODE: this.byId("bp_code2").getValue(),
    BP_ORG_DIVISION: this.byId("bp_org_division2").getValue(),
    BP_NAME: this.byId("bp_name2").getValue(),
    BP_SEARCH: this.byId("bp_search2").getValue(),
    BP_AUTH_GROUP: this.byId("bp_auth_group2").getValue(),
    BP_LEGAL_FORM: this.byId("bp_legal_from2").getValue(),
    BP_Archiving_Flag: this.byId("bp_archiving_flag2").getValue(),
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
    BP_DELIVER_HOLD: this.byId("bp_deliver_hold2").getValue(),
    BP_ADDRESS: this.byId("bp_address2").getValue(),
    BP_SPECIFIC_ADDRESS: this.byId("bp_specific_address2").getValue(),
    BP_POSTCODE: this.byId("bp_postcode2").getValue(),
    BP_CITY: this.byId("bp_city2").getValue(),
    BP_COUNTRY: this.byId("bp_country2").getValue(),
    BP_REGION: this.byId("bp_region2").getValue(),

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
    

}

  });
});

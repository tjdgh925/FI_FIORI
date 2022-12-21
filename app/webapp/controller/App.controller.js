sap.ui.define(['sap/ui/core/mvc/Controller'], function (BaseController) {
  'use strict';

  return BaseController.extend('project1.controller.App', {
    onBusinessPartner: function () {
      this.getOwnerComponent().getRouter().navTo('BusinessPartner');
    },
    onGeneralLedger: function () {
      this.getOwnerComponent().getRouter().navTo('GeneralLedger');
    },
    onHome : function(){
      this.getOwnerComponent().getRouter().navTo('Home');
    }
  });
});

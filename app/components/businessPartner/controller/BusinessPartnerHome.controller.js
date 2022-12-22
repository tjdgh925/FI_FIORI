sap.ui.define(['sap/ui/core/mvc/Controller'], function (Controller) {
  'use strict';

  return Controller.extend('projectBP.controller.BusinessPartnerHome', {
    onInit() {},

    onDisplayBP: function () {
      this.getOwnerComponent().getRouter().navTo('BusinessPartner');
    },
   
    onCreateBP_person: function () {
      this.getOwnerComponent().getRouter().navTo('MassCreateBusinessPartner_person');
    },
    
    onCreateBP_organization: function () {
      this.getOwnerComponent().getRouter().navTo('MassCreateBusinessPartner_organization');
    },
    
    onChartBP: function () {
      this.getOwnerComponent().getRouter().navTo('ChartBusinessPartner');
    },
  });
});

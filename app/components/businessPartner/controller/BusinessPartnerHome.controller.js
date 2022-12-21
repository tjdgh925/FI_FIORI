sap.ui.define(['sap/ui/core/mvc/Controller'], function (Controller) {
  'use strict';

  return Controller.extend('projectBP.controller.BusinessPartnerHome', {
    onInit() {},

    onDisplayBP: function () {
      this.getOwnerComponent().getRouter().navTo('BusinessPartner');
    },
    
    onChartBP: function () {
      this.getOwnerComponent().getRouter().navTo('ChartBusinessPartner');
    },
  });
});

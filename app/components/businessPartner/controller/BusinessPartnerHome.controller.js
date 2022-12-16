sap.ui.define(['sap/ui/core/mvc/Controller'], function (Controller) {
  'use strict';

  return Controller.extend('projectBP.controller.BusinessPartnerHome', {
    onInit() {},

    onDisplayBP: function () {
      this.getOwnerComponent().getRouter().navTo('BusinessPartner');
    },
    onDetailBP: function () {
      this.getOwnerComponent().getRouter().navTo('DetailBusinessPartner');
    },
    onChartBP: function () {
      this.getOwnerComponent().getRouter().navTo('ChartBusinessPartner');
    },
  });
});

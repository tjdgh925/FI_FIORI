sap.ui.define(['sap/ui/core/mvc/Controller'], function (Controller) {
  'use strict';

  return Controller.extend('projectGL.controller.GeneralLedgerHome', {
    onInit() {},

    onDisplayGL: function () {
      this.getOwnerComponent().getRouter().navTo('GeneralLedger');
    },
    onCreateGL: function () {
      this.getOwnerComponent().getRouter().navTo('CreateGeneralLedger');
    },
    onDetailGL: function () {
      this.getOwnerComponent().getRouter().navTo('GeneralLedgerDetail');
    },
  });
});

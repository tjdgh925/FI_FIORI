sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
  ],
  function (Controller, JSONModel, Fragment) {
    "use strict";

    var gl_code;
    return Controller.extend("projectGL.controller.MassCreateGeneralLedger", {
      async onInit() {
        var initData = [];
        this.getView().setModel(new JSONModel(initData), "MassCreateModel");

        const firstData = await $.ajax({
          type: "GET",
          url: "/general-ledger/GL?$orderby=GL_CODE desc&$top=1",
        });

        gl_code = firstData.value[0].GL_CODE;
      },

      onMassCreationNumber: async function () {
        if (!this.byId("MassCreateNumberDialog")) {
          Fragment.load({
            id: this.getView().getId(),
            name: "projectGL.view.fragments.MassCreateNumberDialog",
            controller: this,
          }).then(
            function (oDialog) {
              this.getView().addDependent(oDialog);
              oDialog.open();
            }.bind(this)
          );
        } else {
          this.byId("MassCreateNumberDialog").open();
        }
      },

      onMassCreationDialogCancel: function () {
        this.byId("MassCreateNumberDialog").close();
      },

      onMassCreationDialogApprove: function () {
        const amount = this.byId("massCreationNumber").getValue();

        let massInputModel = this.getView().getModel("MassCreateModel").oData;

        for (var i = 1; i <= amount; i++) {
          massInputModel.push(this.createEmptyInput(i));
        }
        console.log(massInputModel);
        this.getView().setModel(
          new JSONModel(massInputModel),
          "MassCreateModel"
        );

        this.onMassCreationDialogCancel();
      },

      createEmptyInput: function () {
        var emptyData = {
          GL_COA: null,
          GL_ACCOUNTTYPE: null,
          GL_ACCOUNTGROUP: null,
          GL_PL_ACCOUNTTYPE: null,
          GL_NAME: null,
          GL_DESCRIPTION: null,
          GL_TRADINGPARTNER: null,
          GL_COMPANY_CODE : null
        };

        return emptyData;
      },

      onClearMassCreate: function (e) {
        const path = e.getSource().getParent().getRowBindingContext().getPath();
        const index = path.split("/")[1];

        let massDeleteModel = this.getView().getModel("MassCreateModel").oData;
        massDeleteModel.splice(index, 1);

        this.getView().setModel(
          new JSONModel(massDeleteModel),
          "MassCreateModel"
        );
      },

      onMassCreationApprove: async function () {
        let inputData = this.getView().getModel("MassCreateModel").oData;
        var cnt = 1;
        await inputData.forEach((data) => {
          Object.assign(data, { GL_CODE: parseInt(gl_code) + cnt++ });

          $.ajax({
            type: "POST",
            url: "/general-ledger/GL",
            contentType: "application/json;IEEE754Compatible=true",
            data: JSON.stringify(data),
          });
        });
      },
    });
  }
);

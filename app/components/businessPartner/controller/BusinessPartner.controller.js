sap.ui.define(['sap/ui/core/mvc/Controller'], function (Controller) {
  'use strict';

  return Controller.extend('projectBP.controller.BusinessPartner', {
    onInit() {},

  });
});

            oDialog.getTableAsync().then(
              function (oTable) {
                oTable.setModel(this.getView().getModel("Country"));

                // For Desktop and tabled the default table is sap.ui.table.Table
                if (oTable.bindRows) {
                  // Bind rows to the ODataModel and add columns
                  oTable.bindAggregation("rows", {
                    path: "Country>/",
                    events: {
                      dataReceived: function () {
                        oDialog.update();
                      },
                    },
                  });
                  oTable.addColumn(
                    new UIColumn({
                      label: "국가/지역 코드",
                      template: "Country>COUNTRY_CODE",
                    })
                  );
                  oTable.addColumn(
                    new UIColumn({
                      label: "국가/지역 이름",
                      template: "Country>COUNTRY_NAME",
                    })
                  );
                }

                // For Mobile the default table is sap.m.Table
                if (oTable.bindItems) {
                  // Bind items to the ODataModel and add columns
                  oTable.bindAggregation("items", {
                    path: "Country>/",
                    template: new ColumnListItem({
                      cells: [
                        new Label({ text: "{COUNTRY_CODE}" }),
                        new Label({ text: "{COUNTRY_NAME}" }),
                      ],
                    }),
                    events: {
                      dataReceived: function () {
                        oDialog.update();
                      },
                    },
                  });
                  oTable.addColumn(
                    new MColumn({ header: new Label({ text: "COUNTRY_CODE" }) })
                  );
                  oTable.addColumn(
                    new MColumn({ header: new Label({ text: "COUNTRY_NAME" }) })
                  );
                }
                oDialog.update();
              }.bind(this)
            );

            console.log(this._oMultiInput);
            oDialog.setTokens(this._oMultiInput.getTokens());

            // set flag that the dialog is initialized
            this._bDialogInitialized = true;
            oDialog.open();
          }.bind(this)
        );
      },

      onValueHelpOkPress: function (oEvent) {
        console.log(oEvent);
        var aTokens = oEvent.getParameter("tokens");
        var arr = [];
        aTokens.map((token) => {
          arr.push(
            new Token({
              key: token.mProperties.key,
              text: token.mProperties.key,
            })
          );
        });
        this._oMultiInput.setTokens(arr);
        this._oVHD.close();
      },

      onACGroupOkPress: function (oEvent) {
        var aTokens = oEvent.getParameter("tokens");
        var arr = [];
        aTokens.map((token) => {
          arr.push(
            new Token({
              key: token.mProperties.key,
              text: token.mProperties.key,
            })
          );
        });
        this._oMultiInput2.setTokens(arr);
        this._oVHD2.close();
      },

      onValueHelpCancelPress: function () {
        this._oVHD.close();
      },
      // #endregion

      // #region Value Help Dialog filters with suggestions
      _inputTextFormatter: function (oItem) {
        var sOriginalText = oItem.getText(),
          sWhitespace = " ",
          sUnicodeWhitespaceCharacter = "\u00A0"; // Non-breaking whitespace

        if (typeof sOriginalText !== "string") {
          return sOriginalText;
        }

        return sOriginalText.replaceAll(
          sWhitespace + sUnicodeWhitespaceCharacter,
          sWhitespace + sWhitespace
        );
      },

      // #endregion
      onFilterBarSearch: function () {
        var sSearchQuery = this._oBasicSearchField.getValue();

        console.log(aSelectionSet);

        var aFilters = [];
        if (sSearchQuery == null) {
          this._filterTable([]);
          return;
        }

        aFilters.push(
          new Filter({
            filters: [
              new Filter({
                path: "COUNTRY_CODE",
                operator: FilterOperator.Contains,
                value1: sSearchQuery,
              }),
              new Filter({
                path: "COUNTRY_NAME",
                operator: FilterOperator.Contains,
                value1: sSearchQuery,
              }),
            ],
            and: false,
          })
        );

        this._filterTable(
          new Filter({
            filters: aFilters,
            and: true,
          })
        );
      },

      // @endregion
      // Internal helper methods

      _onMultiInputValidate: function (oArgs) {
        var sWhitespace = " ",
          sUnicodeWhitespaceCharacter = "\u00A0"; // Non-breaking whitespace

        if (oArgs.suggestionObject) {
          var oObject = oArgs.suggestionObject.getBindingContext().getObject(),
            oToken = new Token(),
            sOriginalText = oObject.ProductCode.replaceAll(
              sWhitespace + sWhitespace,
              sWhitespace + sUnicodeWhitespaceCharacter
            );

          oToken.setKey(oObject.ProductCode);
          oToken.setText(oObject.ProductName + " (" + sOriginalText + ")");
          return oToken;
        }
        return null;
      },
      _filterTable: function (oFilter) {
        var oVHD = this._oVHD;

        oVHD.getTableAsync().then(function (oTable) {
          if (oTable.bindRows) {
            oTable.getBinding("rows").filter(oFilter);
          }
          if (oTable.bindItems) {
            oTable.getBinding("items").filter(oFilter);
          }

          // This method must be called after binding update of the table.
          oVHD.update();
        });
      },
    });
  }
);

namespace fi_hana.gl;

using {
    cuid,
    managed,
    Currency,
} from '@sap/cds/common';

entity GeneralLedger {
    key GL_CODE           : String;
        GL_NAME           : String not null;
        GL_DESCRIPTION    : String not null;
        GL_COA            : String not null;
        GL_ACCOUNTTYPE    : String not null;
        GL_ACCOUNTGROUP   : String not null;
        GL_PL_ACCOUNTTYPE : String;
        GL_TRADINGPARTNER : String;
        GL_COMPANY_CODE   : String;
};

entity ChartOfAccount {
    key COA_CODE : String;
        COA_NAME : String;
};

entity AccountGroup {
    key AC_GROUP_CODE : String;
        AC_COA        : String;
        AC_NAME       : String;
};

entity CompanyCode {
    key CC_COMPANY_CODE : String;
        CC_COMPANY_NAME : String;
        CC_CURRENCY     : String;
        CC_COA          : String not null;
};
﻿

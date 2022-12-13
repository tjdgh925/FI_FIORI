namespace fi_hana.bp;

using {
    cuid,
    managed,
    Currency,
} from '@sap/cds/common';

entity BusinessPartner : managed {
    key BP_CODE         : String;
        BP_NAME         : String;
        BP_COMPANY_CODE : String;
        BP_ADDRESS      : String;
        BP_CITY         : String;
        BP_POSTCODE     : String;
        BP_COUNTRY      : String;
        BP_CATEGORY     : String;
};

entity Country {
    key COUNTRY_CODE : String;
        COUNTRY_NAME : String;
};

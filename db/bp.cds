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
        BP_ORG_DIVISION     : String;
        BP_SEARCH     : String;
        BP_AUTH_GROUP     : String;
        BP_LEGAL_FORM     : String;
        BP_CUST_ACCOUNT_GROUP     : String;
        BP_CUST_AUTH_GROUP     : String;
        BP_DELIVER_RULE     : String;
        BP_DELETE_FLAG     : String;
        BP_GROUP_KEY     : String;
        BP_SUPPLIER     : String;
        BP_PROXY_PAYMENT     : String;
        BP_PAYMENT_REASON     : String;
        BP_ORDER_HOLD     : String;
        BP_CLAIM_HOLD     : String;
        BP_DELIVER_HOLD     : String;
        BP_NAME_TITLE     : String;
};

entity Country {
    key COUNTRY_CODE : String;
        COUNTRY_NAME : String;
};

using fi_hana.gl from '../db/gl';

service GeneralLedger {
    entity GL           as projection on gl.GeneralLedger;
    entity COA          as projection on gl.ChartOfAccount;
    entity AccountGroup as projection on gl.AccountGroup;
    entity CompanyCode  as projection on gl.CompanyCode;
}

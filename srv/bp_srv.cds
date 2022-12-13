using fi_hana.bp from '../db/bp';

service BusinessPartner {
    entity BP as projection on bp.BusinessPartner;
    entity Country as projection on bp.Country;
}
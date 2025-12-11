import { BusinessType, ClientType } from "../graphql/generated-types";

export interface SingleBusinessQueryResponse {
    singleBusiness: BusinessType;
}
export interface BusinessQueryResponse {
    myBusinesses: BusinessType[];
}
export interface SingleClientQueryResponse {
    findOneClient: ClientType;
}
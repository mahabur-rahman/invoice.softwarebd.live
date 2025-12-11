import { BusinessType } from "../graphql/generated-types";

export interface SingleBusinessQueryResponse {
    singleBusiness: BusinessType;
}
export interface BusinessQueryResponse {
    myBusinesses: BusinessType[];
}
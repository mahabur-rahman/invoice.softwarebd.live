import { gql } from "@apollo/client";

export const CREATE_BUSINESS_MUTATION = gql`
  mutation CreateBusiness($createBusinessInput: CreateBusinessInput!) {
    createBusiness(createBusinessInput: $createBusinessInput) {
      _id      
    }
  }
`;


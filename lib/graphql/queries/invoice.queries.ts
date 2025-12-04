import { gql } from "@apollo/client";

export const SINGLE_BUSINESS_QUERY = gql`
  query SingleBusiness($id: ID!) {
    singleBusiness(id: $id) {
      _id
      companyName
      contactEmail
      createdAt
      location
      logoUrl
      ownerId
      phoneNumber
      updatedAt
      websiteUrl
    }
  }
`;
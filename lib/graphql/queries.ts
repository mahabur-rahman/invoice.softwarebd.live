import { gql } from "@apollo/client";

export const ME_QUERY = gql`
  query Me {
    me {
      _id
      email
      name
      picture
    }
  }
`;

export const GET_MY_BUSINESSES = gql`
  query GetMyBusinesses {
    myBusinesses {
      _id
      companyName
      contactEmail
      createdAt
      defaultBusiness
      invoiceNumberPaddingDigits
      invoiceNumberPrefix
      invoiceNumberResetYearly
      invoiceNumberStartNumber
      location
      logoUrl
      owner {
        _id
        createdAt
        email
        name
        role
        updatedAt
      }
      ownerId
      phoneNumber
      updatedAt
      websiteUrl
    }
  }
`;

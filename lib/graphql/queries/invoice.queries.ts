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

export const GET_ALL_CLIENTS = gql`
  query FindAllClients {
    findAllClients {
      _id
      address
      business {
        _id
        companyName
      }
      businessId
      clientCompanyName
      createdAt
      email
      name
      phone
      updatedAt
      user {
        _id
        name
      }
      userId
    }
  }
`;
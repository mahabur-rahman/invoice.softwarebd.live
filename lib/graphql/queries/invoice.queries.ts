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


export const FIND_ONE_CLIENT = gql`
  query FindOneClient($id: ID!) {
    findOneClient(id: $id) {
      _id
      name
      address
      clientCompanyName
      email
      phone
      businessId
      userId
    }
  }
`;

export const GET_MY_BUSINESSES_ID = gql`
  query GetMyBusinesses {
    myBusinesses {
      _id
      companyName
    }
  }
`;

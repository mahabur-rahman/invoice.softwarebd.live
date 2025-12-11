import { gql } from "@apollo/client";

export const CREATE_BUSINESS_MUTATION = gql`
  mutation CreateBusiness($createBusinessInput: CreateBusinessInput!) {
    createBusiness(createBusinessInput: $createBusinessInput) {
      _id      
    }
  }
`;

export const UPDATE_BUSINESS_MUTATION = gql`
  mutation UpdateBusiness(
    $id: ID!
    $updateBusinessInput: UpdateBusinessInput!
  ) {
    updateBusiness(id: $id, updateBusinessInput: $updateBusinessInput) {
      _id
      companyName
      contactEmail
      location
      logoUrl
      ownerId
      phoneNumber
      websiteUrl
      createdAt
      updatedAt
    }
  }
`;


export const DELETE_CLIENT = gql`
  mutation DeleteClient($id: ID!) {
    deleteClient(id: $id) {
      message
      success
    }
  }
`;

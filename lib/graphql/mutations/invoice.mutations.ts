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


export const CREATE_CLIENT = gql`
  mutation CreateClient($input: CreateClientInput!) {
    createClient(input: $input) {
      _id
      name
      email
      phone
      clientCompanyName
      address
      businessId
      userId
    }
  }
`;


export const UPDATE_CLIENT = gql`
  mutation UpdateClient($input: UpdateClientInput!) {
    updateClient(input: $input) {
      _id
      name
      email
      phone
      clientCompanyName
      address
      businessId
      userId
    }
  }
`;


export const CREATE_INVOICE = gql`
  mutation CreateInvoice($input: CreateInvoiceInput!) {
    createInvoice(input: $input) {
      _id
    }
  }
`;

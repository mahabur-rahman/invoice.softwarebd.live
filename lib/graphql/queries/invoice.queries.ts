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
  query GetMyBusinessesId {
    myBusinesses {
      _id
      companyName
    }
  }
`;


export const GET_MY_INVOICES = gql`
  query MyInvoices {
    myInvoices {
      _id
      invoiceNumber
      businessInfo{
        companyName
        contactEmail
      }
      clientInfo{
        name
      }
      currency
      status
      issueDate
      dueDate
      totals {
        subTotal
        grandTotal
      }
      createdAt
    }
  }
`;



export const SINGLE_INVOICE_QUERY = gql`
  query SingleInvoice($id: ID!) {
    singleInvoice(id: $id) {
      _id
      businessId
      businessInfo {
        companyName
        location
        contactEmail
      }
      clientId
      clientName
      clientInfo {
        name
        address
      }
      invoiceNumber
      currency
      issueDate
      dueDate
      notes
      status
      columns {
        id
        fieldKey
        label
        type
        order
        behavior
      }
      items {
        id
        order
        itemTotal
        values {
          description
          price
          quantity
          extra
        }
      }
      totals {
        subTotal
        grandTotal
        additions{
          shipping
          tax
        }
        subtractions{
          discount
          paid
        }
      }
      createdAt
      updatedAt
    }
  }
`;

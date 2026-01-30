import { gql } from "@apollo/client";

export const SINGLE_BUSINESS_QUERY = gql`
  query SingleBusiness($id: ID!) {
    singleBusiness(id: $id) {
      _id
      companyName
      contactEmail
      createdAt
      defaultBusiness
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
      country
      countryCode
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
      country
      countryCode
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
      defaultBusiness
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
      publicShare
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
      template
      columns {
        id
        fieldKey
        label
        type
        order
        behavior
        locked
        hidden
        format
        role
        affectsTotal
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
        balanceDue
        custom {
          key
          label
          behavior
          valueType
          value
        }
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

export const VIEW_INVOICE_QUERY = gql`
  query ViewInvoice($id: ID!) {
    viewInvoice(id: $id) {
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
      template
      columns {
        id
        fieldKey
        label
        type
        order
        behavior
        locked
        hidden
        format
        role
        affectsTotal
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
        balanceDue
        custom {
          key
          label
          behavior
          valueType
          value
        }
        additions {
          shipping
          tax
        }
        subtractions {
          discount
          paid
        }
      }
      createdAt
      updatedAt
    }
  }
`;

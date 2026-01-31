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
      country
      countryCode
      invoiceDueDays
      invoiceNumberPaddingDigits
      invoiceNumberPrefix
      invoiceNumberResetYearly
      invoiceNumberStartNumber
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
      country
      countryCode
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
      country
      countryCode
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

export const UPDATE_INVOICE = gql`
  mutation UpdateInvoice($input: UpdateInvoiceInput!) {
    updateInvoice(input: $input) {
      _id
    }
  }
`;

export const DELETE_INVOICE = gql`
      mutation DeleteInvoice($id: ID!) {
    deleteInvoice(id: $id) {
      message
      success
    }
  }
`;

export const BULK_DELETE_INVOICES = gql`
  mutation BulkDeleteInvoices($invoiceIds: [ID!]!) {
    bulkDeleteInvoices(input: { invoiceIds: $invoiceIds }) {
      success
      requested
      deleted
      deletedIds
      failedIds
    }
  }
`;

export const DUPLICATE_INVOICE = gql`
  mutation DuplicateInvoice($id: ID!) {
    duplicateInvoice(id: $id) {
      newInvoiceId
      redirectUrl
    }
  }
`;

export const ENABLE_INVOICE_PUBLIC_SHARE = gql`
  mutation EnableInvoicePublicShare($id: ID!, $enabled: Boolean = true) {
    enableInvoicePublicShare(id: $id, enabled: $enabled)
  }
`;

export const RESERVE_INVOICE_NUMBER = gql`
  mutation ReserveInvoiceNumber($businessId: ID!, $issueDate: String) {
    reserveInvoiceNumber(businessId: $businessId, issueDate: $issueDate)
  }
`;

import { gql } from "@apollo/client";

export const ADMIN_USERS_QUERY = gql`
  query AdminUsers($limit: Int, $page: Int, $search: String) {
    findAllUsersByAdmin(limit: $limit, page: $page, search: $search) {
      stats {
        userCount
        activeUserCount
        inactiveUserCount
        limit
        page
        totalPages
      }
      users {
        _id
        name
        email
        picture
        role
        status
        isOnline
        lastSeenAt
        createdAt
        updatedAt
        stats {
          clientCount
          invoiceCount
        }
      }
    }
  }
`;

export const ADMIN_INVOICES_QUERY = gql`
  query AdminInvoices($limit: Int, $page: Int, $search: String) {
    findAllInvoicesByAdminList(limit: $limit, page: $page, search: $search) {
      limit
      page
      total
      totalPages
      invoices {
        _id
        invoiceNumber
        clientName
        issueDate
        dueDate
        status
        total
        currency
        businessInfo {
          _id
          companyName
        }
        createdByInfo {
          _id
          name
          email
          role
        }
      }
    }
  }
`;

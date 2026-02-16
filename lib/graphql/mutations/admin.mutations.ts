import { gql } from "@apollo/client";

export const UPDATE_USER_STATUS_BY_ADMIN = gql`
  mutation UpdateUserStatusByAdmin($input: UpdateUserStatusInput!) {
    updateUserStatusByAdmin(input: $input) {
      _id
      status
    }
  }
`;

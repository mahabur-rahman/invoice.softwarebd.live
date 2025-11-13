import { gql } from "@apollo/client";

export const REGISTER_MUTATION = gql`
  mutation Register($registerInput: RegisterInput!) {
    register(registerInput: $registerInput) {
      accessToken
      refreshToken
      userId
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($loginInput: LoginInput!) {
    login(loginInput: $loginInput) {
      accessToken
      refreshToken
      userId
    }
  }
`;


export const DELETE_BUSINESS = gql`
  mutation DeleteBusiness($id: ID!) {
    deleteBusiness(id: $id) {
      message
      success
    }
  }
`;


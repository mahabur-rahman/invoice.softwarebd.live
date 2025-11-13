export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Timestamp: { input: any; output: any; }
};

export type AuthResponse = {
  __typename?: 'AuthResponse';
  accessToken: Scalars['String']['output'];
  refreshToken: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export type Business = {
  __typename?: 'Business';
  _id: Scalars['ID']['output'];
  companyName: Maybe<Scalars['String']['output']>;
  contactEmail: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['Timestamp']['output'];
  location: Maybe<Scalars['String']['output']>;
  logoUrl: Maybe<Scalars['String']['output']>;
  ownerId: Scalars['ID']['output'];
  phoneNumber: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['Timestamp']['output'];
  websiteUrl: Maybe<Scalars['String']['output']>;
};

export type BusinessType = {
  __typename?: 'BusinessType';
  _id: Scalars['ID']['output'];
  companyName: Maybe<Scalars['String']['output']>;
  contactEmail: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['Timestamp']['output'];
  location: Maybe<Scalars['String']['output']>;
  logoUrl: Maybe<Scalars['String']['output']>;
  owner: Maybe<User>;
  ownerId: Scalars['ID']['output'];
  phoneNumber: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['Timestamp']['output'];
  websiteUrl: Maybe<Scalars['String']['output']>;
};

export type ClientType = {
  __typename?: 'ClientType';
  _id: Scalars['ID']['output'];
  address: Maybe<Scalars['String']['output']>;
  business: Maybe<Business>;
  businessId: Scalars['String']['output'];
  clientCompanyName: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['Timestamp']['output'];
  email: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  phone: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['Timestamp']['output'];
  user: Maybe<User>;
  userId: Maybe<Scalars['String']['output']>;
};

export type CreateBusinessInput = {
  companyName: InputMaybe<Scalars['String']['input']>;
  contactEmail: InputMaybe<Scalars['String']['input']>;
  location: InputMaybe<Scalars['String']['input']>;
  logoUrl: InputMaybe<Scalars['String']['input']>;
  ownerId: InputMaybe<Scalars['ID']['input']>;
  phoneNumber: InputMaybe<Scalars['String']['input']>;
  websiteUrl: InputMaybe<Scalars['String']['input']>;
};

export type CreateClientInput = {
  address: InputMaybe<Scalars['String']['input']>;
  businessId: Scalars['String']['input'];
  clientCompanyName: InputMaybe<Scalars['String']['input']>;
  email: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  phone: InputMaybe<Scalars['String']['input']>;
  userId: InputMaybe<Scalars['String']['input']>;
};

export type CreateInvoiceInput = {
  businessId: Scalars['ID']['input'];
  clientId: Scalars['ID']['input'];
  currency: Currency;
  discount: Scalars['Float']['input'];
  dueDate: Scalars['String']['input'];
  issueDate: Scalars['String']['input'];
  items: Array<InvoiceItemInput>;
  note: InputMaybe<Scalars['String']['input']>;
  subTotal: Scalars['Float']['input'];
  totalPaid: Scalars['Float']['input'];
};

/** Currency type for invoice */
export type Currency =
  | 'BDT'
  | 'USD';

export type DeleteResponse = {
  __typename?: 'DeleteResponse';
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type InvoiceItem = {
  __typename?: 'InvoiceItem';
  description: Scalars['String']['output'];
  price: Scalars['Float']['output'];
  qty: Scalars['Float']['output'];
  total: Scalars['Float']['output'];
};

export type InvoiceItemInput = {
  description: Scalars['String']['input'];
  price: Scalars['Float']['input'];
  qty: Scalars['Float']['input'];
  total: Scalars['Float']['input'];
};

export type InvoiceItemType = {
  __typename?: 'InvoiceItemType';
  description: Scalars['String']['output'];
  price: Scalars['Float']['output'];
  qty: Scalars['Float']['output'];
  total: Scalars['Float']['output'];
};

export type InvoiceType = {
  __typename?: 'InvoiceType';
  _id: Scalars['ID']['output'];
  amountDue: Scalars['Float']['output'];
  businessId: Scalars['ID']['output'];
  clientId: Scalars['ID']['output'];
  createdAt: Scalars['Timestamp']['output'];
  createdBy: Scalars['ID']['output'];
  currency: Currency;
  discount: Scalars['Float']['output'];
  dueDate: Scalars['Timestamp']['output'];
  issueDate: Scalars['Timestamp']['output'];
  items: Array<InvoiceItemType>;
  note: Maybe<Scalars['String']['output']>;
  subTotal: Scalars['Float']['output'];
  totalPaid: Scalars['Float']['output'];
  updatedAt: Scalars['Timestamp']['output'];
};

export type LoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type LogoutInput = {
  /** The user ID to log out (will revoke all tokens for this user) */
  userId: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createBusiness: BusinessType;
  createClient: ClientType;
  createInvoice: InvoiceType;
  deleteBusiness: DeleteResponse;
  deleteClient: DeleteResponse;
  deleteInvoice: DeleteResponse;
  login: AuthResponse;
  logout: Scalars['Boolean']['output'];
  refreshToken: AuthResponse;
  register: AuthResponse;
  updateBusiness: BusinessType;
  updateClient: ClientType;
  updateInvoice: InvoiceType;
  updateUser: User;
};


export type MutationCreateBusinessArgs = {
  createBusinessInput: CreateBusinessInput;
};


export type MutationCreateClientArgs = {
  input: CreateClientInput;
};


export type MutationCreateInvoiceArgs = {
  createInvoiceInput: CreateInvoiceInput;
};


export type MutationDeleteBusinessArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteClientArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteInvoiceArgs = {
  invoiceId: Scalars['ID']['input'];
};


export type MutationLoginArgs = {
  loginInput: LoginInput;
};


export type MutationLogoutArgs = {
  logoutInput: LogoutInput;
};


export type MutationRefreshTokenArgs = {
  refreshTokenInput: RefreshTokenInput;
};


export type MutationRegisterArgs = {
  registerInput: RegisterInput;
};


export type MutationUpdateBusinessArgs = {
  id: Scalars['ID']['input'];
  updateBusinessInput: UpdateBusinessInput;
};


export type MutationUpdateClientArgs = {
  input: UpdateClientInput;
};


export type MutationUpdateInvoiceArgs = {
  updateInvoiceInput: UpdateInvoiceInput;
};


export type MutationUpdateUserArgs = {
  updateUserInput: UpdateUserInput;
};

export type Query = {
  __typename?: 'Query';
  adminOnly: Scalars['String']['output'];
  findAllBusinesses: Array<BusinessType>;
  findAllClients: Array<ClientType>;
  findAllClientsAccessByAdmin: Array<ClientType>;
  findAllInvoices: Array<InvoiceType>;
  findOneClient: ClientType;
  findOneInvoice: InvoiceType;
  /** Health check endpoint */
  health: Scalars['String']['output'];
  /** A simple hello world query */
  hello: Scalars['String']['output'];
  me: Maybe<User>;
  myBusinesses: Array<BusinessType>;
  myInvoices: Array<InvoiceType>;
  singleBusiness: BusinessType;
};


export type QueryFindOneClientArgs = {
  id: Scalars['ID']['input'];
};


export type QueryFindOneInvoiceArgs = {
  invoiceId: Scalars['ID']['input'];
};


export type QuerySingleBusinessArgs = {
  id: Scalars['ID']['input'];
};

export type RefreshTokenInput = {
  /** The refresh token */
  refreshToken: Scalars['String']['input'];
};

export type RegisterInput = {
  email: Scalars['String']['input'];
  name: InputMaybe<Scalars['String']['input']>;
  password: Scalars['String']['input'];
  role: InputMaybe<Scalars['String']['input']>;
};

export type UpdateBusinessInput = {
  companyName: InputMaybe<Scalars['String']['input']>;
  contactEmail: InputMaybe<Scalars['String']['input']>;
  location: InputMaybe<Scalars['String']['input']>;
  logoUrl: InputMaybe<Scalars['String']['input']>;
  ownerId: InputMaybe<Scalars['ID']['input']>;
  phoneNumber: InputMaybe<Scalars['String']['input']>;
  websiteUrl: InputMaybe<Scalars['String']['input']>;
};

export type UpdateClientInput = {
  address: InputMaybe<Scalars['String']['input']>;
  businessId: InputMaybe<Scalars['String']['input']>;
  clientCompanyName: InputMaybe<Scalars['String']['input']>;
  email: InputMaybe<Scalars['String']['input']>;
  /** The unique identifier of the client to update */
  id: Scalars['ID']['input'];
  name: InputMaybe<Scalars['String']['input']>;
  phone: InputMaybe<Scalars['String']['input']>;
  userId: InputMaybe<Scalars['String']['input']>;
};

export type UpdateInvoiceInput = {
  businessId: InputMaybe<Scalars['ID']['input']>;
  clientId: InputMaybe<Scalars['ID']['input']>;
  currency: InputMaybe<Currency>;
  discount: InputMaybe<Scalars['Float']['input']>;
  dueDate: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  issueDate: InputMaybe<Scalars['String']['input']>;
  items: InputMaybe<Array<InvoiceItemInput>>;
  note: InputMaybe<Scalars['String']['input']>;
  subTotal: InputMaybe<Scalars['Float']['input']>;
  totalPaid: InputMaybe<Scalars['Float']['input']>;
};

export type UpdateUserInput = {
  email: InputMaybe<Scalars['String']['input']>;
  name: InputMaybe<Scalars['String']['input']>;
  password: InputMaybe<Scalars['String']['input']>;
  role: InputMaybe<UserRole>;
};

export type User = {
  __typename?: 'User';
  _id: Scalars['ID']['output'];
  createdAt: Scalars['Timestamp']['output'];
  email: Scalars['String']['output'];
  name: Maybe<Scalars['String']['output']>;
  role: Scalars['String']['output'];
  updatedAt: Scalars['Timestamp']['output'];
};

/** Roles available for the user */
export type UserRole =
  | 'ADMIN'
  | 'USER';

export type RegisterMutationVariables = Exact<{
  registerInput: RegisterInput;
}>;


export type RegisterMutation = { __typename?: 'Mutation', register: { __typename?: 'AuthResponse', accessToken: string, refreshToken: string, userId: string } };

export type LoginMutationVariables = Exact<{
  loginInput: LoginInput;
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'AuthResponse', accessToken: string, refreshToken: string, userId: string } };

export type GetMyBusinessesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMyBusinessesQuery = { __typename?: 'Query', myBusinesses: Array<{ __typename?: 'BusinessType', _id: string, companyName: string | null, contactEmail: string | null, createdAt: any, location: string | null, logoUrl: string | null, ownerId: string, phoneNumber: string | null, updatedAt: any, websiteUrl: string | null, owner: { __typename?: 'User', _id: string, createdAt: any, email: string, name: string | null, role: string, updatedAt: any } | null }> };

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
  JSON: { input: any; output: any; }
  Timestamp: { input: any; output: any; }
};

export type AdminClientsListType = {
  __typename?: 'AdminClientsListType';
  clients: Array<ClientType>;
  limit: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
  totalClients: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type AdminNotificationInvoiceSnapshotType = {
  __typename?: 'AdminNotificationInvoiceSnapshotType';
  balanceDue: Maybe<Scalars['Float']['output']>;
  businessId: Maybe<Scalars['String']['output']>;
  businessName: Maybe<Scalars['String']['output']>;
  clientId: Maybe<Scalars['String']['output']>;
  clientName: Maybe<Scalars['String']['output']>;
  createdAt: Maybe<Scalars['String']['output']>;
  currency: Maybe<Scalars['String']['output']>;
  grandTotal: Maybe<Scalars['Float']['output']>;
  invoiceId: Scalars['ID']['output'];
  invoiceNumber: Maybe<Scalars['String']['output']>;
  status: Maybe<Scalars['String']['output']>;
  subTotal: Maybe<Scalars['Float']['output']>;
};

export type AdminNotificationRequestMetaType = {
  __typename?: 'AdminNotificationRequestMetaType';
  browserName: Maybe<Scalars['String']['output']>;
  browserVersion: Maybe<Scalars['String']['output']>;
  city: Maybe<Scalars['String']['output']>;
  country: Maybe<Scalars['String']['output']>;
  deviceType: Maybe<Scalars['String']['output']>;
  ip: Maybe<Scalars['String']['output']>;
  latitude: Maybe<Scalars['Float']['output']>;
  longitude: Maybe<Scalars['Float']['output']>;
  osName: Maybe<Scalars['String']['output']>;
  osVersion: Maybe<Scalars['String']['output']>;
  region: Maybe<Scalars['String']['output']>;
  timezone: Maybe<Scalars['String']['output']>;
  userAgent: Maybe<Scalars['String']['output']>;
};

export type AdminNotificationType =
  | 'INVOICE_CREATED';

export type AdminNotificationTypeGql = {
  __typename?: 'AdminNotificationTypeGql';
  _id: Scalars['ID']['output'];
  createdAt: Scalars['String']['output'];
  invoice: Maybe<AdminNotificationInvoiceSnapshotType>;
  message: Scalars['String']['output'];
  meta: Maybe<Scalars['JSON']['output']>;
  read: Scalars['Boolean']['output'];
  request: Maybe<AdminNotificationRequestMetaType>;
  type: AdminNotificationType;
  user: Maybe<AdminNotificationUserSnapshotType>;
};

export type AdminNotificationUserSnapshotType = {
  __typename?: 'AdminNotificationUserSnapshotType';
  _id: Scalars['ID']['output'];
  email: Scalars['String']['output'];
  name: Maybe<Scalars['String']['output']>;
  phone: Maybe<Scalars['String']['output']>;
  picture: Maybe<Scalars['String']['output']>;
  role: Maybe<Scalars['String']['output']>;
  status: Maybe<Scalars['String']['output']>;
};

export type AdminNotificationsListType = {
  __typename?: 'AdminNotificationsListType';
  limit: Scalars['Int']['output'];
  notifications: Array<AdminNotificationTypeGql>;
  page: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type AdminUserStatsType = {
  __typename?: 'AdminUserStatsType';
  clientCount: Scalars['Int']['output'];
  invoiceCount: Scalars['Int']['output'];
};

export type AdminUserSummaryType = {
  __typename?: 'AdminUserSummaryType';
  _id: Scalars['ID']['output'];
  createdAt: Scalars['Timestamp']['output'];
  email: Scalars['String']['output'];
  isOnline: Scalars['Boolean']['output'];
  lastSeenAt: Maybe<Scalars['Timestamp']['output']>;
  name: Maybe<Scalars['String']['output']>;
  picture: Maybe<Scalars['String']['output']>;
  role: Scalars['String']['output'];
  stats: AdminUserStatsType;
  status: UserStatus;
  updatedAt: Scalars['Timestamp']['output'];
};

export type AdminUsersListType = {
  __typename?: 'AdminUsersListType';
  stats: AdminUsersStatsType;
  users: Array<AdminUserSummaryType>;
};

export type AdminUsersStatsType = {
  __typename?: 'AdminUsersStatsType';
  activeUserCount: Scalars['Int']['output'];
  inactiveUserCount: Scalars['Int']['output'];
  limit: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
  userCount: Scalars['Int']['output'];
};

export type AuthResponse = {
  __typename?: 'AuthResponse';
  accessToken: Scalars['String']['output'];
  refreshToken: Scalars['String']['output'];
  user: UserType;
  userId: Scalars['String']['output'];
};

export type Business = {
  __typename?: 'Business';
  _id: Scalars['ID']['output'];
  branchs: Maybe<Array<Scalars['String']['output']>>;
  companyName: Maybe<Scalars['String']['output']>;
  contactEmail: Maybe<Scalars['String']['output']>;
  country: Maybe<Scalars['String']['output']>;
  countryCode: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['Timestamp']['output'];
  defaultBusiness: Maybe<Scalars['Boolean']['output']>;
  invoiceDueDays: Maybe<Scalars['Int']['output']>;
  invoiceNumberPaddingDigits: Maybe<Scalars['Int']['output']>;
  invoiceNumberPrefix: Maybe<Scalars['String']['output']>;
  invoiceNumberResetYearly: Maybe<Scalars['Boolean']['output']>;
  invoiceNumberStartNumber: Maybe<Scalars['Int']['output']>;
  location: Maybe<Scalars['String']['output']>;
  logoUrl: Maybe<Scalars['String']['output']>;
  ownerId: Scalars['ID']['output'];
  phoneNumber: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['Timestamp']['output'];
  websiteUrl: Maybe<Scalars['String']['output']>;
};

export type BusinessListType = {
  __typename?: 'BusinessListType';
  businesses: Array<BusinessType>;
  limit: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type BusinessType = {
  __typename?: 'BusinessType';
  _id: Scalars['ID']['output'];
  branchs: Maybe<Array<Scalars['String']['output']>>;
  companyName: Maybe<Scalars['String']['output']>;
  contactEmail: Maybe<Scalars['String']['output']>;
  country: Maybe<Scalars['String']['output']>;
  countryCode: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['Timestamp']['output'];
  defaultBusiness: Maybe<Scalars['Boolean']['output']>;
  invoiceDueDays: Maybe<Scalars['Int']['output']>;
  invoiceNumberPaddingDigits: Maybe<Scalars['Int']['output']>;
  invoiceNumberPrefix: Maybe<Scalars['String']['output']>;
  invoiceNumberResetYearly: Maybe<Scalars['Boolean']['output']>;
  invoiceNumberStartNumber: Maybe<Scalars['Int']['output']>;
  location: Maybe<Scalars['String']['output']>;
  logoUrl: Maybe<Scalars['String']['output']>;
  owner: Maybe<User>;
  ownerId: Scalars['ID']['output'];
  phoneNumber: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['Timestamp']['output'];
  websiteUrl: Maybe<Scalars['String']['output']>;
};

export type ClientListType = {
  __typename?: 'ClientListType';
  clients: Array<ClientType>;
  limit: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type ClientType = {
  __typename?: 'ClientType';
  _id: Scalars['ID']['output'];
  address: Maybe<Scalars['String']['output']>;
  business: Maybe<Business>;
  businessId: Scalars['String']['output'];
  clientCompanyName: Maybe<Scalars['String']['output']>;
  country: Maybe<Scalars['String']['output']>;
  countryCode: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['Timestamp']['output'];
  email: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  phone: Maybe<Scalars['String']['output']>;
  socialProfiles: Maybe<Array<SocialProfileType>>;
  updatedAt: Scalars['Timestamp']['output'];
  user: Maybe<User>;
  userId: Maybe<Scalars['String']['output']>;
};

export type ColumnBehavior =
  | 'ADD'
  | 'NONE'
  | 'SUBTRACT';

export type CreateBusinessInput = {
  branchs: InputMaybe<Array<Scalars['String']['input']>>;
  companyName: Scalars['String']['input'];
  contactEmail: Scalars['String']['input'];
  country: InputMaybe<Scalars['String']['input']>;
  countryCode: InputMaybe<Scalars['String']['input']>;
  defaultBusiness: InputMaybe<Scalars['Boolean']['input']>;
  invoiceDueDays: InputMaybe<Scalars['Int']['input']>;
  invoiceNumberPaddingDigits: InputMaybe<Scalars['Int']['input']>;
  invoiceNumberPrefix: InputMaybe<Scalars['String']['input']>;
  invoiceNumberResetYearly: InputMaybe<Scalars['Boolean']['input']>;
  invoiceNumberStartNumber: InputMaybe<Scalars['Int']['input']>;
  location: InputMaybe<Scalars['String']['input']>;
  logoUrl: InputMaybe<Scalars['String']['input']>;
  ownerId: InputMaybe<Scalars['ID']['input']>;
  phoneNumber: Scalars['String']['input'];
  websiteUrl: InputMaybe<Scalars['String']['input']>;
};

export type CreateClientInput = {
  address: InputMaybe<Scalars['String']['input']>;
  businessId: Scalars['String']['input'];
  clientCompanyName: InputMaybe<Scalars['String']['input']>;
  country: InputMaybe<Scalars['String']['input']>;
  countryCode: InputMaybe<Scalars['String']['input']>;
  email: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  phone: Scalars['String']['input'];
  socialProfiles: InputMaybe<Array<SocialProfileInput>>;
  userId: InputMaybe<Scalars['String']['input']>;
};

export type CreateInvoiceInput = {
  businessId: Scalars['String']['input'];
  clientId: Scalars['String']['input'];
  clientName: InputMaybe<Scalars['String']['input']>;
  columns: InputMaybe<Array<InvoiceColumnInput>>;
  currency: Currency;
  dueDate: Scalars['String']['input'];
  invoiceNumber: InputMaybe<Scalars['String']['input']>;
  issueDate: Scalars['String']['input'];
  items: InputMaybe<Array<InvoiceItemInput>>;
  notes: InputMaybe<Scalars['String']['input']>;
  status: InputMaybe<InvoiceStatus>;
  template: InputMaybe<InvoiceTemplate>;
  totals: InputMaybe<InvoiceTotalsInput>;
};

export type Currency =
  | 'BDT'
  | 'EUR'
  | 'GBP'
  | 'INR'
  | 'USD';

export type DeleteResponse = {
  __typename?: 'DeleteResponse';
  message: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
  timestamp: Scalars['String']['output'];
};

export type InvoiceColumnInput = {
  affectsTotal: InputMaybe<Scalars['Boolean']['input']>;
  behavior: ColumnBehavior;
  fieldKey: Scalars['String']['input'];
  format: InputMaybe<Scalars['String']['input']>;
  hidden: InputMaybe<Scalars['Boolean']['input']>;
  id: Scalars['String']['input'];
  label: Scalars['String']['input'];
  locked: InputMaybe<Scalars['Boolean']['input']>;
  order: Scalars['Int']['input'];
  role: InputMaybe<Scalars['String']['input']>;
  type: Scalars['String']['input'];
};

export type InvoiceColumnType = {
  __typename?: 'InvoiceColumnType';
  affectsTotal: Maybe<Scalars['Boolean']['output']>;
  behavior: ColumnBehavior;
  fieldKey: Scalars['String']['output'];
  format: Maybe<Scalars['String']['output']>;
  hidden: Scalars['Boolean']['output'];
  id: Scalars['String']['output'];
  label: Scalars['String']['output'];
  locked: Scalars['Boolean']['output'];
  order: Scalars['Int']['output'];
  role: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
};

export type InvoiceItemInput = {
  id: Scalars['String']['input'];
  itemTotal: Scalars['Float']['input'];
  order: Scalars['Int']['input'];
  values: InvoiceItemValuesInput;
};

export type InvoiceItemType = {
  __typename?: 'InvoiceItemType';
  id: Scalars['String']['output'];
  itemTotal: Scalars['Float']['output'];
  order: Scalars['Int']['output'];
  values: InvoiceItemValuesType;
};

export type InvoiceItemValuesInput = {
  description: Scalars['String']['input'];
  extra: InputMaybe<Scalars['JSON']['input']>;
  price: Scalars['Float']['input'];
  quantity: Scalars['Float']['input'];
};

export type InvoiceItemValuesType = {
  __typename?: 'InvoiceItemValuesType';
  description: Scalars['String']['output'];
  extra: Maybe<Scalars['JSON']['output']>;
  price: Scalars['Float']['output'];
  quantity: Scalars['Float']['output'];
};

export type InvoiceListType = {
  __typename?: 'InvoiceListType';
  invoices: Array<InvoiceType>;
  limit: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type InvoiceStatus =
  | 'DRAFT'
  | 'INVOICE'
  | 'PROPOSAL'
  | 'QUOTATION';

export type InvoiceTemplate =
  | 'BUSINESS'
  | 'CLASSIC'
  | 'CLEAN'
  | 'ELEGANT'
  | 'MINIMAL'
  | 'MODERN'
  | 'PROFESSIONAL'
  | 'SIMPLE'
  | 'SMART'
  | 'STANDARD';

export type InvoiceTotalCustomValueType =
  | 'FIXED'
  | 'PERCENT';

export type InvoiceTotalsCustomFieldType = {
  __typename?: 'InvoiceTotalsCustomFieldType';
  amount: Scalars['Float']['output'];
  amountFormatted: Scalars['String']['output'];
  behavior: ColumnBehavior;
  key: Scalars['String']['output'];
  label: Maybe<Scalars['String']['output']>;
  value: Scalars['Float']['output'];
  valueFormatted: Scalars['String']['output'];
  valueType: InvoiceTotalCustomValueType;
};

export type InvoiceTotalsInput = {
  additions: InputMaybe<TotalsAdditionsInput>;
  custom: InputMaybe<Array<TotalsCustomFieldInput>>;
  grandTotal: InputMaybe<Scalars['Float']['input']>;
  subTotal: InputMaybe<Scalars['Float']['input']>;
  subtractions: InputMaybe<TotalsSubtractionsInput>;
};

export type InvoiceTotalsType = {
  __typename?: 'InvoiceTotalsType';
  additions: Maybe<TotalsAdditions>;
  balanceDue: Scalars['Float']['output'];
  balanceDueFormatted: Scalars['String']['output'];
  custom: Maybe<Array<InvoiceTotalsCustomFieldType>>;
  grandTotal: Scalars['Float']['output'];
  grandTotalFormatted: Scalars['String']['output'];
  subTotal: Scalars['Float']['output'];
  subTotalFormatted: Scalars['String']['output'];
  subtractions: Maybe<TotalsSubtractions>;
};

export type InvoiceType = {
  __typename?: 'InvoiceType';
  _id: Scalars['ID']['output'];
  businessId: Scalars['String']['output'];
  businessInfo: Maybe<BusinessType>;
  clientId: Scalars['String']['output'];
  clientInfo: Maybe<ClientType>;
  clientName: Scalars['String']['output'];
  columns: Maybe<Array<InvoiceColumnType>>;
  createdAt: Scalars['String']['output'];
  createdBy: Scalars['String']['output'];
  createdByInfo: Maybe<UserType>;
  currency: Currency;
  dueDate: Scalars['String']['output'];
  invoiceNumber: Scalars['String']['output'];
  issueDate: Scalars['String']['output'];
  items: Maybe<Array<InvoiceItemType>>;
  notes: Maybe<Scalars['String']['output']>;
  publicShare: Maybe<Scalars['Boolean']['output']>;
  status: InvoiceStatus;
  template: InvoiceTemplate;
  totals: Maybe<InvoiceTotalsType>;
  updatedAt: Scalars['String']['output'];
};

export type LoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type LogoutInput = {
  /** The user ID to log out (will revoke all tokens for this user) */
  userId: Scalars['String']['input'];
};

export type MarkNotificationReadInput = {
  id: Scalars['ID']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  adminMarkAllNotificationsRead: Scalars['Boolean']['output'];
  adminMarkNotificationRead: Scalars['Boolean']['output'];
  createBusiness: BusinessType;
  createClient: ClientType;
  createInvoice: InvoiceType;
  deleteBusiness: DeleteResponse;
  deleteClient: DeleteResponse;
  deleteInvoice: DeleteResponse;
  disableInvoicePublicShare: Scalars['Boolean']['output'];
  enableInvoicePublicShare: Scalars['String']['output'];
  login: AuthResponse;
  logout: Scalars['Boolean']['output'];
  refreshToken: AuthResponse;
  register: AuthResponse;
  reserveInvoiceNumber: Scalars['String']['output'];
  updateBusiness: BusinessType;
  updateClient: ClientType;
  updateInvoice: InvoiceType;
  updateUser: User;
  updateUserStatusByAdmin: UserType;
};


export type MutationAdminMarkNotificationReadArgs = {
  input: MarkNotificationReadInput;
};


export type MutationCreateBusinessArgs = {
  createBusinessInput: CreateBusinessInput;
};


export type MutationCreateClientArgs = {
  input: CreateClientInput;
};


export type MutationCreateInvoiceArgs = {
  input: CreateInvoiceInput;
};


export type MutationDeleteBusinessArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteClientArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteInvoiceArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDisableInvoicePublicShareArgs = {
  id: Scalars['ID']['input'];
};


export type MutationEnableInvoicePublicShareArgs = {
  enabled?: InputMaybe<Scalars['Boolean']['input']>;
  id: Scalars['ID']['input'];
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


export type MutationReserveInvoiceNumberArgs = {
  businessId: Scalars['ID']['input'];
  issueDate: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateBusinessArgs = {
  id: Scalars['ID']['input'];
  updateBusinessInput: UpdateBusinessInput;
};


export type MutationUpdateClientArgs = {
  input: UpdateClientInput;
};


export type MutationUpdateInvoiceArgs = {
  input: UpdateInvoiceInput;
};


export type MutationUpdateUserArgs = {
  updateUserInput: UpdateUserInput;
};


export type MutationUpdateUserStatusByAdminArgs = {
  input: UpdateUserStatusInput;
};

export type Query = {
  __typename?: 'Query';
  adminNotifications: AdminNotificationsListType;
  adminOnly: Scalars['String']['output'];
  adminUnreadNotificationCount: Scalars['Int']['output'];
  adminUserSessions: UserSessionsListType;
  findAllBusinesses: Array<BusinessType>;
  findAllBusinessesList: BusinessListType;
  findAllClients: Array<ClientType>;
  findAllClientsAccessByAdmin: AdminClientsListType;
  findAllClientsList: ClientListType;
  findAllInvoicesByAdmin: Array<InvoiceType>;
  findAllInvoicesByAdminList: InvoiceListType;
  findAllUsersByAdmin: AdminUsersListType;
  findOneClient: ClientType;
  /** Health check endpoint */
  health: Scalars['String']['output'];
  me: Maybe<User>;
  myBusinesses: Array<BusinessType>;
  myBusinessesList: BusinessListType;
  myInvoices: Array<InvoiceType>;
  myInvoicesList: InvoiceListType;
  mySessions: UserSessionsListType;
  singleBusiness: BusinessType;
  singleInvoice: InvoiceType;
  viewInvoice: InvoiceType;
};


export type QueryAdminNotificationsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryAdminUserSessionsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
  userId: Scalars['String']['input'];
};


export type QueryFindAllBusinessesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
};


export type QueryFindAllBusinessesListArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
};


export type QueryFindAllClientsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
};


export type QueryFindAllClientsAccessByAdminArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
};


export type QueryFindAllClientsListArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
};


export type QueryFindAllInvoicesByAdminArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
};


export type QueryFindAllInvoicesByAdminListArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
};


export type QueryFindAllUsersByAdminArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
};


export type QueryFindOneClientArgs = {
  id: Scalars['ID']['input'];
};


export type QueryMyBusinessesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
};


export type QueryMyBusinessesListArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
};


export type QueryMyInvoicesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
};


export type QueryMyInvoicesListArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
};


export type QueryMySessionsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
};


export type QuerySingleBusinessArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySingleInvoiceArgs = {
  id: Scalars['ID']['input'];
};


export type QueryViewInvoiceArgs = {
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
  phone: InputMaybe<Scalars['String']['input']>;
};

export type SocialProfileInput = {
  platform: Scalars['String']['input'];
  url: Scalars['String']['input'];
};

export type SocialProfileType = {
  __typename?: 'SocialProfileType';
  platform: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type TotalsAdditions = {
  __typename?: 'TotalsAdditions';
  shipping: Maybe<Scalars['Float']['output']>;
  shippingFormatted: Maybe<Scalars['String']['output']>;
  tax: Maybe<Scalars['Float']['output']>;
  taxFormatted: Maybe<Scalars['String']['output']>;
};

export type TotalsAdditionsInput = {
  shipping: InputMaybe<Scalars['Float']['input']>;
  tax: InputMaybe<Scalars['Float']['input']>;
};

export type TotalsCustomFieldInput = {
  behavior: ColumnBehavior;
  key: Scalars['String']['input'];
  label: InputMaybe<Scalars['String']['input']>;
  value: Scalars['Float']['input'];
  valueType: InvoiceTotalCustomValueType;
};

export type TotalsSubtractions = {
  __typename?: 'TotalsSubtractions';
  discount: Maybe<Scalars['Float']['output']>;
  discountFormatted: Maybe<Scalars['String']['output']>;
  paid: Maybe<Scalars['Float']['output']>;
  paidFormatted: Maybe<Scalars['String']['output']>;
};

export type TotalsSubtractionsInput = {
  discount: InputMaybe<Scalars['Float']['input']>;
  paid: InputMaybe<Scalars['Float']['input']>;
};

export type UpdateBusinessInput = {
  branchs: InputMaybe<Array<Scalars['String']['input']>>;
  companyName: InputMaybe<Scalars['String']['input']>;
  contactEmail: InputMaybe<Scalars['String']['input']>;
  country: InputMaybe<Scalars['String']['input']>;
  countryCode: InputMaybe<Scalars['String']['input']>;
  defaultBusiness: InputMaybe<Scalars['Boolean']['input']>;
  invoiceDueDays: InputMaybe<Scalars['Int']['input']>;
  invoiceNumberPaddingDigits: InputMaybe<Scalars['Int']['input']>;
  invoiceNumberPrefix: InputMaybe<Scalars['String']['input']>;
  invoiceNumberResetYearly: InputMaybe<Scalars['Boolean']['input']>;
  invoiceNumberStartNumber: InputMaybe<Scalars['Int']['input']>;
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
  country: InputMaybe<Scalars['String']['input']>;
  countryCode: InputMaybe<Scalars['String']['input']>;
  email: InputMaybe<Scalars['String']['input']>;
  /** The unique identifier of the client to update */
  id: Scalars['ID']['input'];
  name: InputMaybe<Scalars['String']['input']>;
  phone: InputMaybe<Scalars['String']['input']>;
  socialProfiles: InputMaybe<Array<SocialProfileInput>>;
  userId: InputMaybe<Scalars['String']['input']>;
};

export type UpdateInvoiceInput = {
  businessId: InputMaybe<Scalars['String']['input']>;
  clientId: InputMaybe<Scalars['String']['input']>;
  clientName: InputMaybe<Scalars['String']['input']>;
  columns: InputMaybe<Array<InvoiceColumnInput>>;
  currency: InputMaybe<Currency>;
  dueDate: InputMaybe<Scalars['String']['input']>;
  /** The unique identifier of the invoice to update */
  id: Scalars['ID']['input'];
  invoiceNumber: InputMaybe<Scalars['String']['input']>;
  issueDate: InputMaybe<Scalars['String']['input']>;
  items: InputMaybe<Array<InvoiceItemInput>>;
  notes: InputMaybe<Scalars['String']['input']>;
  status: InputMaybe<InvoiceStatus>;
  template: InputMaybe<InvoiceTemplate>;
  totals: InputMaybe<InvoiceTotalsInput>;
};

export type UpdateUserInput = {
  name: InputMaybe<Scalars['String']['input']>;
  password: InputMaybe<Scalars['String']['input']>;
  phone: InputMaybe<Scalars['String']['input']>;
  picture: InputMaybe<Scalars['String']['input']>;
};

export type UpdateUserStatusInput = {
  status: UserStatus;
  userId: Scalars['ID']['input'];
};

export type User = {
  __typename?: 'User';
  _id: Scalars['ID']['output'];
  createdAt: Scalars['Timestamp']['output'];
  email: Scalars['String']['output'];
  name: Maybe<Scalars['String']['output']>;
  phone: Maybe<Scalars['String']['output']>;
  picture: Maybe<Scalars['String']['output']>;
  role: Scalars['String']['output'];
  status: UserStatus;
  updatedAt: Scalars['Timestamp']['output'];
};

export type UserSession = {
  __typename?: 'UserSession';
  _id: Scalars['ID']['output'];
  browserName: Maybe<Scalars['String']['output']>;
  browserVersion: Maybe<Scalars['String']['output']>;
  city: Maybe<Scalars['String']['output']>;
  country: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['Timestamp']['output'];
  /** desktop | mobile | tablet | unknown */
  deviceType: Maybe<Scalars['String']['output']>;
  endedAt: Maybe<Scalars['Timestamp']['output']>;
  ip: Maybe<Scalars['String']['output']>;
  isActive: Scalars['Boolean']['output'];
  lastSeenAt: Maybe<Scalars['Timestamp']['output']>;
  latitude: Maybe<Scalars['Float']['output']>;
  longitude: Maybe<Scalars['Float']['output']>;
  osName: Maybe<Scalars['String']['output']>;
  osVersion: Maybe<Scalars['String']['output']>;
  region: Maybe<Scalars['String']['output']>;
  sessionId: Scalars['String']['output'];
  timezone: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['Timestamp']['output'];
  userAgent: Maybe<Scalars['String']['output']>;
  userId: Scalars['String']['output'];
};

export type UserSessionsListType = {
  __typename?: 'UserSessionsListType';
  limit: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
  sessions: Array<UserSession>;
  total: Scalars['Int']['output'];
};

export type UserStatus =
  | 'ACTIVE'
  | 'INACTIVE';

export type UserType = {
  __typename?: 'UserType';
  _id: Scalars['ID']['output'];
  createdAt: Scalars['Timestamp']['output'];
  email: Scalars['String']['output'];
  name: Maybe<Scalars['String']['output']>;
  picture: Maybe<Scalars['String']['output']>;
  role: Scalars['String']['output'];
  status: UserStatus;
  updatedAt: Scalars['Timestamp']['output'];
};

export type RegisterMutationVariables = Exact<{
  registerInput: RegisterInput;
}>;


export type RegisterMutation = { __typename?: 'Mutation', register: { __typename?: 'AuthResponse', accessToken: string, refreshToken: string, userId: string, user: { __typename?: 'UserType', _id: string, email: string, name: string | null, picture: string | null } } };

export type LoginMutationVariables = Exact<{
  loginInput: LoginInput;
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'AuthResponse', accessToken: string, refreshToken: string, userId: string, user: { __typename?: 'UserType', _id: string, email: string, name: string | null, picture: string | null } } };

export type DeleteBusinessMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteBusinessMutation = { __typename?: 'Mutation', deleteBusiness: { __typename?: 'DeleteResponse', message: string, success: boolean } };

export type CreateBusinessMutationVariables = Exact<{
  createBusinessInput: CreateBusinessInput;
}>;


export type CreateBusinessMutation = { __typename?: 'Mutation', createBusiness: { __typename?: 'BusinessType', _id: string } };

export type UpdateBusinessMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  updateBusinessInput: UpdateBusinessInput;
}>;


export type UpdateBusinessMutation = { __typename?: 'Mutation', updateBusiness: { __typename?: 'BusinessType', _id: string, companyName: string | null, contactEmail: string | null, country: string | null, countryCode: string | null, invoiceDueDays: number | null, invoiceNumberPaddingDigits: number | null, invoiceNumberPrefix: string | null, invoiceNumberResetYearly: boolean | null, invoiceNumberStartNumber: number | null, location: string | null, logoUrl: string | null, ownerId: string, phoneNumber: string | null, websiteUrl: string | null, createdAt: any, updatedAt: any } };

export type DeleteClientMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteClientMutation = { __typename?: 'Mutation', deleteClient: { __typename?: 'DeleteResponse', message: string, success: boolean } };

export type CreateClientMutationVariables = Exact<{
  input: CreateClientInput;
}>;


export type CreateClientMutation = { __typename?: 'Mutation', createClient: { __typename?: 'ClientType', _id: string, name: string, email: string | null, phone: string | null, country: string | null, countryCode: string | null, clientCompanyName: string | null, address: string | null, businessId: string, userId: string | null } };

export type UpdateClientMutationVariables = Exact<{
  input: UpdateClientInput;
}>;


export type UpdateClientMutation = { __typename?: 'Mutation', updateClient: { __typename?: 'ClientType', _id: string, name: string, email: string | null, phone: string | null, country: string | null, countryCode: string | null, clientCompanyName: string | null, address: string | null, businessId: string, userId: string | null } };

export type CreateInvoiceMutationVariables = Exact<{
  input: CreateInvoiceInput;
}>;


export type CreateInvoiceMutation = { __typename?: 'Mutation', createInvoice: { __typename?: 'InvoiceType', _id: string } };

export type UpdateInvoiceMutationVariables = Exact<{
  input: UpdateInvoiceInput;
}>;


export type UpdateInvoiceMutation = { __typename?: 'Mutation', updateInvoice: { __typename?: 'InvoiceType', _id: string } };

export type DeleteInvoiceMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteInvoiceMutation = { __typename?: 'Mutation', deleteInvoice: { __typename?: 'DeleteResponse', message: string, success: boolean } };

export type EnableInvoicePublicShareMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  enabled?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type EnableInvoicePublicShareMutation = { __typename?: 'Mutation', enableInvoicePublicShare: string };

export type ReserveInvoiceNumberMutationVariables = Exact<{
  businessId: Scalars['ID']['input'];
  issueDate: InputMaybe<Scalars['String']['input']>;
}>;


export type ReserveInvoiceNumberMutation = { __typename?: 'Mutation', reserveInvoiceNumber: string };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me: { __typename?: 'User', _id: string, email: string, name: string | null, picture: string | null } | null };

export type GetMyBusinessesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMyBusinessesQuery = { __typename?: 'Query', myBusinesses: Array<{ __typename?: 'BusinessType', _id: string, companyName: string | null, contactEmail: string | null, country: string | null, countryCode: string | null, createdAt: any, defaultBusiness: boolean | null, invoiceNumberPaddingDigits: number | null, invoiceNumberPrefix: string | null, invoiceDueDays: number | null, invoiceNumberResetYearly: boolean | null, invoiceNumberStartNumber: number | null, location: string | null, logoUrl: string | null, ownerId: string, phoneNumber: string | null, updatedAt: any, websiteUrl: string | null, owner: { __typename?: 'User', _id: string, createdAt: any, email: string, name: string | null, role: string, updatedAt: any } | null }> };

export type SingleBusinessQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type SingleBusinessQuery = { __typename?: 'Query', singleBusiness: { __typename?: 'BusinessType', _id: string, companyName: string | null, contactEmail: string | null, createdAt: any, defaultBusiness: boolean | null, location: string | null, logoUrl: string | null, ownerId: string, phoneNumber: string | null, updatedAt: any, websiteUrl: string | null } };

export type FindAllClientsQueryVariables = Exact<{ [key: string]: never; }>;


export type FindAllClientsQuery = { __typename?: 'Query', findAllClients: Array<{ __typename?: 'ClientType', _id: string, address: string | null, businessId: string, clientCompanyName: string | null, country: string | null, countryCode: string | null, createdAt: any, email: string | null, name: string, phone: string | null, updatedAt: any, userId: string | null, business: { __typename?: 'Business', _id: string, companyName: string | null } | null, user: { __typename?: 'User', _id: string, name: string | null } | null }> };

export type FindOneClientQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type FindOneClientQuery = { __typename?: 'Query', findOneClient: { __typename?: 'ClientType', _id: string, name: string, address: string | null, clientCompanyName: string | null, country: string | null, countryCode: string | null, email: string | null, phone: string | null, businessId: string, userId: string | null } };

export type GetMyBusinessesIdQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMyBusinessesIdQuery = { __typename?: 'Query', myBusinesses: Array<{ __typename?: 'BusinessType', _id: string, companyName: string | null, defaultBusiness: boolean | null }> };

export type MyInvoicesQueryVariables = Exact<{ [key: string]: never; }>;


export type MyInvoicesQuery = { __typename?: 'Query', myInvoices: Array<{ __typename?: 'InvoiceType', _id: string, invoiceNumber: string, currency: Currency, status: InvoiceStatus, issueDate: string, dueDate: string, publicShare: boolean | null, createdAt: string, clientInfo: { __typename?: 'ClientType', name: string } | null, totals: { __typename?: 'InvoiceTotalsType', subTotal: number, grandTotal: number, subtractions: { __typename?: 'TotalsSubtractions', paid: number | null } | null } | null }> };

export type SingleInvoiceQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type SingleInvoiceQuery = { __typename?: 'Query', singleInvoice: { __typename?: 'InvoiceType', _id: string, businessId: string, clientId: string, clientName: string, invoiceNumber: string, currency: Currency, issueDate: string, dueDate: string, notes: string | null, status: InvoiceStatus, template: InvoiceTemplate, createdAt: string, updatedAt: string, businessInfo: { __typename?: 'BusinessType', companyName: string | null, location: string | null, contactEmail: string | null } | null, clientInfo: { __typename?: 'ClientType', name: string, address: string | null } | null, columns: Array<{ __typename?: 'InvoiceColumnType', id: string, fieldKey: string, label: string, type: string, order: number, behavior: ColumnBehavior, locked: boolean, hidden: boolean, format: string | null, role: string | null, affectsTotal: boolean | null }> | null, items: Array<{ __typename?: 'InvoiceItemType', id: string, order: number, itemTotal: number, values: { __typename?: 'InvoiceItemValuesType', description: string, price: number, quantity: number, extra: any | null } }> | null, totals: { __typename?: 'InvoiceTotalsType', subTotal: number, grandTotal: number, balanceDue: number, custom: Array<{ __typename?: 'InvoiceTotalsCustomFieldType', key: string, label: string | null, behavior: ColumnBehavior, valueType: InvoiceTotalCustomValueType, value: number }> | null, additions: { __typename?: 'TotalsAdditions', shipping: number | null, tax: number | null } | null, subtractions: { __typename?: 'TotalsSubtractions', discount: number | null, paid: number | null } | null } | null } };

export type ViewInvoiceQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ViewInvoiceQuery = { __typename?: 'Query', viewInvoice: { __typename?: 'InvoiceType', _id: string, businessId: string, clientId: string, clientName: string, invoiceNumber: string, currency: Currency, issueDate: string, dueDate: string, notes: string | null, status: InvoiceStatus, template: InvoiceTemplate, createdAt: string, updatedAt: string, businessInfo: { __typename?: 'BusinessType', companyName: string | null, location: string | null, contactEmail: string | null } | null, clientInfo: { __typename?: 'ClientType', name: string, address: string | null } | null, columns: Array<{ __typename?: 'InvoiceColumnType', id: string, fieldKey: string, label: string, type: string, order: number, behavior: ColumnBehavior, locked: boolean, hidden: boolean, format: string | null, role: string | null, affectsTotal: boolean | null }> | null, items: Array<{ __typename?: 'InvoiceItemType', id: string, order: number, itemTotal: number, values: { __typename?: 'InvoiceItemValuesType', description: string, price: number, quantity: number, extra: any | null } }> | null, totals: { __typename?: 'InvoiceTotalsType', subTotal: number, grandTotal: number, balanceDue: number, custom: Array<{ __typename?: 'InvoiceTotalsCustomFieldType', key: string, label: string | null, behavior: ColumnBehavior, valueType: InvoiceTotalCustomValueType, value: number }> | null, additions: { __typename?: 'TotalsAdditions', shipping: number | null, tax: number | null } | null, subtractions: { __typename?: 'TotalsSubtractions', discount: number | null, paid: number | null } | null } | null } };

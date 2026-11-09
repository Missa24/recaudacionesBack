// iterface ad => active directory

export interface AdUser {
  username: string;
  displayName: string;
  email: string;
  firstName: string;
  lastName: string;
  title: string;
  department: string;
  phone: string;
  mobile: string;
  company: string;
  manager: string;
  dn: string;
  groups?: string[];
  groupsFull?: string[];
  description?: string;
  whenCreated?: string;
  whenChanged?: string;
  objectGUID?: string;
}

export interface AdGroup {
  name: string;
  description: string;
  members: string[];
  groupType: string;
  dn: string;
}

export interface AdUserOptions {
  search?: string;
  limit?: number;
  offset?: number;
  includeGroups?: boolean;
}

export interface AdGroupOptions {
  search?: string;
  limit?: number;
}
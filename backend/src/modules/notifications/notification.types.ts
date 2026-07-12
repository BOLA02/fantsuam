export interface SendSmsInput {
  customerId?: string;
  phone: string;
  templateCode: string;
  variables: Record<string, string | number>;
}

export interface ListSmsQuery {
  search?: string;
  status?: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED';
  page?: number;
  pageSize?: number;
}
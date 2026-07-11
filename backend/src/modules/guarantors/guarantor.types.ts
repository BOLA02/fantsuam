// src/modules/guarantors/guarantor.types.ts

export interface CreateGuarantorInput {
  customerId: string;
  fullName: string;
  relationship: string;
  phone: string;
  email?: string;
  occupation?: string;
  address: string;
}

export interface UpdateGuarantorInput {
  fullName?: string;
  relationship?: string;
  phone?: string;
  email?: string;
  occupation?: string;
  address?: string;
}
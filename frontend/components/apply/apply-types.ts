// components/apply/apply-types.ts

export interface ApplyFormData {
  // Step 1
  firstName: string;
  lastName: string;
  middleName: string;
  phone: string;
  email: string;
  gender: 'MALE' | 'FEMALE' | '';
  dateOfBirth: string;
  nin: string;
  bvn: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  occupation: string;
  employer: string;
  monthlyIncome: string;

  // Step 2
  loanProductId: string;
  loanAmount: string;
  purpose: string;
  durationMonths: string;

  // Step 3
  guarantorName: string;
  guarantorPhone: string;
  guarantorEmail: string;
  guarantorRelationship: string;
  guarantorOccupation: string;
  guarantorAddress: string;

  // Result state
  customerId?: string;
  applicationId?: string;
  applicationNumber?: string;
  guarantorId?: string;
}

export const initialFormData: ApplyFormData = {
  firstName: '',
  lastName: '',
  middleName: '',
  phone: '',
  email: '',
  gender: '',
  dateOfBirth: '',
  nin: '',
  bvn: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  country: '',
  postalCode: '',
  occupation: '',
  employer: '',
  monthlyIncome: '',
  loanProductId: '',
  loanAmount: '',
  purpose: '',
  durationMonths: '',
  guarantorName: '',
  guarantorPhone: '',
  guarantorEmail: '',
  guarantorRelationship: '',
  guarantorOccupation: '',
  guarantorAddress: '',
};
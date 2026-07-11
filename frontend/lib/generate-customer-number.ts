// lib/generate-customer-number.ts

export function generateCustomerNumber(): string {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.floor(100000 + Math.random() * 900000);
  return `CUS-${datePart}-${randomPart}`;
}
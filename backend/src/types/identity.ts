export interface IdentityTokenPayload {
  sub: string;
  email: string;
  name: string;
  employee_number: string;
  service: string;
  role: string;
  central_role: string[];
  permission: string | string[];
  iss: string;
  aud: string;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      identity?: IdentityTokenPayload & { permissions: string[] };
    }
  }
}
export const IDENTITY_ISSUER = process.env.IDENTITY_ISSUER!;
export const IDENTITY_AUDIENCE = process.env.IDENTITY_AUDIENCE!;
export const IDENTITY_PUBLIC_KEY_PEM = process.env.IDENTITY_PUBLIC_KEY_PEM!.replace(/\\n/g, "\n");
export const CENTRAL_CONSOLE_URL = process.env.CENTRAL_CONSOLE_URL!;

console.log("=== DEBUG: Loaded public key ===");
console.log(JSON.stringify(IDENTITY_PUBLIC_KEY_PEM));
console.log("=== END DEBUG ===");
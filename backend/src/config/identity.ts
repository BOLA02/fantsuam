function requiredEnv(name: string): string {
  const value = process.env[name];

  if (!value?.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const IDENTITY_ISSUER = requiredEnv("IDENTITY_ISSUER");

export const IDENTITY_AUDIENCE = requiredEnv("IDENTITY_AUDIENCE");

export const IDENTITY_PUBLIC_KEY_PEM = requiredEnv(
  "IDENTITY_PUBLIC_KEY_PEM"
).replace(/\\n/g, "\n");
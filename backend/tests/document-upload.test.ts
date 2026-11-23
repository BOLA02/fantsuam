import assert from "node:assert/strict";
import { afterEach, before, test } from "node:test";

process.env.DATABASE_URL ||= "mysql://placeholder:placeholder@127.0.0.1:3306/placeholder";
process.env.JWT_SECRET ||= "test-only-secret";
process.env.CLOUDINARY_CLOUD_NAME ||= "test";
process.env.CLOUDINARY_API_KEY ||= "test";
process.env.CLOUDINARY_API_SECRET ||= "test";

let detectedMime: typeof import("../src/middleware/upload.middleware").detectedMime;
let requireOwner: typeof import("../src/middleware/public-application.middleware").requirePublicApplicationOwner;
let requireFee: typeof import("../src/middleware/application-fee.middleware").requireApplicationFee;
let prisma: any;
let jwt: typeof import("jsonwebtoken").default;

before(async () => {
  ({ detectedMime } = await import("../src/middleware/upload.middleware"));
  ({ requirePublicApplicationOwner: requireOwner } = await import("../src/middleware/public-application.middleware"));
  ({ requireApplicationFee: requireFee } = await import("../src/middleware/application-fee.middleware"));
  prisma = (await import("../src/config/prisma")).default;
  jwt = (await import("jsonwebtoken")).default;
});

function response() {
  const state: any = { statusCode: 200 };
  state.status = (code: number) => (state.statusCode = code, state);
  state.json = (body: unknown) => (state.body = body, state);
  return state;
}

function jpeg() { return Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0xff, 0xd9]); }
function png() { return Buffer.concat([Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]), Buffer.alloc(16), Buffer.from([0x49,0x45,0x4e,0x44,0xae,0x42,0x60,0x82])]); }
function pdf() { return Buffer.from("%PDF-1.7\n1 0 obj\n%%EOF\n"); }

test("accepts valid JPEG, PNG, and PDF signatures", () => {
  assert.equal(detectedMime(jpeg()), "image/jpeg");
  assert.equal(detectedMime(png()), "image/png");
  assert.equal(detectedMime(pdf()), "application/pdf");
});

test("rejects unsupported and malformed files", () => {
  assert.equal(detectedMime(Buffer.from("GIF89a")), undefined);
  assert.equal(detectedMime(Buffer.from("%PDF-1.7 without an eof")), undefined);
  assert.equal(detectedMime(Buffer.from([0xff, 0xd8, 0xff])), undefined);
});

test("oversized multipart files are rejected", async () => {
  const express = (await import("express")).default;
  const { parseDocumentUpload } = await import("../src/middleware/upload.middleware");
  const app = express();
  app.post("/", parseDocumentUpload, (_req, res) => res.sendStatus(204));
  app.use((error: any, _req: any, res: any, _next: any) => res.status(error.statusCode ?? 500).json({ message: error.message }));
  const server = app.listen(0, "127.0.0.1");
  try {
    await new Promise<void>((resolve) => server.once("listening", resolve));
    const address = server.address();
    assert.ok(address && typeof address === "object");
    const form = new FormData();
    form.append("file", new Blob([Buffer.alloc(10 * 1024 * 1024 + 1)]), "large.pdf");
    const result = await fetch(`http://127.0.0.1:${address.port}/`, { method: "POST", body: form });
    assert.equal(result.status, 400);
    assert.match((await result.json() as any).message, /10 MB/);
  } finally {
    server.close();
  }
});

test("missing or invalid application access token is rejected", async () => {
  for (const token of [undefined, "not-a-token"]) {
    const req: any = { header: () => token, body: {} };
    const res = response();
    await requireOwner(req, res, () => assert.fail("must not continue"));
    assert.ok([401, 403].includes(res.statusCode));
  }
});

test("customer mismatch is rejected and verified identity is authoritative", async () => {
  const token = jwt.sign({ customerId: "customer-a", purpose: "public-application" }, process.env.JWT_SECRET!);
  const mismatch: any = { header: () => token, body: { customerId: "customer-b" } };
  const denied = response();
  await requireOwner(mismatch, denied, () => assert.fail("must not continue"));
  assert.equal(denied.statusCode, 403);

  const accepted: any = { header: () => token, body: {} };
  await requireOwner(accepted, response(), () => {});
  assert.equal(accepted.publicCustomerId, "customer-a");
  assert.equal(accepted.body.customerId, "customer-a");
});

test("another customer's application, guarantor, and collateral are rejected", async () => {
  prisma.loanApplication.findFirst = async () => null;
  prisma.guarantor.findFirst = async () => null;
  prisma.collateral.findFirst = async () => null;
  const token = jwt.sign({ customerId: "customer-a", purpose: "resume" }, process.env.JWT_SECRET!);
  for (const body of [{ applicationId: "x" }, { guarantorId: "x" }, { collateralId: "x" }]) {
    const res = response();
    await requireOwner({ header: () => token, body } as any, res, () => assert.fail("must not continue"));
    assert.equal(res.statusCode, 403);
  }
});

test("fee checks reject invalid tokens and another customer's payment", async () => {
  prisma.organizationSettings.findFirst = async () => ({ applicationFeeEnabled: true, applicationFeeAmount: 5000 });
  let res = response();
  await requireFee({ header: () => "bad", body: {}, publicCustomerId: "customer-a" } as any, res, () => assert.fail());
  assert.equal(res.statusCode, 402);

  prisma.applicationFeePayment.findUnique = async () => ({ id: "p", status: "SUCCESS", amount: 5000, customerId: "customer-b" });
  const token = jwt.sign({ paymentId: "p", purpose: "APPLICATION_FEE" }, process.env.JWT_SECRET!);
  res = response();
  await requireFee({ header: () => token, body: { customerId: "customer-a" }, publicCustomerId: "customer-a" } as any, res, () => assert.fail());
  assert.equal(res.statusCode, 402);
});

test("disabled fees bypass payment and a consumed payment remains valid for its legitimate application", async () => {
  prisma.organizationSettings.findFirst = async () => ({ applicationFeeEnabled: false, applicationFeeAmount: 5000 });
  let continued = false;
  await requireFee({ header: () => undefined, body: {} } as any, response(), () => { continued = true; });
  assert.equal(continued, true);

  prisma.organizationSettings.findFirst = async () => ({ applicationFeeEnabled: true, applicationFeeAmount: 5000 });
  prisma.applicationFeePayment.findUnique = async () => ({ id: "p", status: "SUCCESS", amount: 5000, customerId: "customer-a", applicationId: "app-a", consumedAt: new Date() });
  const token = jwt.sign({ paymentId: "p", purpose: "APPLICATION_FEE" }, process.env.JWT_SECRET!);
  continued = false;
  await requireFee({ header: () => token, body: { customerId: "customer-a", applicationId: "app-a" }, publicCustomerId: "customer-a" } as any, response(), () => { continued = true; });
  assert.equal(continued, true);
});

afterEach(() => {});

test("Cloudinary failure prevents database persistence", async () => {
  const service = (await import("../src/modules/documents/document.service")).default;
  const { documentStorage } = await import("../src/modules/documents/document.storage");
  prisma.customer.findFirst = async () => ({ id: "customer-a" });
  let created = false;
  prisma.document.create = async () => (created = true);
  documentStorage.upload = async () => { throw new Error("cloudinary unavailable"); };
  await assert.rejects(
    service.upload({ documentType: "NATIONAL_ID", customerId: "customer-a" }, { originalname: "id.jpg", mimetype: "image/jpeg", size: 7, buffer: jpeg() } as any, undefined, "customer-a"),
    /Document storage is unavailable/
  );
  assert.equal(created, false);
});

test("database persistence failure cleans up the exact authenticated Cloudinary asset", async () => {
  const service = (await import("../src/modules/documents/document.service")).default;
  const { documentStorage } = await import("../src/modules/documents/document.storage");
  prisma.customer.findFirst = async () => ({ id: "customer-a" });
  const stored = { publicId: "loan-documents/exact-id", resourceType: "image" as const, format: "jpg", storageReference: "cloudinary://authenticated/image/jpg/loan-documents/exact-id" };
  documentStorage.upload = async () => stored;
  let deleted: any;
  documentStorage.delete = async (asset) => { deleted = asset; };
  prisma.document.create = async () => { throw new Error("database failed"); };
  await assert.rejects(
    service.upload({ documentType: "NATIONAL_ID", customerId: "customer-a" }, { originalname: "id.jpg", mimetype: "image/jpeg", size: 7, buffer: jpeg() } as any, undefined, "customer-a"),
    /database failed/
  );
  assert.deepEqual(deleted, stored);
});

test("successful frontend-shaped upload persists private metadata without returning a URL", async () => {
  const service = (await import("../src/modules/documents/document.service")).default;
  const { documentStorage } = await import("../src/modules/documents/document.storage");
  prisma.customer.findFirst = async () => ({ id: "customer-a" });
  documentStorage.upload = async () => ({ publicId: "loan-documents/id", resourceType: "raw", format: "pdf", storageReference: "cloudinary://authenticated/raw/pdf/loan-documents/id" });
  prisma.document.create = async ({ data }: any) => ({ id: "doc-a", ...data });
  const result: any = await service.upload(
    { documentType: "BANK_STATEMENT", customerId: "customer-a", remarks: "frontend payload" },
    { originalname: "statement.pdf", mimetype: "application/pdf", size: pdf().length, buffer: pdf() } as any,
    undefined,
    "customer-a"
  );
  assert.equal(result.fileUrl, undefined);
  assert.equal(result.downloadPath, "/api/documents/doc-a/download");
  assert.equal(result.originalFileName, "statement.pdf");
});

test("document retrieval authorization requires the document-management permission", async () => {
  const { requirePermission } = await import("../src/middleware/permission.middleware");
  const guard = requirePermission("loan.documents.manage");
  let res = response();
  guard({} as any, res, () => assert.fail("anonymous retrieval must not continue"));
  assert.equal(res.statusCode, 401);

  res = response();
  guard({ identity: { role: "loan.officer", central_role: [], permissions: [] } } as any, res, () => assert.fail("unauthorized retrieval must not continue"));
  assert.equal(res.statusCode, 403);

  let continued = false;
  guard({ identity: { role: "loan.officer", central_role: [], permissions: ["loan.documents.manage"] } } as any, response(), () => { continued = true; });
  assert.equal(continued, true);
});

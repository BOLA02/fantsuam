// verify-test.js
const jwt = require("jsonwebtoken");
const fs = require("fs");

const publicKey = fs.readFileSync("test-public.pem", "utf8");

const token = process.argv[2];

if (!token) {
  console.error("Usage: node verify-test.js <token>");
  process.exit(1);
}

try {
  const decoded = jwt.verify(token, publicKey, {
    algorithms: ["RS256"],
    issuer: "https://identity.fantsuam.com.ng",
    audience: "fantsuam-loan",
  });
  console.log("✅ VALID:", decoded);
} catch (err) {
  console.error("❌ INVALID:", err.message);
}
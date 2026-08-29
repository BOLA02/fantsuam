const jwt = require("jsonwebtoken");
const fs = require("fs");

const privateKey = fs.readFileSync("test-private.pem", "utf8");

const token = jwt.sign(
  {
    sub: "test-employee-guid-123",
    email: "admin@microfinance.com",
    name: "System Administrator",
    employee_number: "EMP-000001",
    service: "loan",
    role: "loan.admin",
    central_role: ["loan.admin"],
    
    permission: ["loan.loans.manage", "loan.loans.disburse", "loan.repayments.manage", "loan.repayments.confirm","loan.applications.manage", "loan.applications.admin", "loan.customers.admin", "loan.customers.manage", "loan.savings.manage", "loan.settings.manage", "loan.users.admin", "loan.users.manage", "loan.branches.manage", "loan.guarantors.manage", "loan.documents.manage", "loan.loan-products.manage", "loan.sms.send", "loan.audit.view"],
  },
  privateKey,
  {
    algorithm: "RS256",
    issuer: "https://identity.fantsuam.com.ng",
    audience: "fantsuam-loan",
    expiresIn: "5m",
  }
);

console.log(token);
// add at the bottom of generate-test-token.js, replacing console.log(token)
const path = require("path");
fs.writeFileSync(path.join(__dirname, "token.txt"), token);
console.log("Token written to backend/token.txt, length:", token.length);
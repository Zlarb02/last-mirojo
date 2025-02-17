const crypto = require("crypto");
const secret = crypto.randomBytes(32).toString("hex");
console.log("Generated Session Secret:", secret);
// node utils/generate-secret.cjs

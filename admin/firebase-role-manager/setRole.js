const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

async function setUserRole(uid, role) {
    await admin.auth().setCustomUserClaims(uid, { role: role });
    console.log(`✅ Role "${role}" assigned to user ${uid}`);
}

const uid = process.argv[2];
const role = process.argv[3];

if (!uid || !role) {
    console.error("Usage: node setRole.js <UID> <role>");
    process.exit(1);
}

setUserRole(uid, role);

// command to run this file: node setRole.js <UID> <role>
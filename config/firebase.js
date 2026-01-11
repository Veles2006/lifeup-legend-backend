import admin from 'firebase-admin';
import fs from 'fs';

const path =
    process.env.NODE_ENV === 'production'
        ? '/etc/secrets/firebase-admin.json'
        : './firebase-admin.json';

const serviceAccount = JSON.parse(
    fs.readFileSync(path, 'utf-8')
);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

export default admin;

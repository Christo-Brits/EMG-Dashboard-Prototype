/**
 * Promote a user to admin by email address.
 *
 * Usage:
 *   1. Install firebase-admin: npm install -D firebase-admin
 *   2. Download a service account key from Firebase Console > Project Settings > Service Accounts
 *   3. Set the GOOGLE_APPLICATION_CREDENTIALS env var to the key path
 *   4. Run: node scripts/promote-admin.js christo@emgroup.co.nz
 */

import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const email = process.argv[2];
if (!email) {
    console.error('Usage: node scripts/promote-admin.js <email>');
    process.exit(1);
}

initializeApp();
const db = getFirestore();

async function promote() {
    // Find the user doc by email
    const snapshot = await db.collection('users').where('email', '==', email.toLowerCase()).get();

    if (snapshot.empty) {
        console.error(`No user found with email: ${email}`);
        console.log('\nThe user must sign in at least once before they can be promoted.');
        process.exit(1);
    }

    const userDoc = snapshot.docs[0];
    const uid = userDoc.id;
    const data = userDoc.data();

    console.log(`Found user: ${data.name || data.email} (${uid})`);
    console.log(`  Current globalRole: ${data.globalRole || 'none'}`);

    // Update to admin
    await db.collection('users').doc(uid).update({
        globalRole: 'admin',
    });

    console.log(`  Updated globalRole: admin`);

    // Also add all projects to their allowedProjects
    const projectsSnap = await db.collection('projects').get();
    const allProjectIds = projectsSnap.docs.map(d => d.id);

    await db.collection('users').doc(uid).update({
        allowedProjects: allProjectIds,
    });

    console.log(`  Assigned to ${allProjectIds.length} projects: ${allProjectIds.join(', ')}`);

    // Add user to each project's teamMembers
    for (const pid of allProjectIds) {
        await db.collection('projects').doc(pid).update({
            teamMembers: FieldValue.arrayUnion(uid),
        });
    }

    console.log(`\nDone! ${email} is now an admin.`);
    console.log('They may need to log out and back in for changes to take effect.');
    process.exit(0);
}

promote().catch((err) => {
    console.error('Failed:', err);
    process.exit(1);
});

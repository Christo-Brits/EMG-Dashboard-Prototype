/**
 * Firestore Seed Script
 *
 * Run once to bootstrap a fresh Firebase project with initial data.
 *
 * Usage:
 *   1. Install firebase-admin: npm install firebase-admin
 *   2. Download a service account key from Firebase Console > Project Settings > Service Accounts
 *   3. Set the path: export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
 *   4. Run: node scripts/seed-firestore.js
 *
 * This script will:
 *   - Create project documents from mock data
 *   - Set up an initial admin user (you must provide the UID)
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
initializeApp();
const db = getFirestore();

// --- Project Data (from mockData.js) ---
const PROJECTS = [
    {
        id: 'south-mall',
        name: 'South Mall New World',
        status: 'In Progress',
        lastUpdated: '2025-12-15',
        location: 'Manurewa, Auckland',
        client: 'Foodstuffs North Island',
        image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=2070',
        summary: 'Main refurbishment of the South Mall New World including new bakery fit-out and seismic strengthening.',
        focus: 'Internal fit-out and bakery flooring.',
        coordination: 'Public access to mall entrance to be maintained at all times.',
        teamMembers: [],
        createdAt: new Date(),
        createdBy: 'seed-script'
    },
    {
        id: 'retail-facilities',
        name: 'Retail Facilities Programme',
        status: 'In Progress',
        lastUpdated: '2025-12-10',
        location: '',
        client: '',
        summary: '',
        focus: '',
        coordination: '',
        teamMembers: [],
        createdAt: new Date(),
        createdBy: 'seed-script'
    },
    {
        id: 'civil-drainage',
        name: 'Civil Drainage Remediation',
        status: 'Planning',
        lastUpdated: '2025-12-01',
        location: '',
        client: '',
        summary: '',
        focus: '',
        coordination: '',
        teamMembers: [],
        createdAt: new Date(),
        createdBy: 'seed-script'
    },
    {
        id: 'planned-maintenance',
        name: 'Planned Maintenance \u2013 Auckland',
        status: 'Ongoing',
        lastUpdated: '2025-12-12',
        location: '',
        client: '',
        summary: '',
        focus: '',
        coordination: '',
        teamMembers: [],
        createdAt: new Date(),
        createdBy: 'seed-script'
    },
    {
        id: 'emergency-works',
        name: 'Emergency Works Programme',
        status: 'On Hold',
        lastUpdated: '2025-11-20',
        location: '',
        client: '',
        summary: '',
        focus: '',
        coordination: '',
        teamMembers: [],
        createdAt: new Date(),
        createdBy: 'seed-script'
    }
];

const DEFAULT_FOLDERS = [
    { id: 'folder-drawings', name: 'Drawings', type: 'folder', items: [] },
    { id: 'folder-rfis', name: 'RFIs & Technical Queries', type: 'folder', items: [] },
    { id: 'folder-reports', name: 'Reports & Inspections', type: 'folder', items: [] },
    { id: 'folder-si', name: 'Site Instructions', type: 'folder', items: [] },
];

async function seed() {
    console.log('Starting Firestore seed...\n');

    // 1. Create project documents
    for (const project of PROJECTS) {
        const { id, ...data } = project;
        const docRef = db.collection('projects').doc(id);
        const existing = await docRef.get();

        if (existing.exists) {
            console.log(`  [SKIP] Project "${id}" already exists`);
        } else {
            await docRef.set(data);
            console.log(`  [CREATE] Project "${id}"`);

            // Initialize default document folders
            await docRef.collection('data').doc('documents').set({ structure: DEFAULT_FOLDERS });
            console.log(`  [CREATE] Default folders for "${id}"`);
        }
    }

    console.log('\n--- Seed complete! ---');
    console.log('\nNext steps:');
    console.log('  1. Set up admin user: In Firebase Console > Firestore > users/{uid},');
    console.log('     set role: "admin" and allowedProjects: ["south-mall", ...]');
    console.log('  2. Or run: node scripts/seed-firestore.js --set-admin <uid>');
}

// Optional: Set a user as admin
const args = process.argv.slice(2);
if (args[0] === '--set-admin' && args[1]) {
    const uid = args[1];
    db.collection('users').doc(uid).update({
        role: 'admin',
        allowedProjects: PROJECTS.map(p => p.id)
    }).then(() => {
        console.log(`Set user ${uid} as admin with access to all projects.`);
        process.exit(0);
    }).catch(err => {
        console.error('Error setting admin:', err);
        process.exit(1);
    });
} else {
    seed().then(() => process.exit(0)).catch(err => {
        console.error('Seed error:', err);
        process.exit(1);
    });
}

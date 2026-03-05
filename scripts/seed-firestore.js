/**
 * Firestore Seed Script
 *
 * Seeds the Firestore database with initial project data and admin user.
 * Run once to bootstrap a fresh Firebase project.
 *
 * Usage:
 *   1. Install firebase-admin: npm install -D firebase-admin
 *   2. Download a service account key from Firebase Console > Project Settings > Service Accounts
 *   3. Set the GOOGLE_APPLICATION_CREDENTIALS env var to the key path
 *   4. Run: node scripts/seed-firestore.js
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize with service account
initializeApp();
const db = getFirestore();

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
        createdBy: 'seed-script',
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
        createdBy: 'seed-script',
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
        createdBy: 'seed-script',
    },
    {
        id: 'planned-maintenance',
        name: 'Planned Maintenance – Auckland',
        status: 'Ongoing',
        lastUpdated: '2025-12-12',
        location: '',
        client: '',
        summary: '',
        focus: '',
        coordination: '',
        teamMembers: [],
        createdAt: new Date(),
        createdBy: 'seed-script',
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
        createdBy: 'seed-script',
    },
];

const DEFAULT_FOLDERS = [
    { id: 'folder-drawings', name: 'Drawings', type: 'folder', items: [] },
    { id: 'folder-rfis', name: 'RFIs & Technical Queries', type: 'folder', items: [] },
    { id: 'folder-reports', name: 'Reports & Inspections', type: 'folder', items: [] },
    { id: 'folder-si', name: 'Site Instructions', type: 'folder', items: [] },
];

async function seed() {
    console.log('Seeding Firestore...\n');

    // Seed projects
    for (const project of PROJECTS) {
        const { id, ...data } = project;
        const ref = db.collection('projects').doc(id);
        const existing = await ref.get();
        if (existing.exists) {
            console.log(`  [SKIP] Project "${id}" already exists`);
        } else {
            await ref.set(data);
            // Initialize document folders
            await ref.collection('data').doc('documents').set({ structure: DEFAULT_FOLDERS });
            console.log(`  [CREATE] Project "${id}"`);
        }
    }

    console.log('\nDone! Projects seeded to Firestore.');
    console.log('\nNote: Set up the initial admin user by manually editing the');
    console.log('users/{uid} document in the Firestore console:');
    console.log('  globalRole: "admin"');
    console.log('  allowedProjects: ["south-mall", "retail-facilities", ...]');
    process.exit(0);
}

seed().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});

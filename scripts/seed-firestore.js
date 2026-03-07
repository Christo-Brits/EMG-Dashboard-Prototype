/**
 * Firestore Seed Script
 *
 * Seeds the Firestore database with initial project data, sample content,
 * and default document folder structure.
 * Run once to bootstrap a fresh Firebase project.
 *
 * Usage:
 *   1. Install firebase-admin: npm install -D firebase-admin
 *   2. Download a service account key from Firebase Console > Project Settings > Service Accounts
 *   3. Set the GOOGLE_APPLICATION_CREDENTIALS env var to the key path
 *   4. Run: node scripts/seed-firestore.js
 *   5. Optional: node scripts/seed-firestore.js --with-sample-data
 */

import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

initializeApp();
const db = getFirestore();

const withSampleData = process.argv.includes('--with-sample-data');

// ---------------------------------------------------------------------------
// Project definitions
// ---------------------------------------------------------------------------

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
    },
    {
        id: 'retail-facilities',
        name: 'Retail Facilities Programme',
        status: 'In Progress',
        lastUpdated: '2025-12-10',
    },
    {
        id: 'civil-drainage',
        name: 'Civil Drainage Remediation',
        status: 'Planning',
        lastUpdated: '2025-12-01',
    },
    {
        id: 'planned-maintenance',
        name: 'Planned Maintenance – Auckland',
        status: 'Ongoing',
        lastUpdated: '2025-12-12',
    },
    {
        id: 'emergency-works',
        name: 'Emergency Works Programme',
        status: 'On Hold',
        lastUpdated: '2025-11-20',
    },
];

const DEFAULT_FOLDERS = [
    { id: 'folder-drawings', name: 'Drawings', type: 'folder', items: [] },
    { id: 'folder-rfis', name: 'RFIs & Technical Queries', type: 'folder', items: [] },
    { id: 'folder-reports', name: 'Reports & Inspections', type: 'folder', items: [] },
    { id: 'folder-si', name: 'Site Instructions', type: 'folder', items: [] },
];

// ---------------------------------------------------------------------------
// Sample data for the south-mall project (only seeded with --with-sample-data)
// ---------------------------------------------------------------------------

const SAMPLE_UPDATES = [
    {
        id: 1,
        date: '2025-12-14',
        author: 'Sarah Jenkins (EMG)',
        content: 'Bakery flooring preparation complete. Epoxy coating scheduled for Tuesday.',
        tag: 'Progress',
        timestamp: 'Sat, Dec 14, 02:30 PM',
        type: 'progress',
    },
    {
        id: 2,
        date: '2025-12-10',
        author: 'Mike Ross (EMG)',
        content: 'Seismic bracing in the main aisle has been signed off by the engineer.',
        tag: 'Compliance',
        timestamp: 'Tue, Dec 10, 10:15 AM',
        type: 'progress',
    },
    {
        id: 3,
        date: '2025-12-08',
        author: 'Sarah Jenkins (EMG)',
        content: 'Hoardings moved to Zone 2. Public access path rerouted safely.',
        tag: 'Safety',
        timestamp: 'Sun, Dec 08, 09:00 AM',
        type: 'progress',
    },
];

const SAMPLE_ACTIONS = [
    {
        id: 1,
        task: 'Approve final electrical layout for Cold Store',
        assignedTo: 'Consultant (Elec)',
        status: 'Open',
        dueDate: '20 Dec 2025',
    },
    {
        id: 2,
        task: 'Submit updated Health & Safety Plan',
        assignedTo: 'Contractor',
        status: 'Closed',
        dueDate: '10 Dec 2025',
    },
    {
        id: 3,
        task: 'Review Zone C variation cost',
        assignedTo: 'EMG',
        status: 'Open',
        dueDate: '18 Dec 2025',
    },
    {
        id: 4,
        task: 'Confirm site access for crane lift',
        assignedTo: 'Contractor',
        status: 'Open',
        dueDate: '16 Dec 2025',
    },
];

const SAMPLE_QA = [
    {
        id: 1,
        title: 'Clarification on Fire Door Specs',
        category: 'RFI',
        status: 'Answered',
        date: '12 Dec 2025',
        context: 'Regarding the fire doors in Corridor 3, are we sticking to the original spec or the alternative submitted last week?',
        replies: [
            {
                author: 'David Chen (Architect)',
                date: '13 Dec 2025',
                content: 'We have approved the alternative spec provided it meets the 60min FRR. Please proceed.',
            },
        ],
    },
    {
        id: 2,
        title: 'Loading Bay Height Restrictions',
        category: 'Access',
        status: 'Open',
        date: '14 Dec 2025',
        context: 'Can we confirm the max clearance for the temporary loading bay? Transport company asking.',
        replies: [],
    },
];

const SAMPLE_DOCUMENTS = [
    {
        id: 'folder-drawings',
        name: 'Drawings',
        type: 'folder',
        items: [
            { id: 'f1-1', name: 'Drawing_A101_RevC.pdf', type: 'PDF', author: 'Consultant (Arch)', date: '10 Dec 2025' },
            { id: 'f1-2', name: 'Drawing_S204_RevB.pdf', type: 'PDF', author: 'Consultant (Struct)', date: '08 Dec 2025' },
            { id: 'f1-3', name: 'Layout_Plan_Ground.dwg', type: 'DWG', author: 'Consultant (Arch)', date: '01 Dec 2025' },
        ],
    },
    {
        id: 'folder-rfis',
        name: 'RFIs & Technical Queries',
        type: 'folder',
        items: [
            { id: 'f2-1', name: 'RFI_012_BakeryFloorLevels.pdf', type: 'PDF', author: 'EMG (Christo)', date: '12 Dec 2025' },
            { id: 'f2-2', name: 'TQ_004_SteelConnection.pdf', type: 'PDF', author: 'Contractor', date: '05 Dec 2025' },
        ],
    },
    {
        id: 'folder-reports',
        name: 'Reports & Inspections',
        type: 'folder',
        items: [
            { id: 'f3-1', name: 'Weekly_Site_Report_2025-12-08.pdf', type: 'PDF', author: 'EMG', date: '08 Dec 2025' },
            { id: 'f3-2', name: 'Safety_Audit_Nov25.pdf', type: 'PDF', author: 'Safety Officer', date: '30 Nov 2025' },
        ],
    },
    {
        id: 'folder-si',
        name: 'Site Instructions',
        type: 'folder',
        items: [
            { id: 'f4-1', name: 'SI_003_PaintSpecChange.pdf', type: 'PDF', author: 'Client', date: '03 Dec 2025' },
        ],
    },
];

// ---------------------------------------------------------------------------
// Seed logic
// ---------------------------------------------------------------------------

async function seedProjects() {
    console.log('Seeding projects...');
    for (const project of PROJECTS) {
        const { id, ...data } = project;
        const ref = db.collection('projects').doc(id);
        const existing = await ref.get();

        if (existing.exists) {
            console.log(`  [SKIP] Project "${id}" already exists`);
            continue;
        }

        await ref.set({
            ...data,
            location: data.location || '',
            client: data.client || '',
            summary: data.summary || '',
            focus: data.focus || '',
            coordination: data.coordination || '',
            teamMembers: [],
            createdAt: FieldValue.serverTimestamp(),
            createdBy: 'seed-script',
        });

        // Initialize default document folder structure
        await ref.collection('data').doc('documents').set({ structure: DEFAULT_FOLDERS });
        console.log(`  [CREATE] Project "${id}"`);
    }
}

async function seedSampleData() {
    const projectId = 'south-mall';
    const projectRef = db.collection('projects').doc(projectId);
    console.log(`\nSeeding sample data for "${projectId}"...`);

    // Updates
    const updatesSnap = await projectRef.collection('updates').limit(1).get();
    if (updatesSnap.empty) {
        for (const update of SAMPLE_UPDATES) {
            await projectRef.collection('updates').add(update);
        }
        console.log(`  [CREATE] ${SAMPLE_UPDATES.length} updates`);
    } else {
        console.log('  [SKIP] Updates already exist');
    }

    // Actions
    const actionsSnap = await projectRef.collection('actions').limit(1).get();
    if (actionsSnap.empty) {
        for (const action of SAMPLE_ACTIONS) {
            await projectRef.collection('actions').add(action);
        }
        console.log(`  [CREATE] ${SAMPLE_ACTIONS.length} actions`);
    } else {
        console.log('  [SKIP] Actions already exist');
    }

    // Q&A
    const qaSnap = await projectRef.collection('qa').limit(1).get();
    if (qaSnap.empty) {
        for (const qa of SAMPLE_QA) {
            await projectRef.collection('qa').add(qa);
        }
        console.log(`  [CREATE] ${SAMPLE_QA.length} Q&A threads`);
    } else {
        console.log('  [SKIP] Q&A already exists');
    }

    // Documents (overwrite default empty folders with sample file entries)
    const docsRef = projectRef.collection('data').doc('documents');
    const docsSnap = await docsRef.get();
    const currentStructure = docsSnap.data()?.structure || [];
    const hasFiles = currentStructure.some(f => f.items?.length > 0);

    if (!hasFiles) {
        await docsRef.set({ structure: SAMPLE_DOCUMENTS });
        console.log(`  [CREATE] Sample document structure with ${SAMPLE_DOCUMENTS.reduce((s, f) => s + f.items.length, 0)} files`);
    } else {
        console.log('  [SKIP] Documents already have files');
    }
}

async function main() {
    console.log('=== EMG Dashboard — Firestore Seed ===\n');

    await seedProjects();

    if (withSampleData) {
        await seedSampleData();
    }

    console.log('\n=== Seed complete ===');
    console.log('\nNext steps:');
    console.log('  1. Sign in to the dashboard with the admin email');
    console.log('  2. Run: node scripts/promote-admin.js <admin-email>');
    console.log('     to grant admin privileges');
    process.exit(0);
}

main().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});

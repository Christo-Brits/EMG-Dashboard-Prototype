export const PROJECTS = [
    {
        id: 'south-mall',
        name: 'South Mall New World',
        status: 'In Progress',
        lastUpdated: '2025-12-15',
        location: 'Manurewa, Auckland',
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
    }
];

export const UPDATES = [
    {
        id: 1,
        projectId: 'south-mall',
        date: '14 Dec 2025',
        author: 'Sarah Jenkins (EMG)',
        content: 'Bakery flooring preparation complete. Epoxy coating scheduled for Tuesday.',
        tag: 'Progress'
    },
    {
        id: 2,
        projectId: 'south-mall',
        date: '10 Dec 2025',
        author: 'Mike Ross (EMG)',
        content: 'Seismic bracing in the main aisle has been signed off by the engineer.',
        tag: 'Compliance'
    },
    {
        id: 3,
        projectId: 'south-mall',
        date: '08 Dec 2025',
        author: 'Sarah Jenkins (EMG)',
        content: 'Hoardings moved to Zone 2. Public access path rerouted safely.',
        tag: 'Safety'
    }
];

export const ACTIONS = [
    {
        id: 1,
        task: 'Approve final electrical layout for Cold Store',
        assignedTo: 'Consultant (Elec)',
        status: 'Open',
        dueDate: '20 Dec 2025'
    },
    {
        id: 2,
        task: 'Submit updated Health & Safety Plan',
        assignedTo: 'Contractor',
        status: 'Closed',
        dueDate: '10 Dec 2025'
    },
    {
        id: 3,
        task: 'Review Zone C variation cost',
        assignedTo: 'EMG',
        status: 'Open',
        dueDate: '18 Dec 2025'
    },
    {
        id: 4,
        task: 'Confirm site access for crane lift',
        assignedTo: 'Contractor',
        status: 'Open',
        dueDate: '16 Dec 2025'
    }
];

export const QA = [
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
                content: 'We have approved the alternative spec provided it meets the 60min FRR. Please proceed.'
            }
        ]
    },
    {
        id: 2,
        title: 'Loading Bay Height Restrictions',
        category: 'Access',
        status: 'Open',
        date: '14 Dec 2025',
        context: 'Can we confirm the max clearance for the temporary loading bay? Transport company asking.',
        replies: []
    }
];

export const DOCUMENTS = [
    {
        id: 'folder-1',
        name: 'Drawings',
        type: 'folder',
        items: [
            { id: 'f1-1', name: 'Drawing_A101_RevC.pdf', type: 'PDF', author: 'Consultant (Arch)', date: '10 Dec 2025' },
            { id: 'f1-2', name: 'Drawing_S204_RevB.pdf', type: 'PDF', author: 'Consultant (Struct)', date: '08 Dec 2025' },
            { id: 'f1-3', name: 'Layout_Plan_Ground.dwg', type: 'DWG', author: 'Consultant (Arch)', date: '01 Dec 2025' },
        ]
    },
    {
        id: 'folder-2',
        name: 'RFIs & Technical Queries',
        type: 'folder',
        items: [
            { id: 'f2-1', name: 'RFI_012_BakeryFloorLevels.pdf', type: 'PDF', author: 'EMG (Christo)', date: '12 Dec 2025' },
            { id: 'f2-2', name: 'TQ_004_SteelConnection.pdf', type: 'PDF', author: 'Contractor', date: '05 Dec 2025' },
        ]
    },
    {
        id: 'folder-3',
        name: 'Reports & Inspections',
        type: 'folder',
        items: [
            { id: 'f3-1', name: 'Weekly_Site_Report_2025-12-08.pdf', type: 'PDF', author: 'EMG', date: '08 Dec 2025' },
            { id: 'f3-2', name: 'Safety_Audit_Nov25.pdf', type: 'PDF', author: 'Safety Officer', date: '30 Nov 2025' },
        ]
    },
    {
        id: 'folder-4',
        name: 'Site Instructions',
        type: 'folder',
        items: [
            { id: 'f4-1', name: 'SI_003_PaintSpecChange.pdf', type: 'PDF', author: 'Client', date: '03 Dec 2025' }
        ]
    }
];

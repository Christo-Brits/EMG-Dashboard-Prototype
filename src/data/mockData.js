export const PROJECTS = [
    {
        id: 'south-mall',
        name: 'New World South Mall',
        status: 'In Progress',
        lastUpdated: '2026-02-28',
        location: 'Manurewa, Auckland',
        image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=2070',
        summary: 'Main refurbishment of the New World South Mall including new bakery fit-out and seismic strengthening.',
        focus: 'Internal fit-out and bakery flooring.',
        coordination: 'Public access to mall entrance to be maintained at all times.',
        active: true,
    },
    {
        id: 'retail-facilities',
        name: 'Retail Facilities Programme',
        status: 'In Progress',
        lastUpdated: '2026-02-20',
        location: 'Various, Auckland',
        summary: 'Multi-site retail facilities upgrade programme across Auckland region.',
        focus: 'Facility assessments and prioritisation.',
        coordination: 'Stakeholder engagement across multiple tenants.',
        active: false,
    },
    {
        id: 'civil-drainage',
        name: 'Civil Drainage Remediation',
        status: 'Planning',
        lastUpdated: '2026-02-10',
        location: 'Papakura, Auckland',
        summary: 'Drainage infrastructure remediation and stormwater management upgrades.',
        focus: 'Design development and consent applications.',
        coordination: 'Council liaison for resource consent.',
        active: false,
    },
    {
        id: 'planned-maintenance',
        name: 'Planned Maintenance – Auckland',
        status: 'Ongoing',
        lastUpdated: '2026-02-25',
        location: 'Auckland Region',
        summary: 'Scheduled preventive maintenance programme for Auckland commercial portfolio.',
        focus: 'Q1 maintenance schedule execution.',
        coordination: 'Tenant access scheduling.',
        active: false,
    },
    {
        id: 'emergency-works',
        name: 'Emergency Works Programme',
        status: 'On Hold',
        lastUpdated: '2026-01-15',
        location: 'Auckland Region',
        summary: 'Reactive emergency works programme for critical building issues.',
        focus: 'Currently on hold pending funding approval.',
        coordination: 'Insurance assessments in progress.',
        active: false,
    }
];

export const UPDATES = [
    {
        id: 1,
        projectId: 'south-mall',
        date: '28 Feb 2026',
        author: 'Sarah Jenkins (EMG)',
        content: 'Bakery flooring preparation complete. Epoxy coating scheduled for Tuesday.',
        tag: 'Progress'
    },
    {
        id: 2,
        projectId: 'south-mall',
        date: '24 Feb 2026',
        author: 'Mike Ross (EMG)',
        content: 'Seismic bracing in the main aisle has been signed off by the engineer.',
        tag: 'Compliance'
    },
    {
        id: 3,
        projectId: 'south-mall',
        date: '20 Feb 2026',
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
        dueDate: '10 Mar 2026'
    },
    {
        id: 2,
        task: 'Submit updated Health & Safety Plan',
        assignedTo: 'Contractor',
        status: 'Closed',
        dueDate: '20 Feb 2026'
    },
    {
        id: 3,
        task: 'Review Zone C variation cost',
        assignedTo: 'EMG',
        status: 'Open',
        dueDate: '05 Mar 2026'
    },
    {
        id: 4,
        task: 'Confirm site access for crane lift',
        assignedTo: 'Contractor',
        status: 'Open',
        dueDate: '03 Mar 2026'
    }
];

export const QA = [
    {
        id: 1,
        title: 'Clarification on Fire Door Specs',
        category: 'RFI',
        status: 'Answered',
        date: '22 Feb 2026',
        context: 'Regarding the fire doors in Corridor 3, are we sticking to the original spec or the alternative submitted last week?',
        replies: [
            {
                author: 'David Chen (Architect)',
                date: '23 Feb 2026',
                content: 'We have approved the alternative spec provided it meets the 60min FRR. Please proceed.'
            }
        ]
    },
    {
        id: 2,
        title: 'Loading Bay Height Restrictions',
        category: 'Access',
        status: 'Open',
        date: '26 Feb 2026',
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
            { id: 'f1-1', name: 'Drawing_A101_RevC.pdf', type: 'PDF', author: 'Consultant (Arch)', date: '20 Feb 2026' },
            { id: 'f1-2', name: 'Drawing_S204_RevB.pdf', type: 'PDF', author: 'Consultant (Struct)', date: '15 Feb 2026' },
            { id: 'f1-3', name: 'Layout_Plan_Ground.dwg', type: 'DWG', author: 'Consultant (Arch)', date: '10 Feb 2026' },
        ]
    },
    {
        id: 'folder-2',
        name: 'RFIs & Technical Queries',
        type: 'folder',
        items: [
            { id: 'f2-1', name: 'RFI_012_BakeryFloorLevels.pdf', type: 'PDF', author: 'EMG (Christo)', date: '22 Feb 2026' },
            { id: 'f2-2', name: 'TQ_004_SteelConnection.pdf', type: 'PDF', author: 'Contractor', date: '05 Feb 2026' },
        ]
    },
    {
        id: 'folder-3',
        name: 'Reports & Inspections',
        type: 'folder',
        items: [
            { id: 'f3-1', name: 'Weekly_Site_Report_2026-02-28.pdf', type: 'PDF', author: 'EMG', date: '28 Feb 2026' },
            { id: 'f3-2', name: 'Safety_Audit_Jan26.pdf', type: 'PDF', author: 'Safety Officer', date: '31 Jan 2026' },
        ]
    },
    {
        id: 'folder-4',
        name: 'Site Instructions',
        type: 'folder',
        items: [
            { id: 'f4-1', name: 'SI_003_PaintSpecChange.pdf', type: 'PDF', author: 'Client', date: '10 Feb 2026' }
        ]
    }
];

export const ROLES = {
    admin: {
        label: 'Administrator',
        permissions: ['read', 'write', 'delete', 'manage_users', 'download_pdf']
    },
    user: {
        label: 'User',
        permissions: ['read', 'download_pdf']
    }
};

export const ACCESS_REQUEST_EMAIL = 'christo@emgroup.co.nz';

/**
 * Utility functions for exporting project data as CSV or printable HTML.
 */

/**
 * Convert an array of objects to a CSV string and trigger download.
 */
export function downloadCSV(data, columns, filename) {
    if (!data || data.length === 0) return;

    const header = columns.map(c => `"${c.label}"`).join(',');
    const rows = data.map(row =>
        columns.map(c => {
            const val = typeof c.accessor === 'function' ? c.accessor(row) : (row[c.accessor] ?? '');
            // Escape double quotes
            return `"${String(val).replace(/"/g, '""')}"`;
        }).join(',')
    );

    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    triggerDownload(blob, filename);
}

/**
 * Open a printable HTML report in a new window (user can Print → Save as PDF).
 */
export function openPrintableReport(title, sections) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${escapeHtml(title)}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', -apple-system, system-ui, sans-serif; color: #0f172a; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.5; }
        h1 { font-size: 20px; margin-bottom: 4px; }
        .subtitle { color: #64748b; font-size: 12px; margin-bottom: 24px; }
        h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin: 24px 0 12px; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 16px; }
        th { text-align: left; font-weight: 600; color: #64748b; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; padding: 6px 8px; border-bottom: 2px solid #e2e8f0; }
        td { padding: 6px 8px; border-bottom: 1px solid #f1f5f9; }
        .text-right { text-align: right; }
        .badge { display: inline-block; font-size: 10px; padding: 1px 8px; border-radius: 10px; font-weight: 500; }
        .badge-green { background: #dcfce7; color: #166534; }
        .badge-yellow { background: #fef3c7; color: #92400e; }
        .badge-red { background: #fee2e2; color: #991b1b; }
        .badge-gray { background: #f1f5f9; color: #475569; }
        .badge-blue { background: #dbeafe; color: #1e40af; }
        .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
        .summary-item { background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0; }
        .summary-label { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
        .summary-value { font-size: 18px; font-weight: 700; }
        .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; text-align: center; }
        p { font-size: 12px; color: #475569; margin-bottom: 8px; }
        @media print { body { padding: 20px; } @page { margin: 1.5cm; } }
    </style>
</head>
<body>
    <h1>${escapeHtml(title)}</h1>
    <div class="subtitle">Generated ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} · EMG Project Portal</div>
    ${sections.map(s => s).join('\n')}
    <div class="footer">Ethyl Merc Group Ltd &nbsp;|&nbsp; ethylmerc.co.nz &nbsp;|&nbsp; 0800 555 360</div>
</body>
</html>`;

    const win = window.open('', '_blank');
    if (win) {
        win.document.write(html);
        win.document.close();
    }
}

// --- Helpers ---

function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// --- Pre-built export functions ---

export function exportActionsCSV(actions, projectName) {
    downloadCSV(actions, [
        { label: 'Task', accessor: 'task' },
        { label: 'Assigned To', accessor: 'assignedTo' },
        { label: 'Status', accessor: 'status' },
        { label: 'Due Date', accessor: 'dueDate' },
    ], `${projectName || 'project'}_actions.csv`);
}

export function exportVariationsCSV(variations, projectName) {
    downloadCSV(variations, [
        { label: '#', accessor: 'number' },
        { label: 'Description', accessor: 'description' },
        { label: 'Value', accessor: 'value' },
        { label: 'Category', accessor: 'category' },
        { label: 'Status', accessor: 'status' },
        { label: 'Raised By', accessor: 'raisedByName' },
    ], `${projectName || 'project'}_variations.csv`);
}

const STATUS_BADGE = {
    approved: 'badge-green', paid: 'badge-green', completed: 'badge-green', Closed: 'badge-green',
    pending: 'badge-yellow', submitted: 'badge-yellow', in_progress: 'badge-blue', Open: 'badge-blue',
    declined: 'badge-red', disputed: 'badge-red', delayed: 'badge-red',
    draft: 'badge-gray', cancelled: 'badge-gray',
};

export function exportProjectSummaryReport(project, { updates = [], actions = [], variations = [], invoices = [], milestones = [], summary = null } = {}) {
    const name = project?.name || 'Project';
    const fmt = (v) => `$${Math.abs(Number(v) || 0).toLocaleString('en-NZ', { minimumFractionDigits: 2 })}`;
    const approvedTotal = variations.filter(v => v.status === 'approved').reduce((s, v) => s + (Number(v.value) || 0), 0);
    const contractVal = summary?.originalContractValue || 0;
    const invoicedTotal = invoices.filter(v => ['submitted', 'approved', 'paid'].includes(v.status)).reduce((s, v) => s + (Number(v.amount) || 0), 0);

    const sections = [];

    // Financial summary
    if (summary) {
        sections.push(`
            <h2>Financial Summary</h2>
            <div class="summary-grid">
                <div class="summary-item"><div class="summary-label">Original Contract</div><div class="summary-value">${fmt(contractVal)}</div></div>
                <div class="summary-item"><div class="summary-label">Approved Variations</div><div class="summary-value">${approvedTotal >= 0 ? '+' : '-'}${fmt(approvedTotal)}</div></div>
                <div class="summary-item"><div class="summary-label">Revised Contract</div><div class="summary-value">${fmt(contractVal + approvedTotal)}</div></div>
                <div class="summary-item"><div class="summary-label">Total Invoiced</div><div class="summary-value">${fmt(invoicedTotal)}</div></div>
            </div>
        `);
    }

    // Milestones
    if (milestones.length > 0) {
        const completedCount = milestones.filter(m => m.status === 'completed').length;
        sections.push(`
            <h2>Milestones (${completedCount}/${milestones.length} complete)</h2>
            <table>
                <tr><th>Milestone</th><th>Target Date</th><th>Status</th></tr>
                ${milestones.map(m => `<tr><td>${escapeHtml(m.title)}</td><td>${m.date || '—'}</td><td><span class="badge ${STATUS_BADGE[m.status] || 'badge-gray'}">${m.status}</span></td></tr>`).join('')}
            </table>
        `);
    }

    // Recent updates
    if (updates.length > 0) {
        sections.push(`
            <h2>Recent Updates</h2>
            ${updates.slice(0, 10).map(u => `<p><strong>${escapeHtml(u.author || '')}</strong> (${u.date || ''}): ${escapeHtml(u.content || u.text || '')}</p>`).join('')}
        `);
    }

    // Actions
    if (actions.length > 0) {
        const open = actions.filter(a => a.status === 'Open');
        sections.push(`
            <h2>Actions (${open.length} open / ${actions.length} total)</h2>
            <table>
                <tr><th>Task</th><th>Assigned To</th><th>Due</th><th>Status</th></tr>
                ${actions.map(a => `<tr><td>${escapeHtml(a.task || a.text || '')}</td><td>${escapeHtml(a.assignedTo || a.assignee || '')}</td><td>${a.dueDate || '—'}</td><td><span class="badge ${STATUS_BADGE[a.status] || 'badge-gray'}">${a.status}</span></td></tr>`).join('')}
            </table>
        `);
    }

    // Variations
    if (variations.length > 0) {
        sections.push(`
            <h2>Variations Register</h2>
            <table>
                <tr><th>#</th><th>Description</th><th class="text-right">Value</th><th>Status</th></tr>
                ${variations.map(v => `<tr><td>${v.number || ''}</td><td>${escapeHtml(v.description)}</td><td class="text-right">${fmt(v.value)}</td><td><span class="badge ${STATUS_BADGE[v.status] || 'badge-gray'}">${v.status}</span></td></tr>`).join('')}
            </table>
        `);
    }

    openPrintableReport(`${name} — Project Summary Report`, sections);
}

import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Edit2, Check, X, FileText, TrendingUp, AlertCircle, ChevronDown, ChevronUp, Trash2, Download, Printer } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProjectData } from '../../context/ProjectContext';
import { useProjectPermissions } from '../../hooks/useProjectPermissions';
import { exportVariationsCSV, exportProjectSummaryReport } from '../../utils/exportHelpers';
import { db } from '../../config/firebase';
import {
    doc,
    collection,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    setDoc,
    serverTimestamp,
} from 'firebase/firestore';

const STATUS_STYLES = {
    draft: 'bg-gray-100 text-gray-600',
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    declined: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-400 line-through',
    submitted: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    disputed: 'bg-red-100 text-red-700',
};

const CATEGORY_LABELS = {
    client_instruction: 'Client Instruction',
    design_change: 'Design Change',
    unforeseen: 'Unforeseen',
    regulatory: 'Regulatory',
    credit: 'Credit',
};

const fmt = (val) => {
    const n = Number(val) || 0;
    const prefix = n < 0 ? '-' : '';
    return `${prefix}$${Math.abs(n).toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const FinancialsTab = () => {
    const { user } = useAuth();
    const { activeProjectId, projects } = useProjectData();
    const { canEditProject, isGlobalAdmin, role } = useProjectPermissions();

    // --- State ---
    const [summary, setSummary] = useState(null);
    const [variations, setVariations] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [editingSummary, setEditingSummary] = useState(false);
    const [summaryForm, setSummaryForm] = useState({ originalContractValue: '', quoteReference: '', quoteDate: '', notes: '' });
    const [showVariationForm, setShowVariationForm] = useState(false);
    const [editingVariation, setEditingVariation] = useState(null);
    const [variationForm, setVariationForm] = useState({ description: '', value: '', category: 'client_instruction', notes: '' });
    const [showInvoiceForm, setShowInvoiceForm] = useState(false);
    const [invoiceForm, setInvoiceForm] = useState({ number: '', description: '', amount: '', status: 'submitted' });
    const [expandedSection, setExpandedSection] = useState({ summary: true, variations: true, invoices: true });

    const canEdit = canEditProject || isGlobalAdmin;
    const canApprove = role === 'stakeholder' || role === 'project_manager' || isGlobalAdmin;

    // --- Firestore subscriptions ---
    useEffect(() => {
        if (!activeProjectId) return;

        const unsubSummary = onSnapshot(
            doc(db, 'projects', activeProjectId, 'financials', 'summary'),
            (snap) => { setSummary(snap.exists() ? snap.data() : null); }
        );

        const unsubVariations = onSnapshot(
            collection(db, 'projects', activeProjectId, 'variations'),
            (snap) => {
                const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                data.sort((a, b) => {
                    const numA = parseInt((a.number || '').replace(/\D/g, '')) || 0;
                    const numB = parseInt((b.number || '').replace(/\D/g, '')) || 0;
                    return numA - numB;
                });
                setVariations(data);
            }
        );

        const unsubInvoices = onSnapshot(
            collection(db, 'projects', activeProjectId, 'invoices'),
            (snap) => {
                const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                data.sort((a, b) => (a.number || '').localeCompare(b.number || ''));
                setInvoices(data);
            }
        );

        return () => { unsubSummary(); unsubVariations(); unsubInvoices(); };
    }, [activeProjectId]);

    // --- Computed values ---
    const contractValue = summary?.originalContractValue || 0;
    const approvedTotal = variations
        .filter(v => v.status === 'approved')
        .reduce((s, v) => s + (Number(v.value) || 0), 0);
    const pendingTotal = variations
        .filter(v => v.status === 'pending')
        .reduce((s, v) => s + (Number(v.value) || 0), 0);
    const revisedContract = contractValue + approvedTotal;
    const revisedInclPending = revisedContract + pendingTotal;
    const invoicedTotal = invoices
        .filter(v => ['submitted', 'approved', 'paid'].includes(v.status))
        .reduce((s, v) => s + (Number(v.amount) || 0), 0);
    const invoicedPercent = revisedContract > 0 ? Math.round((invoicedTotal / revisedContract) * 100) : 0;

    // --- Handlers ---
    const handleSaveSummary = async () => {
        if (!activeProjectId) return;
        await setDoc(doc(db, 'projects', activeProjectId, 'financials', 'summary'), {
            originalContractValue: Number(summaryForm.originalContractValue) || 0,
            currency: 'NZD',
            quoteReference: summaryForm.quoteReference,
            quoteDate: summaryForm.quoteDate,
            notes: summaryForm.notes,
            lastUpdated: serverTimestamp(),
            updatedBy: user?.uid || '',
        });
        setEditingSummary(false);
    };

    const startEditSummary = () => {
        setSummaryForm({
            originalContractValue: summary?.originalContractValue || '',
            quoteReference: summary?.quoteReference || '',
            quoteDate: summary?.quoteDate || '',
            notes: summary?.notes || '',
        });
        setEditingSummary(true);
    };

    const nextVariationNumber = () => {
        const nums = variations.map(v => parseInt((v.number || '').replace(/\D/g, '')) || 0);
        return `V${(Math.max(0, ...nums) + 1)}`;
    };

    const handleSaveVariation = async () => {
        if (!activeProjectId || !variationForm.description.trim()) return;

        if (editingVariation) {
            await updateDoc(doc(db, 'projects', activeProjectId, 'variations', editingVariation), {
                description: variationForm.description,
                value: Number(variationForm.value) || 0,
                category: variationForm.category,
                notes: variationForm.notes,
                updatedAt: serverTimestamp(),
            });
        } else {
            await addDoc(collection(db, 'projects', activeProjectId, 'variations'), {
                number: nextVariationNumber(),
                description: variationForm.description,
                value: Number(variationForm.value) || 0,
                status: 'draft',
                category: variationForm.category,
                notes: variationForm.notes,
                raisedBy: user?.uid || '',
                raisedByName: user?.name || 'Unknown',
                raisedDate: serverTimestamp(),
                approvedBy: null,
                approvedByName: null,
                approvedDate: null,
                approvalNotes: null,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
        }
        setVariationForm({ description: '', value: '', category: 'client_instruction', notes: '' });
        setShowVariationForm(false);
        setEditingVariation(null);
    };

    const handleVariationStatusChange = async (variationId, newStatus) => {
        const updates = { status: newStatus, updatedAt: serverTimestamp() };
        if (newStatus === 'approved') {
            updates.approvedBy = user?.uid || '';
            updates.approvedByName = user?.name || 'Unknown';
            updates.approvedDate = serverTimestamp();
        }
        await updateDoc(doc(db, 'projects', activeProjectId, 'variations', variationId), updates);
    };

    const startEditVariation = (v) => {
        setVariationForm({ description: v.description, value: v.value, category: v.category, notes: v.notes || '' });
        setEditingVariation(v.id);
        setShowVariationForm(true);
    };

    const handleDeleteVariation = async (variationId) => {
        if (!confirm('Delete this variation?')) return;
        await deleteDoc(doc(db, 'projects', activeProjectId, 'variations', variationId));
    };

    const handleSaveInvoice = async () => {
        if (!activeProjectId || !invoiceForm.number.trim()) return;
        await addDoc(collection(db, 'projects', activeProjectId, 'invoices'), {
            number: invoiceForm.number,
            description: invoiceForm.description,
            amount: Number(invoiceForm.amount) || 0,
            status: invoiceForm.status,
            dateSubmitted: serverTimestamp(),
            datePaid: null,
            notes: '',
            createdAt: serverTimestamp(),
        });
        setInvoiceForm({ number: '', description: '', amount: '', status: 'submitted' });
        setShowInvoiceForm(false);
    };

    const handleInvoiceStatusChange = async (invoiceId, newStatus) => {
        const updates = { status: newStatus };
        if (newStatus === 'paid') updates.datePaid = serverTimestamp();
        await updateDoc(doc(db, 'projects', activeProjectId, 'invoices', invoiceId), updates);
    };

    const handleDeleteInvoice = async (invoiceId) => {
        if (!confirm('Delete this invoice?')) return;
        await deleteDoc(doc(db, 'projects', activeProjectId, 'invoices', invoiceId));
    };

    const toggleSection = (section) => setExpandedSection(prev => ({ ...prev, [section]: !prev[section] }));

    // --- Render ---
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-[var(--color-brand-primary)]">Financials</h2>
                <div className="flex gap-2">
                    {variations.length > 0 && (
                        <button onClick={() => exportVariationsCSV(variations, activeProjectId)} className="btn btn-outline text-xs gap-1">
                            <Download size={12} /> Export Variations CSV
                        </button>
                    )}
                    {summary && (
                        <button onClick={() => {
                            const project = projects.find(p => p.id === activeProjectId);
                            exportProjectSummaryReport(project, { variations, invoices, summary });
                        }} className="btn btn-outline text-xs gap-1">
                            <Printer size={12} /> Print Report
                        </button>
                    )}
                </div>
            </div>

            {/* ─── Section A: Contract Summary ─── */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button onClick={() => toggleSection('summary')} className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left">
                    <div className="flex items-center gap-2">
                        <DollarSign size={18} className="text-green-600" />
                        <span className="font-semibold text-sm text-gray-800">Contract Summary</span>
                    </div>
                    {expandedSection.summary ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </button>

                {expandedSection.summary && (
                    <div className="p-5">
                        {editingSummary ? (
                            <div className="space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Original Contract Value ($)</label>
                                        <input type="number" className="w-full border border-gray-200 rounded px-3 py-2 text-sm" value={summaryForm.originalContractValue} onChange={e => setSummaryForm(p => ({ ...p, originalContractValue: e.target.value }))} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Quote Reference</label>
                                        <input className="w-full border border-gray-200 rounded px-3 py-2 text-sm" value={summaryForm.quoteReference} onChange={e => setSummaryForm(p => ({ ...p, quoteReference: e.target.value }))} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Quote Date</label>
                                        <input type="date" className="w-full border border-gray-200 rounded px-3 py-2 text-sm" value={summaryForm.quoteDate} onChange={e => setSummaryForm(p => ({ ...p, quoteDate: e.target.value }))} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
                                    <textarea className="w-full border border-gray-200 rounded px-3 py-2 text-sm" rows={2} value={summaryForm.notes} onChange={e => setSummaryForm(p => ({ ...p, notes: e.target.value }))} />
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={handleSaveSummary} className="btn btn-primary text-xs gap-1"><Check size={14} /> Save</button>
                                    <button onClick={() => setEditingSummary(false)} className="btn btn-outline text-xs gap-1"><X size={14} /> Cancel</button>
                                </div>
                            </div>
                        ) : summary ? (
                            <div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                                    <div>
                                        <span className="block text-xs text-gray-400 uppercase tracking-wide">Original Contract</span>
                                        <span className="text-lg font-bold text-gray-900">{fmt(contractValue)}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs text-gray-400 uppercase tracking-wide">Approved Variations</span>
                                        <span className="text-lg font-bold text-green-700">
                                            {approvedTotal >= 0 ? '+' : ''}{fmt(approvedTotal)}
                                            <span className="text-xs font-normal text-gray-400 ml-1">({variations.filter(v => v.status === 'approved').length})</span>
                                        </span>
                                    </div>
                                    <div>
                                        <span className="block text-xs text-gray-400 uppercase tracking-wide">Pending Variations</span>
                                        <span className="text-lg font-bold text-yellow-700">
                                            {pendingTotal >= 0 ? '+' : ''}{fmt(pendingTotal)}
                                            <span className="text-xs font-normal text-gray-400 ml-1">({variations.filter(v => v.status === 'pending').length})</span>
                                        </span>
                                    </div>
                                    <div>
                                        <span className="block text-xs text-gray-400 uppercase tracking-wide">Revised Contract</span>
                                        <span className="text-lg font-bold text-gray-900">{fmt(revisedContract)}</span>
                                        {pendingTotal !== 0 && (
                                            <span className="block text-xs text-gray-400">(incl. pending: {fmt(revisedInclPending)})</span>
                                        )}
                                    </div>
                                </div>

                                {/* Invoice progress bar */}
                                <div className="mt-2">
                                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                        <span>Invoiced: {fmt(invoicedTotal)}</span>
                                        <span>{invoicedPercent}% of revised contract</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-sky-500 rounded-full transition-all" style={{ width: `${Math.min(invoicedPercent, 100)}%` }} />
                                    </div>
                                </div>

                                {summary.quoteReference && (
                                    <p className="text-xs text-gray-400 mt-3">Ref: {summary.quoteReference}{summary.quoteDate ? ` · ${summary.quoteDate}` : ''}</p>
                                )}
                                {summary.notes && <p className="text-xs text-gray-500 mt-1 italic">{summary.notes}</p>}

                                {canEdit && (
                                    <button onClick={startEditSummary} className="mt-3 text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
                                        <Edit2 size={12} /> Edit
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                <DollarSign size={28} className="mx-auto mb-2 opacity-40" />
                                <p className="text-sm mb-2">No contract summary set up yet</p>
                                {canEdit && (
                                    <button onClick={startEditSummary} className="btn btn-primary text-xs gap-1">
                                        <Plus size={14} /> Set Up Contract Summary
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ─── Section B: Variations Register ─── */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button onClick={() => toggleSection('variations')} className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left">
                    <div className="flex items-center gap-2">
                        <TrendingUp size={18} className="text-blue-600" />
                        <span className="font-semibold text-sm text-gray-800">Variations Register</span>
                        {variations.length > 0 && <span className="text-xs text-gray-400">({variations.length})</span>}
                    </div>
                    {expandedSection.variations ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </button>

                {expandedSection.variations && (
                    <div className="p-5">
                        {/* Add variation form */}
                        {showVariationForm && (
                            <div className="border border-blue-200 bg-blue-50/50 rounded-lg p-4 mb-4 space-y-3">
                                <h4 className="text-sm font-semibold text-gray-700">{editingVariation ? 'Edit Variation' : 'Add Variation'}</h4>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Description *</label>
                                    <textarea className="w-full border border-gray-200 rounded px-3 py-2 text-sm" rows={2} value={variationForm.description} onChange={e => setVariationForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe the variation..." />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Value ($) *</label>
                                        <input type="number" className="w-full border border-gray-200 rounded px-3 py-2 text-sm" value={variationForm.value} onChange={e => setVariationForm(p => ({ ...p, value: e.target.value }))} placeholder="Use negative for credits" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                                        <select className="w-full border border-gray-200 rounded px-3 py-2 text-sm" value={variationForm.category} onChange={e => setVariationForm(p => ({ ...p, category: e.target.value }))}>
                                            {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
                                    <input className="w-full border border-gray-200 rounded px-3 py-2 text-sm" value={variationForm.notes} onChange={e => setVariationForm(p => ({ ...p, notes: e.target.value }))} placeholder="Optional notes" />
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={handleSaveVariation} className="btn btn-primary text-xs gap-1" disabled={!variationForm.description.trim()}>
                                        <Check size={14} /> {editingVariation ? 'Update' : 'Add Variation'}
                                    </button>
                                    <button onClick={() => { setShowVariationForm(false); setEditingVariation(null); }} className="btn btn-outline text-xs gap-1">
                                        <X size={14} /> Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {variations.length === 0 && !showVariationForm ? (
                            <div className="text-center py-8 text-gray-400">
                                <TrendingUp size={28} className="mx-auto mb-2 opacity-40" />
                                <p className="text-sm mb-2">No variations recorded yet</p>
                                {canEdit && (
                                    <button onClick={() => setShowVariationForm(true)} className="btn btn-primary text-xs gap-1">
                                        <Plus size={14} /> Add Variation
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                {/* Variations table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                                                <th className="pb-2 pr-3">#</th>
                                                <th className="pb-2 pr-3">Description</th>
                                                <th className="pb-2 pr-3 text-right">Value</th>
                                                <th className="pb-2 pr-3">Category</th>
                                                <th className="pb-2 pr-3">Status</th>
                                                <th className="pb-2">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {variations.map(v => (
                                                <tr key={v.id} className={v.status === 'cancelled' ? 'opacity-50' : ''}>
                                                    <td className="py-3 pr-3 font-mono text-xs text-gray-400">{v.number}</td>
                                                    <td className="py-3 pr-3">
                                                        <span className="text-gray-800">{v.description}</span>
                                                        {v.raisedByName && <span className="block text-xs text-gray-400">by {v.raisedByName}</span>}
                                                    </td>
                                                    <td className={`py-3 pr-3 text-right font-medium ${Number(v.value) < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                                        {fmt(v.value)}
                                                    </td>
                                                    <td className="py-3 pr-3 text-xs text-gray-500">{CATEGORY_LABELS[v.category] || v.category}</td>
                                                    <td className="py-3 pr-3">
                                                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[v.status] || ''}`}>
                                                            {v.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3">
                                                        <div className="flex gap-1 flex-wrap">
                                                            {v.status === 'draft' && canEdit && (
                                                                <>
                                                                    <button onClick={() => handleVariationStatusChange(v.id, 'pending')} className="text-xs text-blue-600 hover:underline">Submit</button>
                                                                    <button onClick={() => startEditVariation(v)} className="text-xs text-gray-400 hover:underline">Edit</button>
                                                                    <button onClick={() => handleDeleteVariation(v.id)} className="text-xs text-red-400 hover:underline">Delete</button>
                                                                </>
                                                            )}
                                                            {v.status === 'pending' && canApprove && (
                                                                <>
                                                                    <button onClick={() => handleVariationStatusChange(v.id, 'approved')} className="text-xs text-green-600 hover:underline">Approve</button>
                                                                    <button onClick={() => handleVariationStatusChange(v.id, 'declined')} className="text-xs text-red-500 hover:underline">Decline</button>
                                                                </>
                                                            )}
                                                            {v.status === 'pending' && canEdit && (
                                                                <button onClick={() => handleVariationStatusChange(v.id, 'cancelled')} className="text-xs text-gray-400 hover:underline">Cancel</button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Totals */}
                                <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                                    {canEdit && !showVariationForm && (
                                        <button onClick={() => { setVariationForm({ description: '', value: '', category: 'client_instruction', notes: '' }); setEditingVariation(null); setShowVariationForm(true); }} className="btn btn-outline text-xs gap-1">
                                            <Plus size={14} /> Add Variation
                                        </button>
                                    )}
                                    <div className="text-right text-xs text-gray-500 ml-auto space-y-0.5">
                                        <div>Approved: <span className="font-semibold text-green-700">{fmt(approvedTotal)}</span></div>
                                        {pendingTotal !== 0 && <div>Pending: <span className="font-semibold text-yellow-700">{fmt(pendingTotal)}</span></div>}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* ─── Section C: Invoice Tracker ─── */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button onClick={() => toggleSection('invoices')} className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left">
                    <div className="flex items-center gap-2">
                        <FileText size={18} className="text-purple-600" />
                        <span className="font-semibold text-sm text-gray-800">Invoices</span>
                        {invoices.length > 0 && <span className="text-xs text-gray-400">({invoices.length})</span>}
                    </div>
                    {expandedSection.invoices ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </button>

                {expandedSection.invoices && (
                    <div className="p-5">
                        {showInvoiceForm && (
                            <div className="border border-purple-200 bg-purple-50/50 rounded-lg p-4 mb-4 space-y-3">
                                <h4 className="text-sm font-semibold text-gray-700">Add Invoice</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Invoice Number *</label>
                                        <input className="w-full border border-gray-200 rounded px-3 py-2 text-sm" value={invoiceForm.number} onChange={e => setInvoiceForm(p => ({ ...p, number: e.target.value }))} placeholder="INV-2025-0001" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Amount ($) *</label>
                                        <input type="number" className="w-full border border-gray-200 rounded px-3 py-2 text-sm" value={invoiceForm.amount} onChange={e => setInvoiceForm(p => ({ ...p, amount: e.target.value }))} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                                        <select className="w-full border border-gray-200 rounded px-3 py-2 text-sm" value={invoiceForm.status} onChange={e => setInvoiceForm(p => ({ ...p, status: e.target.value }))}>
                                            <option value="draft">Draft</option>
                                            <option value="submitted">Submitted</option>
                                            <option value="approved">Approved</option>
                                            <option value="paid">Paid</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                                    <input className="w-full border border-gray-200 rounded px-3 py-2 text-sm" value={invoiceForm.description} onChange={e => setInvoiceForm(p => ({ ...p, description: e.target.value }))} placeholder="Progress claim #3 — November works" />
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={handleSaveInvoice} className="btn btn-primary text-xs gap-1" disabled={!invoiceForm.number.trim()}>
                                        <Check size={14} /> Add Invoice
                                    </button>
                                    <button onClick={() => setShowInvoiceForm(false)} className="btn btn-outline text-xs gap-1"><X size={14} /> Cancel</button>
                                </div>
                            </div>
                        )}

                        {invoices.length === 0 && !showInvoiceForm ? (
                            <div className="text-center py-8 text-gray-400">
                                <FileText size={28} className="mx-auto mb-2 opacity-40" />
                                <p className="text-sm mb-2">No invoices recorded yet</p>
                                {canEdit && (
                                    <button onClick={() => setShowInvoiceForm(true)} className="btn btn-primary text-xs gap-1">
                                        <Plus size={14} /> Add Invoice
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                                                <th className="pb-2 pr-3">Invoice #</th>
                                                <th className="pb-2 pr-3">Description</th>
                                                <th className="pb-2 pr-3 text-right">Amount</th>
                                                <th className="pb-2 pr-3">Status</th>
                                                <th className="pb-2">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {invoices.map(inv => (
                                                <tr key={inv.id}>
                                                    <td className="py-3 pr-3 font-mono text-xs">{inv.number}</td>
                                                    <td className="py-3 pr-3 text-gray-700">{inv.description || '—'}</td>
                                                    <td className="py-3 pr-3 text-right font-medium text-gray-900">{fmt(inv.amount)}</td>
                                                    <td className="py-3 pr-3">
                                                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[inv.status] || ''}`}>
                                                            {inv.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3">
                                                        <div className="flex gap-1">
                                                            {inv.status === 'submitted' && canApprove && (
                                                                <button onClick={() => handleInvoiceStatusChange(inv.id, 'approved')} className="text-xs text-green-600 hover:underline">Approve</button>
                                                            )}
                                                            {inv.status === 'approved' && canEdit && (
                                                                <button onClick={() => handleInvoiceStatusChange(inv.id, 'paid')} className="text-xs text-green-600 hover:underline">Mark Paid</button>
                                                            )}
                                                            {canEdit && (
                                                                <button onClick={() => handleDeleteInvoice(inv.id)} className="text-xs text-red-400 hover:underline">Delete</button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                                    {canEdit && !showInvoiceForm && (
                                        <button onClick={() => setShowInvoiceForm(true)} className="btn btn-outline text-xs gap-1">
                                            <Plus size={14} /> Add Invoice
                                        </button>
                                    )}
                                    <span className="text-xs text-gray-500 ml-auto">Total invoiced: <span className="font-semibold">{fmt(invoicedTotal)}</span></span>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FinancialsTab;

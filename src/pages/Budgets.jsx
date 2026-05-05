import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { Target, Plus, AlertCircle, CheckCircle2, AlertTriangle, Settings2, Edit2, Trash2, Check } from 'lucide-react';

const input = {
    width: '100%',
    padding: '14px 16px',
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    fontSize: '14px',
    fontFamily: 'inherit',
    color: 'var(--text)',
    outline: 'none',
    transition: 'border-color .2s'
};

export default function Budgets() {
    const categories = useLiveQuery(() => db.categories.where('type').equals('expense').toArray()) || [];
    const budgets = useLiveQuery(() => db.budgets.toArray()) || [];
    const transactions = useLiveQuery(() => db.transactions.where('type').equals('expense').toArray()) || [];

    const [formData, setFormData] = useState({ category: '', limitAmount: '' });
    const [editingId, setEditingId] = useState(null);

    const currentMonth = new Date().toISOString().slice(0, 7);

    const handleSetLimit = async (e) => {
        e.preventDefault();
        if (!formData.category || !formData.limitAmount) return;

        if (editingId) {
            await db.budgets.update(editingId, {
                category: formData.category,
                limitAmount: Number(formData.limitAmount)
            });
            setEditingId(null);
        } else {
            const existing = budgets.find(b => b.category === formData.category && b.month === currentMonth);
            if (existing) {
                await db.budgets.update(existing.id, { limitAmount: Number(formData.limitAmount) });
            } else {
                await db.budgets.add({ category: formData.category, limitAmount: Number(formData.limitAmount), month: currentMonth });
            }
        }
        setFormData({ category: '', limitAmount: '' });
    };

    const handleEdit = (budget) => {
        setEditingId(budget.id);
        setFormData({
            category: budget.category,
            limitAmount: budget.limitAmount
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Hapus limit pengeluaran ini?')) {
            await db.budgets.delete(id);
            if (editingId === id) {
                setEditingId(null);
                setFormData({ category: '', limitAmount: '' });
            }
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({ category: '', limitAmount: '' });
    };

    const budgetProgress = budgets.filter(b => b.month === currentMonth).map(budget => {
        const spent = transactions.filter(tx => tx.category === budget.category && tx.date.startsWith(currentMonth)).reduce((s, t) => s + t.amount, 0);
        const percentage = Math.min((spent / budget.limitAmount) * 100, 100);
        return { ...budget, spent, percentage, isWarning: percentage >= 80 && percentage < 100, isDanger: percentage >= 100 };
    });

    const getBarColor = (bp) => {
        if (bp.isDanger) return { bar: 'var(--red)', glow: 'rgba(239, 68, 68, 0.3)', label: 'var(--red)', Icon: AlertCircle };
        if (bp.isWarning) return { bar: 'var(--orange)', glow: 'rgba(245, 158, 11, 0.3)', label: 'var(--orange)', Icon: AlertTriangle };
        return { bar: 'var(--brand-teal)', glow: 'rgba(13, 148, 136, 0.3)', label: 'var(--muted)', Icon: CheckCircle2 };
    };

    return (
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ padding: 12, background: 'rgba(13, 148, 136, 0.1)', borderRadius: 16 }}>
                    <Target size={28} color="var(--brand-teal)" />
                </div>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.5px' }}>
                        Limit Bulanan
                    </h1>
                    <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>Kontrol batas pengeluaran Anda bulan ini</p>
                </div>
            </div>

            <div style={{
                background: 'linear-gradient(135deg, var(--brand-dark) 0%, var(--brand-teal) 100%)',
                borderRadius: 'var(--radius-lg)',
                padding: '28px 32px',
                boxShadow: '0 8px 32px rgba(13, 148, 136, 0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                position: 'relative', overflow: 'hidden',
            }}>
                <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.1 }}>
                    <Target size={150} />
                </div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 600, color: 'white', marginBottom: 6 }}>
                        Status Pengawasan
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
                        {budgetProgress.length} Limit Aktif • {budgetProgress.filter(b => b.isDanger).length} Melewati Batas
                    </p>
                </div>
                <Settings2 size={40} color="rgba(255,255,255,0.4)" style={{ position: 'relative', zIndex: 1 }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>

                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 28, boxShadow: 'var(--shadow)', alignSelf: 'start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                        {editingId ? <Edit2 size={20} color="var(--brand-teal)" /> : <Plus size={20} color="var(--brand-teal)" />}
                        <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>
                            {editingId ? 'Edit Limit Pengeluaran' : 'Atur Limit Baru'}
                        </h3>
                    </div>
                    <form onSubmit={handleSetLimit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kategori</label>
                            <select style={input} value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} onFocus={(e) => e.target.style.borderColor = 'var(--brand-teal)'} onBlur={(e) => e.target.style.borderColor = 'var(--border)'}>
                                <option value="">Choose Category</option>
                                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Batas Maksimal (Rp)</label>
                            <input style={input} type="number" placeholder="0" value={formData.limitAmount} onChange={e => setFormData({ ...formData, limitAmount: e.target.value })} onFocus={(e) => e.target.style.borderColor = 'var(--brand-teal)'} onBlur={(e) => e.target.style.borderColor = 'var(--border)'} />
                        </div>

                        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                            <button type="submit" style={{
                                flex: 1, padding: '16px', background: 'linear-gradient(135deg, var(--brand-teal), var(--brand-dark))',
                                border: 'none', borderRadius: 12, color: 'white', fontWeight: 600, fontSize: 15,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                boxShadow: '0 4px 16px rgba(13, 148, 136, 0.25)', transition: 'all 0.2s'
                            }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(13, 148, 136, 0.35)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(13, 148, 136, 0.25)'; }}
                            >
                                {editingId ? <Check size={20} /> : <Plus size={20} />}
                                {editingId ? 'Simpan' : 'Tambah'}
                            </button>
                            {editingId && (
                                <button type="button" onClick={cancelEdit} style={{
                                    padding: '16px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12,
                                    color: 'var(--text)', fontWeight: 600, fontSize: 15, cursor: 'pointer'
                                }}>Batal</button>
                            )}
                        </div>
                    </form>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {budgetProgress.length === 0 ? (
                        <div style={{ background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-lg)', padding: 48, textAlign: 'center', color: 'var(--muted)' }}>
                            <Target size={40} opacity={0.3} style={{ margin: '0 auto 12px' }} />
                            <p style={{ fontWeight: 500, fontSize: 14 }}>Belum ada aturan limit aktif.</p>
                        </div>
                    ) : (
                        budgetProgress.map((bp, i) => {
                            const c = getBarColor(bp);
                            return (
                                <div key={i} style={{
                                    position: 'relative',
                                    background: 'var(--surface)',
                                    border: `1px solid ${bp.isDanger ? 'rgba(239, 68, 68, 0.3)' : bp.isWarning ? 'rgba(245, 158, 11, 0.3)' : 'var(--border)'}`,
                                    borderRadius: 'var(--radius-lg)',
                                    padding: '24px',
                                    boxShadow: 'var(--shadow)',
                                }}>

                                    <div style={{ position: 'absolute', right: 16, top: 16, display: 'flex', gap: 6 }}>
                                        <button onClick={() => handleEdit(bp)} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Edit2 size={14} />
                                        </button>
                                        <button onClick={() => handleDelete(bp.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, paddingRight: 60 }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <c.Icon size={18} color={c.bar} />
                                                <h4 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>{bp.category}</h4>
                                            </div>
                                            <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>
                                                Terpakai: <strong style={{ color: 'var(--text)', fontWeight: 600 }}>Rp {bp.spent.toLocaleString('id-ID')}</strong>
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
                                        <p style={{ fontSize: 13, fontWeight: 600, color: c.label }}>
                                            {bp.percentage.toFixed(1)}% Kapasitas Terpakai
                                        </p>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Batas</p>
                                            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Rp {bp.limitAmount.toLocaleString('id-ID')}</p>
                                        </div>
                                    </div>

                                    <div style={{ width: '100%', height: 8, background: 'var(--bg)', borderRadius: 99, overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${bp.percentage}%`,
                                            borderRadius: 99,
                                            background: c.bar,
                                            boxShadow: `0 0 12px ${c.glow}`,
                                            transition: 'width 1s cubic-bezier(.4,0,.2,1)',
                                        }} />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { Trophy, Plus, Edit2, Trash2, Check, ArrowUpCircle, X, Wallet } from 'lucide-react';

const inputStyle = {
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

export default function Goals() {
    const goals = useLiveQuery(() => db.goals.toArray()) || [];
    const wallets = useLiveQuery(() => db.wallets.toArray()) || [];
    const transactions = useLiveQuery(() => db.transactions.toArray()) || [];

    const [formData, setFormData] = useState({ name: '', targetAmount: '', deadline: '' });
    const [editingId, setEditingId] = useState(null);

    // State untuk Modal Top Up
    const [topUpModal, setTopUpModal] = useState({ isOpen: false, goal: null, amount: '', walletId: '' });

    // Kalkulasi saldo dompet secara dinamis
    const walletBalances = wallets.map(w => {
        const txs = transactions.filter(t => t.walletId === w.id);
        const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        return { ...w, currentBalance: w.initialBalance + income - expense };
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.targetAmount) return;

        if (editingId) {
            await db.goals.update(editingId, {
                name: formData.name,
                targetAmount: Number(formData.targetAmount),
                deadline: formData.deadline
            });
            setEditingId(null);
        } else {
            await db.goals.add({
                name: formData.name,
                targetAmount: Number(formData.targetAmount),
                savedAmount: 0,
                deadline: formData.deadline
            });
        }
        setFormData({ name: '', targetAmount: '', deadline: '' });
    };

    const handleEdit = (goal) => {
        setEditingId(goal.id);
        setFormData({ name: goal.name, targetAmount: goal.targetAmount, deadline: goal.deadline });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Hapus target tabungan ini?')) {
            await db.goals.delete(id);
            if (editingId === id) cancelEdit();
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({ name: '', targetAmount: '', deadline: '' });
    };

    // Fungsi untuk membuka Modal Top Up
    const handleOpenTopUp = (goal) => {
        setTopUpModal({ isOpen: true, goal: goal, amount: '', walletId: '' });
    };

    // Fungsi Submit Modal Top Up
    const handleSubmitTopUp = async (e) => {
        e.preventDefault();
        if (!topUpModal.amount || !topUpModal.walletId || !topUpModal.goal) return;

        const amount = Number(topUpModal.amount);
        const selectedWallet = walletBalances.find(w => w.id === Number(topUpModal.walletId));

        if (!selectedWallet) return alert('Mohon pilih dompet yang valid.');

        // Cek kecukupan saldo dompet
        if (amount > selectedWallet.currentBalance) {
            return alert(`Transaksi Gagal! Saldo ${selectedWallet.name} tidak mencukupi. (Sisa: Rp ${selectedWallet.currentBalance.toLocaleString('id-ID')})`);
        }

        // 1. Update jumlah tabungan di Goal
        const newSaved = Math.min(topUpModal.goal.savedAmount + amount, topUpModal.goal.targetAmount);
        await db.goals.update(topUpModal.goal.id, { savedAmount: newSaved });

        // 2. Catat sebagai pengeluaran di Riwayat Transaksi
        await db.transactions.add({
            type: 'expense',
            category: 'Tabungan', // Otomatis masuk ke kategori Tabungan
            amount: amount,
            note: `Top Up Target: ${topUpModal.goal.name}`,
            date: new Date().toISOString().split('T')[0],
            walletId: Number(topUpModal.walletId),
            createdAt: new Date().toISOString(),
        });

        setTopUpModal({ isOpen: false, goal: null, amount: '', walletId: '' });
    };

    return (
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>

            {/* Modal Pop-up Top Up Tabungan */}
            {topUpModal.isOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-lg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', borderBottom: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <ArrowUpCircle size={20} color="var(--brand-teal)" />
                                <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>Top Up Tabungan</h3>
                            </div>
                            <button onClick={() => setTopUpModal({ isOpen: false, goal: null, amount: '', walletId: '' })} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmitTopUp} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ padding: '14px 16px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: 4 }}>
                                <p style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Target Anda:</p>
                                <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--brand-teal)' }}>{topUpModal.goal?.name}</p>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Sumber Dana (Dompet)
                                </label>
                                <select style={inputStyle} value={topUpModal.walletId} onChange={e => setTopUpModal({ ...topUpModal, walletId: e.target.value })} required onFocus={(e) => e.target.style.borderColor = 'var(--brand-teal)'} onBlur={(e) => e.target.style.borderColor = 'var(--border)'}>
                                    <option value="">-- Pilih Dompet --</option>
                                    {walletBalances.map(w => (
                                        <option key={w.id} value={w.id}>
                                            {w.name} (Sisa: Rp {w.currentBalance.toLocaleString('id-ID')})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nominal Top Up (Rp)</label>
                                <input style={{ ...inputStyle, padding: '14px 16px', fontSize: '16px', fontWeight: 600 }} type="number" placeholder="0" min="1" required value={topUpModal.amount} onChange={e => setTopUpModal({ ...topUpModal, amount: e.target.value })} onFocus={(e) => e.target.style.borderColor = 'var(--brand-teal)'} onBlur={(e) => e.target.style.borderColor = 'var(--border)'} />
                            </div>

                            <button type="submit" style={{ marginTop: 12, width: '100%', padding: '16px', background: 'linear-gradient(135deg, var(--brand-teal), var(--brand-dark))', border: 'none', borderRadius: '12px', color: 'white', fontWeight: 600, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 16px rgba(13, 148, 136, 0.25)' }}>
                                <ArrowUpCircle size={18} /> Konfirmasi Top Up
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ padding: 12, background: 'rgba(13, 148, 136, 0.1)', borderRadius: 16 }}>
                    <Trophy size={28} color="var(--brand-teal)" />
                </div>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.5px' }}>
                        Target Tabungan
                    </h1>
                    <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>Wujudkan impian finansial Anda secara bertahap</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
                {/* Form Section */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 28, boxShadow: 'var(--shadow)', alignSelf: 'start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                        {editingId ? <Edit2 size={20} color="var(--brand-teal)" /> : <Plus size={20} color="var(--brand-teal)" />}
                        <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>
                            {editingId ? 'Edit Target' : 'Buat Target Baru'}
                        </h3>
                    </div>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nama Impian</label>
                            <input style={inputStyle} type="text" placeholder="Cth: Beli Mobil, Dana Darurat" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required onFocus={(e) => e.target.style.borderColor = 'var(--brand-teal)'} onBlur={(e) => e.target.style.borderColor = 'var(--border)'} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target Nominal (Rp)</label>
                            <input style={inputStyle} type="number" placeholder="0" value={formData.targetAmount} onChange={e => setFormData({ ...formData, targetAmount: e.target.value })} required onFocus={(e) => e.target.style.borderColor = 'var(--brand-teal)'} onBlur={(e) => e.target.style.borderColor = 'var(--border)'} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tenggat Waktu</label>
                            <input style={inputStyle} type="date" value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })} required onFocus={(e) => e.target.style.borderColor = 'var(--brand-teal)'} onBlur={(e) => e.target.style.borderColor = 'var(--border)'} />
                        </div>

                        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                            <button type="submit" style={{ flex: 1, padding: '16px', background: 'linear-gradient(135deg, var(--brand-teal), var(--brand-dark))', border: 'none', borderRadius: 12, color: 'white', fontWeight: 600, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 16px rgba(13, 148, 136, 0.25)', transition: 'all 0.2s' }}>
                                {editingId ? <Check size={20} /> : <Plus size={20} />} {editingId ? 'Simpan' : 'Buat Target'}
                            </button>
                            {editingId && (
                                <button type="button" onClick={cancelEdit} style={{ padding: '16px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text)', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Batal</button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Goals List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {goals.length === 0 ? (
                        <div style={{ background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-lg)', padding: 48, textAlign: 'center', color: 'var(--muted)' }}>
                            <Trophy size={40} opacity={0.3} style={{ margin: '0 auto 12px' }} />
                            <p style={{ fontWeight: 500, fontSize: 14 }}>Belum ada target tabungan.</p>
                        </div>
                    ) : (
                        goals.map((g) => {
                            const percentage = Math.min((g.savedAmount / g.targetAmount) * 100, 100);
                            const isCompleted = percentage >= 100;

                            return (
                                <div key={g.id} style={{ position: 'relative', background: 'var(--surface)', border: `1px solid ${isCompleted ? 'rgba(13, 148, 136, 0.5)' : 'var(--border)'}`, borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow)' }}>
                                    <div style={{ position: 'absolute', right: 16, top: 16, display: 'flex', gap: 6 }}>
                                        <button onClick={() => handleEdit(g)} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Edit2 size={14} />
                                        </button>
                                        <button onClick={() => handleDelete(g.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>

                                    <div style={{ marginBottom: 20, paddingRight: 60 }}>
                                        <h4 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{g.name}</h4>
                                        <p style={{ fontSize: 12, color: 'var(--muted)' }}>Tenggat: {g.deadline}</p>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
                                        <div>
                                            <p style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Terkumpul</p>
                                            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--brand-teal)' }}>Rp {g.savedAmount.toLocaleString('id-ID')}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Target</p>
                                            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Rp {g.targetAmount.toLocaleString('id-ID')}</p>
                                        </div>
                                    </div>

                                    <div style={{ width: '100%', height: 8, background: 'var(--bg)', borderRadius: 99, overflow: 'hidden', marginBottom: 16 }}>
                                        <div style={{ height: '100%', width: `${percentage}%`, borderRadius: 99, background: 'var(--brand-teal)', boxShadow: '0 0 12px rgba(13, 148, 136, 0.4)', transition: 'width 1s cubic-bezier(.4,0,.2,1)' }} />
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <p style={{ fontSize: 13, fontWeight: 600, color: isCompleted ? 'var(--brand-teal)' : 'var(--muted)' }}>
                                            {percentage.toFixed(1)}% {isCompleted && 'Tercapai!'}
                                        </p>
                                        {!isCompleted && (
                                            <button onClick={() => handleOpenTopUp(g)} style={{ background: 'rgba(13, 148, 136, 0.1)', border: '1px solid rgba(13, 148, 136, 0.2)', padding: '8px 14px', borderRadius: 8, color: 'var(--brand-teal)', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(13, 148, 136, 0.2)' }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(13, 148, 136, 0.1)' }}>
                                                <ArrowUpCircle size={16} /> Top Up
                                            </button>
                                        )}
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
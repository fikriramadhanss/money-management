import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { Wallet, Landmark, Smartphone, Plus, CreditCard, Banknote, Edit2, Trash2, Check } from 'lucide-react';

const ICONS = {
    wallet: <Wallet size={24} />,
    landmark: <Landmark size={24} />,
    smartphone: <Smartphone size={24} />,
    card: <CreditCard size={24} />,
    cash: <Banknote size={24} />,
};

const CARD_STYLES = {
    teal: { bg: 'linear-gradient(135deg, #0f766e 0%, #064e3b 100%)', shadow: 'rgba(13, 148, 136, 0.25)' },
    blue: { bg: 'linear-gradient(135deg, #1e3a8a 0%, #172554 100%)', shadow: 'rgba(30, 58, 138, 0.25)' },
    green: { bg: 'linear-gradient(135deg, #4d7c0f 0%, #14532d 100%)', shadow: 'rgba(77, 124, 15, 0.25)' },
    slate: { bg: 'linear-gradient(135deg, #334155 0%, #0f172a 100%)', shadow: 'rgba(51, 65, 85, 0.25)' },
    purple: { bg: 'linear-gradient(135deg, #581c87 0%, #312e81 100%)', shadow: 'rgba(88, 28, 135, 0.25)' },
};

const input = {
    width: '100%',
    padding: '12px 16px',
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    fontSize: 14,
    fontFamily: 'inherit',
    color: 'var(--text)',
    outline: 'none',
    transition: 'border-color .2s'
};

export default function Wallets() {
    const wallets = useLiveQuery(() => db.wallets.toArray()) || [];
    const transactions = useLiveQuery(() => db.transactions.toArray()) || [];

    const [formData, setFormData] = useState({ name: '', initialBalance: '', color: 'blue', icon: 'card' });
    const [editingId, setEditingId] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name) return;

        if (editingId) {
            await db.wallets.update(editingId, { ...formData, initialBalance: Number(formData.initialBalance || 0) });
            setEditingId(null);
        } else {
            await db.wallets.add({ ...formData, initialBalance: Number(formData.initialBalance || 0) });
        }

        setFormData({ name: '', initialBalance: '', color: 'blue', icon: 'card' });
    };

    const handleEdit = (wallet) => {
        setEditingId(wallet.id);
        setFormData({
            name: wallet.name,
            initialBalance: wallet.initialBalance,
            color: wallet.color,
            icon: wallet.icon
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Hapus dompet ini? Transaksi yang terhubung mungkin kehilangan referensi dompetnya.')) {
            await db.wallets.delete(id);
            if (editingId === id) {
                setEditingId(null);
                setFormData({ name: '', initialBalance: '', color: 'blue', icon: 'card' });
            }
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({ name: '', initialBalance: '', color: 'blue', icon: 'card' });
    };

    const walletBalances = wallets.map(w => {
        const txs = transactions.filter(t => t.walletId === w.id);
        const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        return { ...w, currentBalance: w.initialBalance + income - expense };
    });

    const totalAssets = walletBalances.reduce((s, w) => s + w.currentBalance, 0);

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ padding: 12, background: 'rgba(13, 148, 136, 0.1)', borderRadius: 16 }}>
                    <CreditCard size={28} color="var(--brand-teal)" />
                </div>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.5px' }}>
                        Manajemen Dompet
                    </h1>
                    <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>Kelola sumber pendanaan dan rekening Anda</p>
                </div>
            </div>

            <div style={{
                background: 'linear-gradient(135deg, var(--brand-dark) 0%, var(--brand-teal) 50%, var(--brand-green) 100%)',
                borderRadius: 'var(--radius-lg)',
                padding: '36px 40px',
                boxShadow: '0 8px 32px rgba(13, 148, 136, 0.3)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
            }}>
                <div style={{ position: 'absolute', left: -40, top: -40, opacity: 0.05 }}><Wallet size={200} /></div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Total Aset Keseluruhan</p>
                    <h2 style={{ fontSize: 44, fontWeight: 700, color: 'white', letterSpacing: '-1px' }}>
                        Rp {totalAssets.toLocaleString('id-ID')}
                    </h2>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 28, boxShadow: 'var(--shadow)', alignSelf: 'start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                        {editingId ? <Edit2 size={20} color="var(--brand-teal)" /> : <Plus size={20} color="var(--brand-teal)" />}
                        <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>
                            {editingId ? 'Edit Rekening / Dompet' : 'Tambah Rekening / Dompet'}
                        </h3>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nama Akun</label>
                            <input style={input} type="text" placeholder="Cth: BCA Utama" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required onFocus={(e) => e.target.style.borderColor = 'var(--brand-teal)'} onBlur={(e) => e.target.style.borderColor = 'var(--border)'} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Saldo Awal (Rp)</label>
                            <input style={input} type="number" placeholder="0" value={formData.initialBalance} onChange={e => setFormData({ ...formData, initialBalance: e.target.value })} onFocus={(e) => e.target.style.borderColor = 'var(--brand-teal)'} onBlur={(e) => e.target.style.borderColor = 'var(--border)'} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tema</label>
                                <select style={input} value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })}>
                                    <option value="blue">Blue Navy</option>
                                    <option value="teal">Teal Cyan</option>
                                    <option value="green">Forest Green</option>
                                    <option value="purple">Deep Purple</option>
                                    <option value="slate">Dark Slate</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ikon</label>
                                <select style={input} value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })}>
                                    <option value="card">Kartu</option>
                                    <option value="landmark">Bank</option>
                                    <option value="wallet">Dompet</option>
                                    <option value="smartphone">E-Wallet</option>
                                    <option value="cash">Uang Tunai</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                            <button type="submit" style={{
                                flex: 1, padding: '16px', background: 'linear-gradient(135deg, var(--brand-teal), var(--brand-dark))',
                                border: 'none', borderRadius: 12, color: 'white', fontWeight: 600, fontSize: 15,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                boxShadow: '0 4px 16px rgba(13, 148, 136, 0.25)', transition: 'all 0.2s'
                            }}>
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

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20, alignContent: 'start' }}>
                    {walletBalances.length === 0 ? (
                        <div style={{ gridColumn: '1/-1', padding: 48, textAlign: 'center', color: 'var(--muted)', background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-lg)' }}>
                            <Wallet size={40} opacity={0.3} style={{ margin: '0 auto 12px' }} />
                            <p style={{ fontWeight: 500 }}>Belum ada dompet terdaftar.</p>
                        </div>
                    ) : (
                        walletBalances.map(w => {
                            const style = CARD_STYLES[w.color] || CARD_STYLES.blue;
                            return (
                                <div key={w.id} style={{
                                    background: style.bg,
                                    borderRadius: 'var(--radius-lg)',
                                    padding: '24px',
                                    height: 180,
                                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                                    position: 'relative', overflow: 'hidden',
                                    boxShadow: `0 8px 24px ${style.shadow}`,
                                    transition: 'transform .3s ease',
                                    border: '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    <div style={{ position: 'absolute', right: 12, top: 12, display: 'flex', gap: 6, zIndex: 10 }}>
                                        <button onClick={() => handleEdit(w)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Edit2 size={14} />
                                        </button>
                                        <button onClick={() => handleDelete(w.id)} style={{ background: 'rgba(239, 68, 68, 0.8)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>

                                    <div style={{ position: 'absolute', right: -20, bottom: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                                    <div style={{ position: 'absolute', right: 30, top: -30, width: 80, height: 80, borderRadius: '50%', background: 'rgba(0,0,0,0.15)' }} />

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1, marginTop: 8 }}>
                                        <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 10, backdropFilter: 'blur(10px)' }}>
                                            {React.cloneElement(ICONS[w.icon] || ICONS.card, { color: 'white', size: 22 })}
                                        </div>
                                    </div>

                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{w.name}</span>
                                        <h3 style={{ fontSize: 24, fontWeight: 700, color: 'white', letterSpacing: '-0.5px', marginTop: 4 }}>
                                            Rp {w.currentBalance.toLocaleString('id-ID')}
                                        </h3>
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
import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { Trash2, Plus, ArrowDownRight, ArrowUpRight, Receipt, ListFilter, Search } from 'lucide-react';

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
    transition: 'border-color .2s',
};

export default function Transactions() {
    const transactions = useLiveQuery(() => db.transactions.orderBy('date').reverse().toArray()) || [];
    const categories = useLiveQuery(() => db.categories.toArray()) || [];
    const wallets = useLiveQuery(() => db.wallets.toArray()) || [];

    const [localSearch, setLocalSearch] = useState('');
    const [formData, setFormData] = useState({
        type: 'expense',
        category: '',
        amount: '',
        note: '',
        date: new Date().toISOString().split('T')[0],
        walletId: ''
    });

    const filteredTransactions = transactions.filter(tx => {
        if (!localSearch) return true;
        const lowerQuery = localSearch.toLowerCase();
        return (
            (tx.note?.toLowerCase() || '').includes(lowerQuery) ||
            (tx.category?.toLowerCase() || '').includes(lowerQuery) ||
            (tx.amount?.toString() || '').includes(lowerQuery)
        );
    });

    const selectedWallet = wallets.find(w => w.id === Number(formData.walletId));
    let selectedWalletBalance = 0;

    if (selectedWallet) {
        const txs = transactions.filter(t => t.walletId === selectedWallet.id);
        const inc = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const exp = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        selectedWalletBalance = selectedWallet.initialBalance + inc - exp;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.category || !formData.amount || !formData.walletId) {
            return alert('Mohon lengkapi Kategori, Jumlah, dan Sumber Dana!');
        }

        if (formData.type === 'expense' && Number(formData.amount) > selectedWalletBalance) {
            return alert(`Transaksi Gagal! Saldo ${selectedWallet.name} tidak mencukupi. (Sisa: Rp ${selectedWalletBalance.toLocaleString('id-ID')})`);
        }

        await db.transactions.add({
            type: formData.type,
            category: formData.category,
            amount: Number(formData.amount),
            note: formData.note,
            date: formData.date,
            walletId: Number(formData.walletId),
            createdAt: new Date().toISOString(),
        });

        setFormData({ ...formData, amount: '', note: '' });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Hapus transaksi ini? Saldo dompet akan disesuaikan kembali.')) {
            await db.transactions.delete(id);
        }
    };

    const filteredCats = categories.filter(c => c.type === formData.type);

    const TypeBtn = ({ val, label, Icon }) => (
        <button
            type="button"
            onClick={() => setFormData({ ...formData, type: val, category: '' })}
            style={{
                flex: 1, padding: '12px 0', borderRadius: '12px', border: '1px solid',
                borderColor: formData.type === val ? (val === 'income' ? 'var(--brand-green)' : 'var(--red)') : 'var(--border)',
                background: formData.type === val ? (val === 'income' ? 'rgba(132, 204, 22, 0.1)' : 'rgba(239, 68, 68, 0.1)') : 'var(--bg)',
                color: formData.type === val ? (val === 'income' ? 'var(--brand-green)' : 'var(--red)') : 'var(--muted)',
                fontFamily: 'inherit', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                transition: 'all .2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}
        >
            <Icon size={18} /> {label}
        </button>
    );

    return (
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ padding: 12, background: 'rgba(13, 148, 136, 0.1)', borderRadius: 16 }}>
                    <Receipt size={28} color="var(--brand-teal)" />
                </div>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.5px' }}>
                        Manajemen Transaksi
                    </h1>
                    <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>Catat setiap arus kas dengan detail</p>
                </div>
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 32, boxShadow: 'var(--shadow)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                    <Plus size={20} color="var(--brand-teal)" />
                    <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>Tambah Transaksi</h3>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                        <TypeBtn val="expense" label="Pengeluaran" Icon={ArrowDownRight} />
                        <TypeBtn val="income" label="Pemasukan" Icon={ArrowUpRight} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 20 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Sumber Dana
                                {selectedWallet && (
                                    <span style={{ color: formData.type === 'expense' ? 'var(--red)' : 'var(--brand-teal)', fontWeight: 700, marginLeft: 6 }}>
                                        (Sisa: Rp {selectedWalletBalance.toLocaleString('id-ID')})
                                    </span>
                                )}
                            </label>
                            <select style={inputStyle} value={formData.walletId} onChange={e => setFormData({ ...formData, walletId: e.target.value })} onFocus={(e) => e.target.style.borderColor = 'var(--brand-teal)'} onBlur={(e) => e.target.style.borderColor = 'var(--border)'}>
                                <option value="">-- Pilih Dompet --</option>
                                {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kategori</label>
                            <select style={inputStyle} value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} onFocus={(e) => e.target.style.borderColor = 'var(--brand-teal)'} onBlur={(e) => e.target.style.borderColor = 'var(--border)'}>
                                <option value="">-- Pilih Kategori --</option>
                                {filteredCats.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Jumlah (Rp)</label>
                            <input style={inputStyle} type="number" placeholder="0" min="0" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} onFocus={(e) => e.target.style.borderColor = 'var(--brand-teal)'} onBlur={(e) => e.target.style.borderColor = 'var(--border)'} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 24 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tanggal</label>
                            <input style={inputStyle} type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} onFocus={(e) => e.target.style.borderColor = 'var(--brand-teal)'} onBlur={(e) => e.target.style.borderColor = 'var(--border)'} />
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Catatan (Opsional)</label>
                            <input style={inputStyle} type="text" placeholder="Contoh: Beli bensin, Makan siang..." value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })} onFocus={(e) => e.target.style.borderColor = 'var(--brand-teal)'} onBlur={(e) => e.target.style.borderColor = 'var(--border)'} />
                        </div>
                    </div>

                    <button type="submit" style={{
                        width: '100%', padding: '16px', background: 'linear-gradient(135deg, var(--brand-teal), var(--brand-dark))',
                        border: 'none', borderRadius: '12px', color: 'white', fontWeight: 600, fontSize: 16, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 4px 16px rgba(13, 148, 136, 0.25)',
                        transition: 'transform .2s, box-shadow .2s',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(13, 148, 136, 0.35)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(13, 148, 136, 0.25)'; }}
                    >
                        <Plus size={20} /> Simpan Transaksi
                    </button>
                </form>
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
                <div style={{ padding: '20px 32px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <ListFilter size={22} color="var(--muted)" />
                        <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>Riwayat</h3>
                    </div>

                    <div style={{ flex: 1, minWidth: 200, position: 'relative', marginLeft: 'auto' }}>
                        <Search size={16} color="var(--muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Filter riwayat..."
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                            style={{ width: '100%', padding: '10px 12px 10px 36px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13px', color: 'var(--text)', outline: 'none' }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--brand-teal)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                        />
                    </div>

                    <span style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 99, padding: '6px 14px', fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>
                        {filteredTransactions.length} Hasil
                    </span>
                </div>

                {filteredTransactions.length === 0 ? (
                    <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>
                        <Receipt size={48} opacity={0.3} style={{ marginBottom: 16, margin: '0 auto' }} />
                        <p style={{ fontWeight: 500, fontSize: 15 }}>{localSearch ? 'Tidak ada transaksi yang cocok.' : 'Belum ada transaksi terekam.'}</p>
                    </div>
                ) : (
                    <div>
                        {filteredTransactions.map(tx => {
                            const walletName = wallets.find(w => w.id === tx.walletId)?.name || 'Dompet Dihapus';
                            return (
                                <div key={tx.id} style={{ padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', transition: 'background .2s', gap: 16 }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
                                        <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: tx.type === 'income' ? 'rgba(132, 204, 22, 0.1)' : 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {tx.type === 'income' ? <ArrowUpRight size={22} color="var(--brand-green)" /> : <ArrowDownRight size={22} color="var(--red)" />}
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {tx.note || <span style={{ color: 'var(--muted)', fontStyle: 'italic', fontWeight: 400 }}>Tanpa Catatan</span>}
                                            </p>
                                            <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{walletName} • {tx.category} • {tx.date}</p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                                        <span style={{ fontWeight: 600, fontSize: 15, color: tx.type === 'income' ? 'var(--brand-green)' : 'var(--text)' }}>
                                            {tx.type === 'income' ? '+' : '−'} Rp {tx.amount.toLocaleString('id-ID')}
                                        </span>
                                        <button onClick={() => handleDelete(tx.id)} style={{ width: 36, height: 36, borderRadius: 10, background: 'transparent', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all .2s', color: 'var(--muted)' }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
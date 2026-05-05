import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { Trash2, ArrowDownRight, ArrowUpRight, Search, ListFilter, Calendar, History as HistoryIcon } from 'lucide-react';

const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    fontSize: '13px',
    fontFamily: 'inherit',
    color: 'var(--text)',
    outline: 'none',
    transition: 'border-color .2s',
};

export default function History() {
    const transactions = useLiveQuery(() => db.transactions.orderBy('date').reverse().toArray()) || [];
    const wallets = useLiveQuery(() => db.wallets.toArray()) || [];
    const categories = useLiveQuery(() => db.categories.toArray()) || [];

    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterWallet, setFilterWallet] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const filteredTransactions = transactions.filter(tx => {
        const matchesSearch = (tx.note?.toLowerCase() || '').includes(search.toLowerCase()) ||
            (tx.category?.toLowerCase() || '').includes(search.toLowerCase());
        const matchesType = filterType === 'all' || tx.type === filterType;
        const matchesWallet = filterWallet === 'all' || tx.walletId === Number(filterWallet);
        const matchesDateFrom = !dateFrom || tx.date >= dateFrom;
        const matchesDateTo = !dateTo || tx.date <= dateTo;

        return matchesSearch && matchesType && matchesWallet && matchesDateFrom && matchesDateTo;
    });

    const handleDelete = async (id) => {
        if (window.confirm('Hapus transaksi ini secara permanen?')) {
            await db.transactions.delete(id);
        }
    };

    return (
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ padding: 12, background: 'rgba(13, 148, 136, 0.1)', borderRadius: 16 }}>
                    <HistoryIcon size={28} color="var(--brand-teal)" />
                </div>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.5px' }}>
                        Riwayat Transaksi
                    </h1>
                    <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>Filter dan pantau seluruh riwayat arus kas Anda</p>
                </div>
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24, boxShadow: 'var(--shadow)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <ListFilter size={20} color="var(--brand-teal)" />
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>Filter Pencarian</h3>
                </div>

                {/* Perbaikan Layout Filter Menggunakan Flex-Wrap */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                    <div style={{ position: 'relative', flex: '1 1 200px' }}>
                        <Search size={16} color="var(--muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                        <input type="text" placeholder="Cari catatan/kategori..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: 40 }} onFocus={(e) => e.target.style.borderColor = 'var(--brand-teal)'} onBlur={(e) => e.target.style.borderColor = 'var(--border)'} />
                    </div>

                    <select style={{ ...inputStyle, flex: '1 1 180px' }} value={filterType} onChange={e => setFilterType(e.target.value)} onFocus={(e) => e.target.style.borderColor = 'var(--brand-teal)'} onBlur={(e) => e.target.style.borderColor = 'var(--border)'}>
                        <option value="all">Semua Jenis Transaksi</option>
                        <option value="income">Pemasukan Saja</option>
                        <option value="expense">Pengeluaran Saja</option>
                    </select>

                    <select style={{ ...inputStyle, flex: '1 1 180px' }} value={filterWallet} onChange={e => setFilterWallet(e.target.value)} onFocus={(e) => e.target.style.borderColor = 'var(--brand-teal)'} onBlur={(e) => e.target.style.borderColor = 'var(--border)'}>
                        <option value="all">Semua Dompet / Rekening</option>
                        {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>

                    <div style={{ flex: '1 1 260px', display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ ...inputStyle, flex: 1 }} title="Dari Tanggal" />
                        <span style={{ color: 'var(--muted)', fontWeight: 600 }}>-</span>
                        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ ...inputStyle, flex: 1 }} title="Sampai Tanggal" />
                    </div>
                </div>
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
                <div style={{ padding: '20px 32px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>Daftar Transaksi</h3>
                    <span style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 99, padding: '4px 14px', fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>
                        {filteredTransactions.length} Hasil Ditemukan
                    </span>
                </div>

                {filteredTransactions.length === 0 ? (
                    <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>
                        <Calendar size={48} opacity={0.3} style={{ marginBottom: 16, margin: '0 auto' }} />
                        <p style={{ fontWeight: 500, fontSize: 15 }}>Tidak ada transaksi yang sesuai filter.</p>
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
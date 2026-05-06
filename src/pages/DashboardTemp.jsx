import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { Wallet, TrendingUp, TrendingDown, Activity, BarChart2 } from 'lucide-react';

const COLORS = ['#0d9488', '#84cc16', '#3b82f6', '#1e3a8a', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6'];

export default function Dashboard() {
    const transactions = useLiveQuery(() => db.transactions.toArray()) || [];
    const wallets = useLiveQuery(() => db.wallets.toArray()) || [];

    const [activeMetric, setActiveMetric] = useState('balance');

    const totalInitialBalance = wallets.reduce((sum, w) => sum + (w.initialBalance || 0), 0);

    // Pisahkan transaksi berdasarkan tipe
    const incomeTxs = transactions.filter(t => t.type === 'income');
    const expenseTxs = transactions.filter(t => t.type === 'expense');

    const totalIncome = incomeTxs.reduce((s, t) => s + t.amount, 0);
    const totalExpense = expenseTxs.reduce((s, t) => s + t.amount, 0);
    const balance = totalInitialBalance + totalIncome - totalExpense;

    // Distribusi Pengeluaran (Ditarik dinamis langsung dari riwayat transaksi)
    const expenseCategories = [...new Set(expenseTxs.map(t => t.category))];
    const expensePieData = expenseCategories.map(cat => ({
        name: cat,
        value: expenseTxs.filter(t => t.category === cat).reduce((s, t) => s + t.amount, 0),
    })).filter(d => d.value > 0);

    // Distribusi Pemasukan (Profit Saham otomatis masuk ke sini)
    const incomeCategories = [...new Set(incomeTxs.map(t => t.category))];
    const incomePieData = incomeCategories.map(cat => ({
        name: cat,
        value: incomeTxs.filter(t => t.category === cat).reduce((s, t) => s + t.amount, 0),
    })).filter(d => d.value > 0);

    const dates = [...new Set(transactions.map(t => t.date))].sort().slice(-14);
    const oldestDateInView = dates[0] || new Date().toISOString().split('T')[0];

    const txsBeforeView = transactions.filter(t => t.date < oldestDateInView);
    const incBefore = txsBeforeView.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expBefore = txsBeforeView.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    let runningBalance = totalInitialBalance + incBefore - expBefore;

    const trendData = dates.map(date => {
        const dayTxs = transactions.filter(t => t.date === date);
        const inc = dayTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const exp = dayTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

        runningBalance += (inc - exp);

        return { date: date.slice(5), income: inc, expense: exp, balance: runningBalance };
    });

    const CustomTooltip = ({ active, payload }) => {
        if (!active || !payload?.length) return null;
        return (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px', boxShadow: 'var(--shadow)' }}>
                <p style={{ fontWeight: 500, color: 'var(--muted)', fontSize: 13, marginBottom: 4 }}>{payload[0].payload.name || payload[0].payload.date}</p>
                <p style={{ color: 'var(--text)', fontWeight: 700, fontSize: 15 }}>Rp {payload[0].value.toLocaleString('id-ID')}</p>
            </div>
        );
    };

    const cardStyle = (metric) => ({
        background: activeMetric === metric ? (metric === 'balance' ? 'linear-gradient(135deg, var(--brand-dark) 0%, var(--brand-teal) 100%)' : 'var(--surface)') : 'var(--bg)',
        border: `1px solid ${activeMetric === metric ? (metric === 'income' ? 'var(--brand-green)' : metric === 'expense' ? 'var(--red)' : 'transparent') : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        boxShadow: activeMetric === metric ? 'var(--shadow-lg)' : 'var(--shadow)',
        cursor: 'pointer',
        transition: 'all 0.2s',
        position: 'relative',
        overflow: 'hidden'
    });

    const isShowPie = activeMetric === 'expense' || activeMetric === 'income';
    const currentPieData = activeMetric === 'income' ? incomePieData : expensePieData;
    const currentPieTitle = activeMetric === 'income' ? 'Distribusi Pemasukan' : 'Distribusi Pengeluaran';

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ padding: 12, background: 'rgba(13, 148, 136, 0.1)', borderRadius: 16 }}>
                    <Activity size={28} color="var(--brand-teal)" />
                </div>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.5px' }}>
                        Ringkasan Keuangan
                    </h1>
                    <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>Klik kartu metrik di bawah untuk melihat detail tren</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
                <div style={cardStyle('balance')} onClick={() => setActiveMetric('balance')}>
                    {activeMetric === 'balance' && <div style={{ position: 'absolute', right: -24, top: -24, opacity: 0.1 }}><Wallet size={140} /></div>}
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ width: 44, height: 44, background: activeMetric === 'balance' ? 'rgba(255,255,255,0.1)' : 'rgba(13, 148, 136, 0.1)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                            <Wallet size={22} color={activeMetric === 'balance' ? 'white' : 'var(--brand-teal)'} />
                        </div>
                        <p style={{ color: activeMetric === 'balance' ? 'rgba(255,255,255,0.7)' : 'var(--muted)', fontWeight: 500, fontSize: 14, marginBottom: 8 }}>Total Saldo</p>
                        <h2 style={{ color: activeMetric === 'balance' ? 'white' : 'var(--text)', fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px' }}>
                            Rp {balance.toLocaleString('id-ID')}
                        </h2>
                    </div>
                </div>

                <div style={cardStyle('income')} onClick={() => setActiveMetric('income')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(132, 204, 22, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingUp size={22} color="var(--brand-green)" />
                        </div>
                        <span style={{ color: 'var(--muted)', fontWeight: 500, fontSize: 14 }}>Pemasukan</span>
                    </div>
                    <h2 style={{ fontSize: 28, fontWeight: 700, color: 'var(--brand-green)', letterSpacing: '-0.5px' }}>
                        Rp {totalIncome.toLocaleString('id-ID')}
                    </h2>
                </div>

                <div style={cardStyle('expense')} onClick={() => setActiveMetric('expense')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingDown size={22} color="var(--red)" />
                        </div>
                        <span style={{ color: 'var(--muted)', fontWeight: 500, fontSize: 14 }}>Pengeluaran</span>
                    </div>
                    <h2 style={{ fontSize: 28, fontWeight: 700, color: 'var(--red)', letterSpacing: '-0.5px' }}>
                        Rp {totalExpense.toLocaleString('id-ID')}
                    </h2>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isShowPie ? 'repeat(auto-fit, minmax(300px, 1fr))' : '1fr', gap: 20 }}>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '28px', boxShadow: 'var(--shadow)', gridColumn: isShowPie ? 'span 1' : '1 / -1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>
                            {activeMetric === 'balance' ? 'Tren Saldo (14 Hari Terakhir)' : activeMetric === 'income' ? 'Grafik Pemasukan' : 'Grafik Pengeluaran'}
                        </h3>
                        <BarChart2 size={20} color="var(--muted)" />
                    </div>

                    {trendData.length === 0 ? (
                        <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 14 }}>Belum ada data tren</div>
                    ) : (
                        <div style={{ height: 280, width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                {activeMetric === 'balance' ? (
                                    <LineChart data={trendData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                        <XAxis dataKey="date" stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `Rp${val / 1000}k`} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Line type="monotone" dataKey="balance" stroke="var(--brand-teal)" strokeWidth={3} dot={{ r: 4, fill: 'var(--brand-dark)' }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                ) : (
                                    <BarChart data={trendData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                        <XAxis dataKey="date" stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `Rp${val / 1000}k`} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey={activeMetric} fill={activeMetric === 'income' ? 'var(--brand-green)' : 'var(--red)'} radius={[4, 4, 0, 0]} barSize={30} />
                                    </BarChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {isShowPie && (
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '28px', boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', marginBottom: 24 }}>
                            {currentPieTitle}
                        </h3>
                        {currentPieData.length === 0 ? (
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 14 }}>Tidak ada data</div>
                        ) : (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div style={{ height: 180, width: '100%' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={currentPieData} innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                                                {currentPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div style={{ overflowY: 'auto', maxHeight: 140, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {[...currentPieData].sort((a, b) => b.value - a.value).map((d, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ width: 10, height: 10, borderRadius: '3px', background: COLORS[i % COLORS.length] }} />
                                                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{d.name}</span>
                                            </div>
                                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Rp {d.value.toLocaleString('id-ID')}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
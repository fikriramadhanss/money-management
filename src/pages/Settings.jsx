import React from 'react';
import { db } from '../db/database';
import { Download, Upload, ShieldAlert, Database, Settings as SettingsIcon, Info } from 'lucide-react';

export default function Settings() {
    const exportData = async () => {
        const transactions = await db.transactions.toArray();
        const dataStr = JSON.stringify(transactions, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `duitin_backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    };

    const importData = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (!Array.isArray(data)) throw new Error('Format tidak valid');
                await db.transactions.bulkAdd(data);
                alert('Data berhasil diimpor!');
                window.location.reload();
            } catch {
                alert('Gagal mengimpor data. Pastikan file JSON berasal dari aplikasi ini.');
            }
        };
        reader.readAsText(file);
    };

    const btnBase = {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        padding: '16px 24px',
        borderRadius: 14,
        fontFamily: 'inherit',
        fontWeight: 600,
        fontSize: 14,
        cursor: 'pointer',
        transition: 'all .2s',
        border: 'none',
    };

    return (
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ padding: 12, background: 'rgba(13, 148, 136, 0.1)', borderRadius: 16 }}>
                    <SettingsIcon size={28} color="var(--brand-teal)" />
                </div>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.5px' }}>
                        Pengaturan Sistem
                    </h1>
                    <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>Kelola data dan cadangan lokal Anda</p>
                </div>
            </div>

            {/* Info Card */}
            <div style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: 32,
                boxShadow: 'var(--shadow)',
            }}>
                <div style={{ display: 'flex', gap: 20, marginBottom: 32 }}>
                    <div style={{
                        width: 56, height: 56, flexShrink: 0,
                        background: 'rgba(245, 158, 11, 0.1)',
                        borderRadius: 16,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <ShieldAlert size={28} color="var(--orange)" />
                    </div>
                    <div>
                        <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>
                            Penyimpanan Lokal (Offline-First)
                        </h3>
                        <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6 }}>
                            Seluruh data keuangan Anda disimpan secara eksklusif di <strong style={{ color: 'var(--text)' }}>browser perangkat ini</strong> menggunakan IndexedDB. Kami tidak mengirimkan data Anda ke server eksternal apa pun.
                        </p>
                        <div style={{
                            marginTop: 16,
                            background: 'rgba(245, 158, 11, 0.05)',
                            border: '1px solid rgba(245, 158, 11, 0.2)',
                            borderRadius: 12,
                            padding: '12px 16px',
                            display: 'flex', alignItems: 'flex-start', gap: 12,
                        }}>
                            <Info size={18} color="var(--orange)" style={{ flexShrink: 0, marginTop: 2 }} />
                            <p style={{ fontSize: 13, color: 'var(--orange)', lineHeight: 1.5 }}>
                                Jika Anda membersihkan cache browser, data akan hilang permanen. Harap lakukan pencadangan secara berkala.
                            </p>
                        </div>
                    </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', marginBottom: 32 }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <Database size={20} color="var(--brand-teal)" />
                    <h4 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>
                        Manajemen Cadangan Data (JSON)
                    </h4>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <button
                        onClick={exportData}
                        style={{
                            ...btnBase,
                            background: 'linear-gradient(135deg, var(--brand-teal), var(--brand-dark))',
                            color: 'white',
                            boxShadow: '0 4px 16px rgba(13, 148, 136, 0.2)',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(13, 148, 136, 0.3)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(13, 148, 136, 0.2)'; }}
                    >
                        <Download size={20} />
                        Unduh Data (Export)
                    </button>

                    <label style={{
                        ...btnBase,
                        background: 'var(--bg)',
                        color: 'var(--text)',
                        border: '1px solid var(--border)',
                        cursor: 'pointer',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(13, 148, 136, 0.05)'; e.currentTarget.style.borderColor = 'var(--brand-teal)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                    >
                        <Upload size={20} color="var(--brand-teal)" />
                        Pulihkan Data (Import)
                        <input type="file" accept=".json" onChange={importData} style={{ display: 'none' }} />
                    </label>
                </div>
            </div>

            {/* Elegant footer card */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.2) 0%, rgba(13, 148, 136, 0.1) 100%)',
                border: '1px solid rgba(13, 148, 136, 0.2)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px 32px',
                display: 'flex', alignItems: 'center', gap: 20,
            }}>
                <div style={{ padding: 12, background: 'rgba(13, 148, 136, 0.15)', borderRadius: '50%' }}>
                    <ShieldAlert size={24} color="var(--brand-teal)" />
                </div>
                <div>
                    <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
                        Praktik Terbaik Keamanan
                    </p>
                    <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.5 }}>
                        Simpan file JSON hasil unduhan di tempat yang aman seperti Cloud Storage pribadi (Google Drive/Dropbox).
                    </p>
                </div>
            </div>
        </div>
    );
}
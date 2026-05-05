// Profile.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../db/database';
import { useAuthStore } from '../store/useAuthStore';
import { User, Mail, Lock, CheckCircle2, ShieldCheck } from 'lucide-react';

const inputStyle = {
    width: '100%',
    padding: '14px 16px 14px 44px',
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    fontSize: '14px',
    color: 'var(--text)',
    outline: 'none',
    transition: 'border-color 0.2s',
};

export default function Profile() {
    const { user, login } = useAuthStore();
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [status, setStatus] = useState({ type: '', message: '' });

    useEffect(() => {
        const fetchUserData = async () => {
            if (user?.id) {
                const userData = await db.users.get(user.id);
                if (userData) {
                    setFormData({ name: userData.name, email: userData.email, password: userData.password });
                }
            }
        };
        fetchUserData();
    }, [user]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setStatus({ type: '', message: '' });

        try {
            await db.users.update(user.id, {
                name: formData.name,
                email: formData.email,
                password: formData.password
            });

            login({ id: user.id, name: formData.name, email: formData.email });
            setStatus({ type: 'success', message: 'Profil berhasil diperbarui' });

            setTimeout(() => setStatus({ type: '', message: '' }), 3000);
        } catch (error) {
            setStatus({ type: 'error', message: 'Gagal memperbarui profil' });
        }
    };

    return (
        <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ padding: 12, background: 'rgba(13, 148, 136, 0.1)', borderRadius: 16 }}>
                    <User size={28} color="var(--brand-teal)" />
                </div>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.5px' }}>
                        Profil Saya
                    </h1>
                    <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>Kelola informasi pribadi dan keamanan akun</p>
                </div>
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 32, boxShadow: 'var(--shadow)' }}>
                {status.message && (
                    <div style={{
                        background: status.type === 'success' ? 'rgba(132, 204, 22, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        border: `1px solid ${status.type === 'success' ? 'rgba(132, 204, 22, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                        padding: '12px 16px', borderRadius: 12, color: status.type === 'success' ? 'var(--brand-green)' : 'var(--red)',
                        fontSize: 13, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8
                    }}>
                        {status.type === 'success' ? <CheckCircle2 size={18} /> : <ShieldCheck size={18} />}
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nama Lengkap</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} color="var(--muted)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                            <input style={inputStyle} type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} onFocus={(e) => e.target.style.borderColor = 'var(--brand-teal)'} onBlur={(e) => e.target.style.borderColor = 'var(--border)'} />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Alamat Email</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} color="var(--muted)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                            <input style={inputStyle} type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} onFocus={(e) => e.target.style.borderColor = 'var(--brand-teal)'} onBlur={(e) => e.target.style.borderColor = 'var(--border)'} />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kata Sandi</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} color="var(--muted)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                            <input style={inputStyle} type="password" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} onFocus={(e) => e.target.style.borderColor = 'var(--brand-teal)'} onBlur={(e) => e.target.style.borderColor = 'var(--border)'} />
                        </div>
                    </div>

                    <button type="submit" style={{
                        marginTop: 12, padding: '16px', background: 'linear-gradient(135deg, var(--brand-teal), var(--brand-dark))',
                        border: 'none', borderRadius: '12px', color: 'white', fontWeight: 600, fontSize: 15,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        boxShadow: '0 4px 16px rgba(13, 148, 136, 0.25)', transition: 'all 0.2s'
                    }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(13, 148, 136, 0.35)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(13, 148, 136, 0.25)'; }}
                    >
                        Simpan Perubahan
                    </button>
                </form>
            </div>
        </div>
    );
}
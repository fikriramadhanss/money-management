import React, { useState } from 'react';
import { Hexagon, Mail, Lock, User, ShieldCheck, ArrowRight } from 'lucide-react';
import { db } from '../db/database';
import { useAuthStore } from '../store/useAuthStore';

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

export default function Auth() {
    const login = useAuthStore((state) => state.login);

    const [view, setView] = useState('login');
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [inputOtp, setInputOtp] = useState('');
    const [error, setError] = useState('');

    // LOGIKA LOGIN 
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        const user = await db.users.where('email').equals(formData.email).first();
        if (!user) return setError('Email tidak ditemukan. Silakan daftar.');
        if (user.password !== formData.password) return setError('Kata sandi salah.');

        // Berhasil Login
        login({ id: user.id, name: user.name, email: user.email });
    };

    // LOGIKA REGISTER (KIRIM OTP)
    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        // Cek apakah email sudah terdaftar
        const existing = await db.users.where('email').equals(formData.email).first();
        if (existing) return setError('Email sudah terdaftar. Silakan login.');

        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        setGeneratedOtp(otp);
        setView('otp');

        // set OTP)
        setTimeout(() => {
            alert(`Email masuk\n\nKepada: ${formData.email}\nKode OTP Duitin Anda adalah: ${otp}\n\nJANGAN BERIKAN KODE INI KEPADA SIAPAPUN.`);
        }, 500);
    };

    // ── LOGIKA VERIFIKASI OTP ──
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');

        if (inputOtp !== generatedOtp) return setError('Kode OTP tidak valid.');

        // OTP Benar
        const newUserId = await db.users.add({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            createdAt: new Date().toISOString()
        });

        // Otomatis Login
        login({ id: newUserId, name: formData.name, email: formData.email });
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 24, fontFamily: 'Inter, sans-serif' }}>

            <div style={{ width: '100%', maxWidth: 420, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '24px', padding: 40, boxShadow: 'var(--shadow-lg)' }}>

                {/* Logo */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
                    <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, var(--brand-dark), var(--brand-teal), var(--brand-green))', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(13, 148, 136, 0.4)' }}>
                        <Hexagon size={36} color="white" fill="white" fillOpacity={0.2} />
                    </div>
                </div>

                <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', textAlign: 'center', letterSpacing: '-0.5px' }}>
                    {view === 'login' ? 'Selamat Datang Kembali' : view === 'register' ? 'Buat Akun Duitin' : 'Verifikasi Keamanan'}
                </h2>
                <p style={{ color: 'var(--muted)', textAlign: 'center', fontSize: 14, marginTop: 8, marginBottom: 32 }}>
                    {view === 'login' ? 'Masuk untuk mengelola aset keuangan Anda.' : view === 'register' ? 'Mulai perjalanan finansial Anda hari ini.' : `Kami telah mengirimkan OTP ke ${formData.email}`}
                </p>

                {error && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px 16px', borderRadius: 12, color: 'var(--red)', fontSize: 13, marginBottom: 20, textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                {/*FORM LOGIN / REGISTER*/}
                {(view === 'login' || view === 'register') && (
                    <form onSubmit={view === 'login' ? handleLogin : handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                        {view === 'register' && (
                            <div style={{ position: 'relative' }}>
                                <User size={18} color="var(--muted)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                                <input style={inputStyle} type="text" placeholder="Nama Lengkap" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} onFocus={(e) => e.target.style.borderColor = 'var(--brand-teal)'} onBlur={(e) => e.target.style.borderColor = 'var(--border)'} />
                            </div>
                        )}

                        <div style={{ position: 'relative' }}>
                            <Mail size={18} color="var(--muted)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                            <input style={inputStyle} type="email" placeholder="Alamat Email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} onFocus={(e) => e.target.style.borderColor = 'var(--brand-teal)'} onBlur={(e) => e.target.style.borderColor = 'var(--border)'} />
                        </div>

                        <div style={{ position: 'relative' }}>
                            <Lock size={18} color="var(--muted)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                            <input style={inputStyle} type="password" placeholder="Kata Sandi" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} onFocus={(e) => e.target.style.borderColor = 'var(--brand-teal)'} onBlur={(e) => e.target.style.borderColor = 'var(--border)'} />
                        </div>

                        <button type="submit" style={{ marginTop: 8, padding: '16px', background: 'linear-gradient(135deg, var(--brand-teal), var(--brand-dark))', border: 'none', borderRadius: '12px', color: 'white', fontWeight: 600, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 16px rgba(13, 148, 136, 0.25)', transition: 'all 0.2s' }}>
                            {view === 'login' ? 'Masuk ke Dashboard' : 'Kirim Kode OTP'} <ArrowRight size={18} />
                        </button>
                    </form>
                )}

                {/*FORM OTP */}
                {view === 'otp' && (
                    <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ position: 'relative' }}>
                            <ShieldCheck size={18} color="var(--muted)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                            <input style={{ ...inputStyle, textAlign: 'center', paddingLeft: 16, letterSpacing: '0.5em', fontSize: 20, fontWeight: 700 }} type="text" maxLength="4" placeholder="••••" required value={inputOtp} onChange={e => setInputOtp(e.target.value.replace(/\D/g, ''))} autoFocus onFocus={(e) => e.target.style.borderColor = 'var(--brand-teal)'} onBlur={(e) => e.target.style.borderColor = 'var(--border)'} />
                        </div>

                        <button type="submit" style={{ marginTop: 8, padding: '16px', background: 'linear-gradient(135deg, var(--brand-teal), var(--brand-dark))', border: 'none', borderRadius: '12px', color: 'white', fontWeight: 600, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 16px rgba(13, 148, 136, 0.25)', transition: 'all 0.2s' }}>
                            Verifikasi & Masuk
                        </button>
                        <button type="button" onClick={() => { setView('register'); setInputOtp(''); }} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: 14, cursor: 'pointer', marginTop: 8 }}>
                            Kembali
                        </button>
                    </form>
                )}

                {/* Toggle View */}
                {view !== 'otp' && (
                    <p style={{ textAlign: 'center', marginTop: 32, fontSize: 14, color: 'var(--muted)' }}>
                        {view === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
                        <span onClick={() => { setView(view === 'login' ? 'register' : 'login'); setError(''); }} style={{ color: 'var(--brand-teal)', fontWeight: 600, cursor: 'pointer' }}>
                            {view === 'login' ? 'Daftar Sekarang' : 'Masuk di sini'}
                        </span>
                    </p>
                )}

            </div>
        </div>
    );
}
import React, { useState } from 'react';
import Dashboard from './pages/DashboardTemp';
import Transactions from './pages/Transactions';
import History from './pages/History';
import Budgets from './pages/Budgets';
import Settings from './pages/Settings';
import Auth from './pages/Auth';
import Wallets from './pages/Wallets';
import Profile from './pages/Profile';
import Goals from './pages/Goals';
import { useAuthStore } from './store/useAuthStore';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db/database';
import {
  LayoutDashboard,
  ReceiptText,
  History as HistoryIcon,
  WalletCards,
  Settings as SettingsIcon,
  Search,
  Bell,
  CreditCard,
  Hexagon,
  LogOut,
  UserCircle,
  X,
  SearchX,
  ArrowUpRight,
  ArrowDownRight,
  Target as TargetIcon
} from 'lucide-react';

const DUITIN_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  :root {
    --bg:          #0f172a;
    --surface:     #1e293b;
    --border:      #334155;
    --text:        #f8fafc;
    --muted:       #94a3b8;
    
    --brand-dark:  #1e3a8a;
    --brand-teal:  #0d9488;
    --brand-green: #84cc16;
    
    --red:         #ef4444;
    --orange:      #f59e0b;
    
    --shadow:      0 4px 24px rgba(0,0,0,0.25);
    --shadow-lg:   0 8px 40px rgba(0,0,0,0.4);
    --radius:      1rem;
    --radius-lg:   1.5rem;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Inter', sans-serif;
    background: var(--bg);
    color: var(--text);
    -webkit-font-smoothing: antialiased;
    color-scheme: dark;
  }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .page-transition { animation: fadeUp 0.4s ease-out both; }

  /* Responsive Bottom Nav Scroll */
  .mobile-nav-scroll {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 4px;
  }
  .mobile-nav-scroll::-webkit-scrollbar { display: none; }
`;

const NavItem = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '6px',
      padding: '10px 12px',
      borderRadius: 'var(--radius)',
      border: 'none',
      cursor: 'pointer',
      background: isActive ? 'rgba(13, 148, 136, 0.15)' : 'transparent',
      color: isActive ? 'var(--brand-teal)' : 'var(--muted)',
      fontFamily: 'inherit',
      fontWeight: isActive ? 600 : 500,
      fontSize: '11px',
      transition: 'all .2s ease',
      minWidth: 64,
      scrollSnapAlign: 'start'
    }}
  >
    {React.cloneElement(icon, {
      size: 20,
      strokeWidth: isActive ? 2.5 : 2,
    })}
    <span>{label}</span>
  </button>
);

function App() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [globalSearch, setGlobalSearch] = useState('');

  const allTransactions = useLiveQuery(() => db.transactions.orderBy('date').reverse().toArray()) || [];

  const searchResults = allTransactions.filter(tx => {
    if (!globalSearch) return false;
    const lowerQuery = globalSearch.toLowerCase();
    return (
      (tx.note?.toLowerCase() || '').includes(lowerQuery) ||
      (tx.category?.toLowerCase() || '').includes(lowerQuery) ||
      (tx.amount?.toString() || '').includes(lowerQuery)
    );
  });

  if (!isAuthenticated) {
    return (
      <>
        <style>{DUITIN_STYLE}</style>
        <Auth />
      </>
    );
  }

  const getInitials = (name) => {
    if (!name) return 'ME';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const navItems = [
    { id: 'dashboard', icon: <LayoutDashboard />, label: 'Dashboard' },
    { id: 'transactions', icon: <ReceiptText />, label: 'Input' },
    { id: 'history', icon: <HistoryIcon />, label: 'Riwayat' },
    { id: 'budgets', icon: <WalletCards />, label: 'Limit' },
    { id: 'wallets', icon: <CreditCard />, label: 'Dompet' },
    { id: 'settings', icon: <SettingsIcon />, label: 'Pengaturan' },
    { id: 'goals', icon: <TargetIcon />, label: 'Target' },
  ];

  return (
    <>
      <style>{DUITIN_STYLE}</style>

      {globalSearch && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
            width: '100%', maxWidth: 600, maxHeight: '80vh', display: 'flex', flexDirection: 'column',
            boxShadow: 'var(--shadow-lg)', animation: 'fadeUp 0.3s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 32px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>Hasil Pencarian</h3>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Pencarian untuk "{globalSearch}"</p>
              </div>
              <button onClick={() => setGlobalSearch('')} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--muted)'; }} onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '24px 32px', overflowY: 'auto' }}>
              {searchResults.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px 0' }}>
                  <SearchX size={48} opacity={0.3} style={{ margin: '0 auto 16px' }} />
                  <p style={{ fontWeight: 500, fontSize: 15 }}>Tidak ada data yang cocok.</p>
                  <p style={{ fontSize: 13, marginTop: 4 }}>Coba kata kunci atau nominal lain.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {searchResults.map(tx => (
                    <div key={tx.id} style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: tx.type === 'income' ? 'rgba(132, 204, 22, 0.1)' : 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {tx.type === 'income' ? <ArrowUpRight size={22} color="var(--brand-green)" /> : <ArrowDownRight size={22} color="var(--red)" />}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {tx.note || <span style={{ color: 'var(--muted)', fontStyle: 'italic', fontWeight: 400 }}>Tanpa Catatan</span>}
                          </p>
                          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{tx.category} • {tx.date}</p>
                        </div>
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 15, color: tx.type === 'income' ? 'var(--brand-green)' : 'var(--text)', flexShrink: 0 }}>
                        {tx.type === 'income' ? '+' : '−'} Rp {tx.amount.toLocaleString('id-ID')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', fontFamily: 'Inter, sans-serif' }}>
        <nav style={{
          display: 'none',
          width: 260,
          minHeight: '100vh',
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          padding: '32px 20px',
          flexDirection: 'column',
          gap: 8,
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
        }} className="desktop-nav">

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 8px 32px' }}>
            <div style={{
              width: 40, height: 40,
              background: 'linear-gradient(135deg, var(--brand-dark), var(--brand-teal), var(--brand-green))',
              borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(13, 148, 136, 0.4)',
              flexShrink: 0,
            }}>
              <Hexagon size={24} color="white" fill="white" fillOpacity={0.2} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.5px' }}>
                Duitin
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>Money Management</div>
            </div>
          </div>

          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 16px',
                borderRadius: 'var(--radius)',
                border: 'none',
                cursor: 'pointer',
                background: activeTab === item.id ? 'rgba(13, 148, 136, 0.1)' : 'transparent',
                color: activeTab === item.id ? 'var(--brand-teal)' : 'var(--muted)',
                fontFamily: 'inherit',
                fontWeight: activeTab === item.id ? 600 : 500,
                fontSize: 14,
                textAlign: 'left',
                width: '100%',
                transition: 'all .2s ease',
                borderLeft: activeTab === item.id ? '3px solid var(--brand-teal)' : '3px solid transparent',
              }}
            >
              {React.cloneElement(item.icon, {
                size: 20,
                strokeWidth: activeTab === item.id ? 2.5 : 2,
              })}
              {item.label}
            </button>
          ))}

          <button
            onClick={() => setActiveTab('profile')}
            style={{
              marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
              borderRadius: 'var(--radius)', border: 'none', cursor: 'pointer',
              background: activeTab === 'profile' ? 'rgba(13, 148, 136, 0.1)' : 'transparent',
              color: activeTab === 'profile' ? 'var(--brand-teal)' : 'var(--muted)', fontFamily: 'inherit', fontWeight: 600, fontSize: 14,
              transition: 'all .2s ease', borderLeft: activeTab === 'profile' ? '3px solid var(--brand-teal)' : '3px solid transparent',
            }}
          >
            <UserCircle size={20} /> Profil Saya
          </button>

          <button
            onClick={logout}
            style={{
              marginTop: '8px', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
              borderRadius: 'var(--radius)', border: 'none', cursor: 'pointer',
              background: 'transparent', color: 'var(--red)', fontFamily: 'inherit', fontWeight: 600, fontSize: 14,
              transition: 'all .2s ease', borderLeft: '3px solid transparent',
            }}
          >
            <LogOut size={20} /> Keluar
          </button>
        </nav>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <header style={{
            display: 'none',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 32px',
            background: 'rgba(30, 41, 59, 0.8)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--border)',
            position: 'sticky',
            top: 0,
            zIndex: 40,
          }} className="desktop-header">
            <div style={{ position: 'relative', width: 360 }}>
              <Search size={18} color="var(--muted)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Cari transaksi cepat..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 44px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 99,
                  fontSize: 14,
                  fontFamily: 'inherit',
                  color: 'var(--text)',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--brand-teal)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <button style={{
                width: 44, height: 44,
                borderRadius: '50%',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text)'
              }}>
                <Bell size={20} />
              </button>

              <div
                onClick={() => setActiveTab('profile')}
                style={{ display: 'flex', alignItems: 'center', gap: 12, borderLeft: '1px solid var(--border)', paddingLeft: 20, cursor: 'pointer' }}
              >
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', lineHeight: 1 }}>{user?.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Premium User</p>
                </div>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--brand-dark), var(--brand-teal))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700, fontSize: 16, boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)'
                }}>
                  {getInitials(user?.name)}
                </div>
              </div>
            </div>
          </header>

          <main style={{ flex: 1, padding: '24px 16px 90px', overflowY: 'auto' }} className="main-content">
            <div className="page-transition" key={activeTab}>
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'transactions' && <Transactions />}
              {activeTab === 'history' && <History />}
              {activeTab === 'budgets' && <Budgets />}
              {activeTab === 'settings' && <Settings />}
              {activeTab === 'wallets' && <Wallets />}
              {activeTab === 'profile' && <Profile />}
              {activeTab === 'goals' && <Goals />}
            </div>
          </main>
        </div>

        <nav style={{
          position: 'fixed',
          bottom: 0, left: 0, right: 0,
          background: 'rgba(30, 41, 59, 0.9)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid var(--border)',
          zIndex: 50,
        }} className="mobile-nav">
          <div className="mobile-nav-scroll" style={{ padding: '12px 12px 16px', gap: 8 }}>
            {navItems.map(item => (
              <NavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                isActive={activeTab === item.id}
                onClick={() => setActiveTab(item.id)}
              />
            ))}
            <NavItem
              icon={<UserCircle />}
              label="Profil"
              isActive={activeTab === 'profile'}
              onClick={() => setActiveTab('profile')}
            />
            <button
              onClick={logout}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 12px',
                borderRadius: 'var(--radius)',
                border: 'none',
                cursor: 'pointer',
                background: 'transparent',
                color: 'var(--red)',
                fontFamily: 'inherit',
                fontWeight: 600,
                fontSize: '11px',
                transition: 'all .2s ease',
                minWidth: 64,
                scrollSnapAlign: 'start'
              }}
            >
              <LogOut size={20} strokeWidth={2} />
              <span>Keluar</span>
            </button>
          </div>
        </nav>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav    { display: flex !important; }
          .desktop-header { display: flex !important; }
          .mobile-nav     { display: none !important; }
          .main-content   { padding: 32px 40px !important; }
        }
      `}</style>
    </>
  );
}

export default App;
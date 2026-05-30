import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const NAV = [
  { to:'/dashboard', icon:'⬡', label:'Dashboard' },
  { to:'/logs',      icon:'≡', label:'Logs',      roles:['admin','developer'] },
  { to:'/alerts',    icon:'⚡', label:'Alerts',    roles:['admin','developer'] },
  { to:'/users',     icon:'◈', label:'Users',     roles:['admin'] },
  { to:'/crypto',    icon:'⚿', label:'Crypto Lab' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => { await logout(); nav('/login'); toast.success('Logged out'); };

  const visibleNav = NAV.filter(n => !n.roles || n.roles.includes(user?.role));

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: collapsed ? 60 : 220, background:'#0d1221',
        borderRight:'1px solid #1e2d4a', display:'flex', flexDirection:'column',
        transition:'width .25s', flexShrink:0
      }}>
        {/* Logo */}
        <div style={{ padding:'20px 16px', borderBottom:'1px solid #1e2d4a', display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:20, color:'#00d4ff' }}>⛨</span>
          {!collapsed && <span style={{ fontFamily:'var(--mono)', fontWeight:700, color:'#00d4ff', fontSize:13 }}>SecureGateway</span>}
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'12px 8px' }}>
          {visibleNav.map(n => (
            <NavLink key={n.to} to={n.to} style={({ isActive }) => ({
              display:'flex', alignItems:'center', gap:10, padding:'9px 10px',
              borderRadius:6, marginBottom:2, color: isActive ? '#00d4ff' : '#8b9fc4',
              background: isActive ? 'rgba(0,212,255,.08)' : 'transparent',
              textDecoration:'none', fontSize:13, fontWeight:500,
              borderLeft: isActive ? '2px solid #00d4ff' : '2px solid transparent',
              transition:'.15s'
            })}>
              <span style={{ fontSize:16, minWidth:20, textAlign:'center' }}>{n.icon}</span>
              {!collapsed && n.label}
            </NavLink>
          ))}
        </nav>

        {/* User + collapse */}
        <div style={{ borderTop:'1px solid #1e2d4a', padding:'12px 8px' }}>
          {!collapsed && (
            <div style={{ padding:'8px 10px', marginBottom:8 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#e2e8f0' }}>{user?.username}</div>
              <span className={`badge badge-${user?.role}`} style={{ marginTop:4 }}>{user?.role}</span>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="btn btn-ghost btn-sm"
            style={{ width:'100%', marginBottom:6 }}>{collapsed ? '→' : '← Collapse'}</button>
          <button onClick={handleLogout} className="btn btn-danger btn-sm" style={{ width:'100%' }}>
            {collapsed ? '✕' : '⏻ Logout'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex:1, overflow:'auto', padding:28, background:'#080c18' }}>
        <Outlet />
      </main>
    </div>
  );
}

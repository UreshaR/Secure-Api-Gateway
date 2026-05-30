import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function Login() {
  const [form, setForm] = useState({ email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!'); nav('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'#080c18', padding:20 }}>
      <div style={{ width:'100%', maxWidth:420 }}>
        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:40, marginBottom:12 }}>⛨</div>
          <h1 style={{ fontFamily:'var(--mono)', color:'#00d4ff', fontSize:22, fontWeight:700 }}>SecureGateway</h1>
          <p style={{ color:'#8b9fc4', marginTop:6, fontSize:13 }}>Sign in to the admin dashboard</p>
        </div>

        <div className="card">
          <form onSubmit={submit}>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', color:'#8b9fc4', fontSize:12, fontWeight:600,
                textTransform:'uppercase', letterSpacing:'.7px', marginBottom:6 }}>Email</label>
              <input type="email" placeholder="admin@gateway.com" value={form.email}
                onChange={e => setForm({...form, email:e.target.value})} required />
            </div>
            <div style={{ marginBottom:20 }}>
              <label style={{ display:'block', color:'#8b9fc4', fontSize:12, fontWeight:600,
                textTransform:'uppercase', letterSpacing:'.7px', marginBottom:6 }}>Password</label>
              <input type="password" placeholder="••••••••" value={form.password}
                onChange={e => setForm({...form, password:e.target.value})} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width:'100%', padding:'11px', fontSize:14 }} disabled={loading}>
              {loading ? 'Signing in…' : '🔐 Sign In'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:16, color:'#8b9fc4', fontSize:13 }}>
            No account? <Link to="/register" style={{ color:'#00d4ff' }}>Register</Link>
          </p>
        </div>

        {/* Test creds */}
        <div className="card" style={{ marginTop:16, fontSize:12, color:'#8b9fc4' }}>
          <div style={{ fontWeight:700, color:'#4a5568', marginBottom:8, fontFamily:'var(--mono)' }}>TEST ACCOUNTS</div>
          {[['admin@gateway.com','Admin@12345','admin'],['dev@gateway.com','Dev@123456','developer'],
            ['user@gateway.com','User@123456','user']].map(([e,p,r]) => (
            <div key={e} style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
              <span style={{ fontFamily:'var(--mono)', color:'#00d4ff', cursor:'pointer' }}
                onClick={() => setForm({email:e, password:p})}>{e}</span>
              <span className={`badge badge-${r}`}>{r}</span>
            </div>
          ))}
          <div style={{ marginTop:6, color:'#4a5568' }}>↑ Click to autofill</div>
        </div>
      </div>
    </div>
  );
}

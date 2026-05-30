import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';

export default function Register() {
  const [form, setForm] = useState({ username:'', email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const r = await api.post('/auth/register', form);
      localStorage.setItem('token', r.data.data.token);
      toast.success('Account created!'); nav('/dashboard');
    } catch (err) { toast.error(err.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#080c18', padding:20 }}>
      <div style={{ width:'100%', maxWidth:400 }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ fontSize:36, marginBottom:10 }}>⛨</div>
          <h1 style={{ fontFamily:'var(--mono)', color:'#00d4ff', fontSize:20 }}>Create Account</h1>
          <p style={{ color:'#8b9fc4', marginTop:5, fontSize:13 }}>Join SecureGateway (role: user)</p>
        </div>
        <div className="card">
          <form onSubmit={submit}>
            {[['Username','text','username','john_doe'],['Email','email','email','you@example.com'],['Password','password','password','Min 8 chars']].map(([l,t,k,ph])=>(
              <div key={k} style={{ marginBottom:14 }}>
                <label style={{ display:'block', color:'#8b9fc4', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.7px', marginBottom:5 }}>{l}</label>
                <input type={t} placeholder={ph} value={form[k]} onChange={e => setForm({...form,[k]:e.target.value})} required/>
              </div>
            ))}
            <button type="submit" className="btn btn-primary" style={{ width:'100%', padding:11, fontSize:14, marginTop:6 }} disabled={loading}>
              {loading ? 'Creating…' : 'Create Account'}
            </button>
          </form>
          <p style={{ textAlign:'center', marginTop:14, color:'#8b9fc4', fontSize:13 }}>
            Have an account? <Link to="/login" style={{ color:'#00d4ff' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

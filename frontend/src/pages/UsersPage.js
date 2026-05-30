import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';

export default function UsersPage() {
  const [users, setUsers]   = useState([]);
  const [total, setTotal]   = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const params = { limit:50 };
    if (search) params.search = search;
    if (roleFilter) params.role = roleFilter;
    try {
      const r = await api.get('/admin/users', { params });
      setUsers(r.data.data.users); setTotal(r.data.data.total);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggle = async (id, field, val) => {
    try {
      await api.patch(`/admin/users/${id}`, { [field]: val });
      toast.success('Updated'); load();
    } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <div className="page-title">User Management</div>
          <div style={{ color:'var(--muted)', fontSize:13, marginTop:3 }}>{total} users registered</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={load}>↻ Refresh</button>
      </div>

      <div className="filter-bar">
        <input placeholder="Search username or email…" value={search}
          onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key==='Enter' && load()} style={{ minWidth:220 }}/>
        <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setTimeout(load,0); }}>
          <option value="">All Roles</option>
          <option>admin</option><option>developer</option><option>user</option>
        </select>
        <button className="btn btn-primary btn-sm" onClick={load}>Search</button>
      </div>

      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:40 }}><div className="spinner"/></div>
        ) : (
          <table>
            <thead><tr>
              <th>Username</th><th>Email</th><th>Role</th>
              <th>Status</th><th>Last Login</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td style={{ fontWeight:600, color:'var(--text)' }}>{u.username}</td>
                  <td>{u.email}</td>
                  <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                  <td>
                    <span style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:12,
                      color: u.isLocked?'var(--yellow)': u.isActive?'var(--green)':'var(--red)' }}>
                      <span style={{ width:7, height:7, borderRadius:'50%', background:'currentColor', display:'inline-block' }}/>
                      {u.isLocked?'Locked': u.isActive?'Active':'Inactive'}
                    </span>
                  </td>
                  <td style={{ fontSize:12, fontFamily:'var(--mono)' }}>
                    {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : '—'}</td>
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      <select value={u.role} onChange={e => toggle(u._id,'role',e.target.value)}
                        style={{ width:'auto', padding:'4px 8px', fontSize:11 }}>
                        <option>admin</option><option>developer</option><option>user</option>
                      </select>
                      <button className="btn btn-ghost btn-sm"
                        style={{ color: u.isActive?'var(--red)':'var(--green)',
                          borderColor: u.isActive?'rgba(239,68,68,.3)':'rgba(16,185,129,.3)', fontSize:11 }}
                        onClick={() => toggle(u._id,'isActive',!u.isActive)}>
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      {u.isLocked && (
                        <button className="btn btn-ghost btn-sm"
                          style={{ color:'var(--cyan)', borderColor:'rgba(0,212,255,.3)', fontSize:11 }}
                          onClick={() => toggle(u._id,'isLocked',false)}>Unlock</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const SC = ({ code }) => {
  const color = code < 300 ? 'var(--green)' : code < 400 ? 'var(--cyan)' : code < 500 ? 'var(--yellow)' : 'var(--red)';
  return <span style={{ color, fontFamily:'var(--mono)', fontWeight:700 }}>{code}</span>;
};

export default function LogsPage() {
  const [logs, setLogs]   = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage]   = useState(1);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ method:'', status:'', search:'' });

  const load = async (p=page) => {
    setLoading(true);
    const params = { page:p, limit:30, ...Object.fromEntries(Object.entries(filters).filter(([,v])=>v)) };
    try {
      const r = await api.get('/admin/logs', { params });
      setLogs(r.data.data.logs); setTotal(r.data.data.total);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(1); }, []);

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <div className="page-title">Request Logs</div>
          <div style={{ color:'var(--muted)', fontSize:13, marginTop:3 }}>{total} total records</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => load(1)}>↻ Refresh</button>
      </div>

      <div className="filter-bar">
        <input placeholder="Search endpoint / user / IP…" value={filters.search}
          onChange={e => setFilters({...filters, search:e.target.value})}
          onKeyDown={e => e.key==='Enter' && load(1)} style={{ minWidth:240 }}/>
        <select value={filters.method} onChange={e => { setFilters({...filters, method:e.target.value}); setTimeout(()=>load(1),0); }}>
          <option value="">All Methods</option>
          {['GET','POST','PUT','PATCH','DELETE'].map(m => <option key={m}>{m}</option>)}
        </select>
        <select value={filters.status} onChange={e => { setFilters({...filters, status:e.target.value}); setTimeout(()=>load(1),0); }}>
          <option value="">All Status</option>
          {[200,201,400,401,403,404,429,500].map(s => <option key={s}>{s}</option>)}
        </select>
        <button className="btn btn-primary btn-sm" onClick={() => load(1)}>Filter</button>
      </div>

      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:40 }}><div className="spinner"/></div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table>
              <thead><tr>
                <th>Timestamp</th><th>Method</th><th>Endpoint</th>
                <th>Status</th><th>User</th><th>IP</th><th>Time</th>
              </tr></thead>
              <tbody>
                {logs.length === 0 && <tr><td colSpan={7} style={{ textAlign:'center', padding:30, color:'var(--muted)' }}>No logs found</td></tr>}
                {logs.map(l => (
                  <tr key={l._id}>
                    <td className="mono" style={{ fontSize:11, whiteSpace:'nowrap' }}>
                      {new Date(l.timestamp).toLocaleString()}</td>
                    <td><span style={{ fontFamily:'var(--mono)', fontSize:11, fontWeight:700,
                      color: l.method==='GET'?'var(--green)':l.method==='POST'?'var(--cyan)':l.method==='DELETE'?'var(--red)':'var(--yellow)' }}>{l.method}</span></td>
                    <td className="mono" style={{ fontSize:12, maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{l.endpoint}</td>
                    <td><SC code={l.statusCode}/></td>
                    <td style={{ color:'var(--text)' }}>{l.username}</td>
                    <td className="mono" style={{ fontSize:11 }}>{l.ipAddress}</td>
                    <td style={{ color: l.responseTime>500?'var(--red)':l.responseTime>200?'var(--yellow)':'var(--green)',
                      fontFamily:'var(--mono)', fontSize:11 }}>{l.responseTime}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:14 }}>
        <span style={{ fontSize:12, color:'var(--muted)' }}>Showing {logs.length} of {total}</span>
        <div style={{ display:'flex', gap:6 }}>
          <button className="btn btn-ghost btn-sm" disabled={page<=1} onClick={() => { setPage(page-1); load(page-1); }}>← Prev</button>
          <span style={{ padding:'5px 12px', background:'var(--card)', border:'1px solid var(--border)', borderRadius:6, fontSize:13 }}>
            Page {page}</span>
          <button className="btn btn-ghost btn-sm" disabled={page*30>=total} onClick={() => { setPage(page+1); load(page+1); }}>Next →</button>
        </div>
      </div>
    </div>
  );
}

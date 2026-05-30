import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [total, setTotal]   = useState(0);
  const [filters, setFilters] = useState({ status:'', severity:'', type:'' });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const load = async () => {
    setLoading(true);
    const params = Object.fromEntries(Object.entries(filters).filter(([,v])=>v));
    try {
      const r = await api.get('/admin/alerts', { params: { ...params, limit:50 } });
      setAlerts(r.data.data.alerts); setTotal(r.data.data.total);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const resolve = async (alertId) => {
    try {
      await api.patch(`/admin/alerts/${alertId}/resolve`);
      toast.success('Alert resolved'); load();
    } catch { toast.error('Failed'); }
  };

  const activeCount = alerts.filter(a => a.status === 'ACTIVE').length;

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <div className="page-title" style={{ display:'flex', alignItems:'center', gap:10 }}>
            Attack Alerts
            {activeCount > 0 && (
              <span style={{ background:'rgba(239,68,68,.15)', color:'var(--red)', border:'1px solid rgba(239,68,68,.3)',
                borderRadius:12, padding:'2px 10px', fontSize:12, fontWeight:700 }}>{activeCount} ACTIVE</span>
            )}
          </div>
          <div style={{ color:'var(--muted)', fontSize:13, marginTop:3 }}>{total} total alerts</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={load}>↻ Refresh</button>
      </div>

      <div className="filter-bar">
        <select value={filters.status} onChange={e => setFilters({...filters, status:e.target.value})}>
          <option value="">All Status</option>
          <option>ACTIVE</option><option>RESOLVED</option><option>FALSE_POSITIVE</option>
        </select>
        <select value={filters.severity} onChange={e => setFilters({...filters, severity:e.target.value})}>
          <option value="">All Severity</option>
          <option>CRITICAL</option><option>HIGH</option><option>MEDIUM</option><option>LOW</option>
        </select>
        <select value={filters.type} onChange={e => setFilters({...filters, type:e.target.value})}>
          <option value="">All Types</option>
          {['BRUTE_FORCE','DDOS_ATTEMPT','SUSPICIOUS_IP','RATE_LIMIT','INJECTION_ATTEMPT','UNAUTHORIZED_ACCESS'].map(t=>
            <option key={t}>{t}</option>)}
        </select>
        <button className="btn btn-primary btn-sm" onClick={load}>Filter</button>
      </div>

      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:40 }}><div className="spinner"/></div>
        ) : (
          <table>
            <thead><tr>
              <th>Time</th><th>Type</th><th>Severity</th><th>IP</th>
              <th>Description</th><th>Status</th>
              {user?.role==='admin' && <th>Action</th>}
            </tr></thead>
            <tbody>
              {alerts.length===0 && <tr><td colSpan={7} style={{ textAlign:'center', padding:30, color:'var(--muted)' }}>No alerts found 🎉</td></tr>}
              {alerts.map(a => (
                <tr key={a._id} style={{ background: a.status==='ACTIVE' && a.severity==='CRITICAL' ? 'rgba(239,68,68,.03)':'' }}>
                  <td className="mono" style={{ fontSize:11, whiteSpace:'nowrap' }}>{new Date(a.timestamp).toLocaleString()}</td>
                  <td><span style={{ fontFamily:'var(--mono)', fontSize:11, color:'var(--cyan)' }}>{a.type.replace(/_/g,' ')}</span></td>
                  <td><span className={`badge badge-${a.severity}`}>{a.severity}</span></td>
                  <td className="mono" style={{ fontSize:12 }}>{a.ipAddress}</td>
                  <td style={{ maxWidth:250, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontSize:12 }}>{a.description}</td>
                  <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                  {user?.role==='admin' && (
                    <td>{a.status==='ACTIVE' && (
                      <button className="btn btn-ghost btn-sm" onClick={() => resolve(a.alertId)}
                        style={{ color:'var(--green)', borderColor:'rgba(16,185,129,.3)' }}>✓ Resolve</button>
                    )}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

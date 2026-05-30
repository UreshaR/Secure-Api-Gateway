import React, { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../utils/api';

const COLORS = ['#00d4ff','#10b981','#f59e0b','#ef4444','#8b5cf6'];

const StatCard = ({ label, value, color='var(--cyan)', icon }) => (
  <div className="card" style={{ borderTop:`2px solid ${color}` }}>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
      <div>
        <div style={{ fontSize:11, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.7px' }}>{label}</div>
        <div style={{ fontSize:28, fontWeight:700, fontFamily:'var(--mono)', color, marginTop:4 }}>{value ?? '—'}</div>
      </div>
      <span style={{ fontSize:22, opacity:.5 }}>{icon}</span>
    </div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data.data)).catch(console.error).finally(() => setLoading(false));
    const id = setInterval(() => api.get('/admin/stats').then(r => setStats(r.data.data)).catch(()=>{}), 30000);
    return () => clearInterval(id);
  }, []);

  if (loading) return <div style={{display:'flex',justifyContent:'center',marginTop:80}}><div className="spinner"/></div>;
  if (!stats) return <div style={{color:'var(--muted)'}}>Failed to load stats. Check backend connection.</div>;

  const { overview, reqsPerHour, alertsByType, statusDist } = stats;

  const hourData = Array.from({length:24}, (_,i) => ({
    h:`${i}h`, count: reqsPerHour?.find(r => r._id===i)?.count || 0
  }));

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <div className="page-title">Security Dashboard</div>
        <div style={{ color:'var(--muted)', fontSize:13, marginTop:4 }}>Real-time API gateway monitoring</div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom:24 }}>
        <StatCard label="Total Users"        value={overview.totalUsers}   color="var(--cyan)"   icon="◈"/>
        <StatCard label="Requests (24h)"     value={overview.totalReqs}    color="var(--blue)"   icon="≋"/>
        <StatCard label="Active Alerts"      value={overview.activeAlerts} color="var(--red)"    icon="⚡"/>
        <StatCard label="Success Rate"       value={`${overview.successRate}%`} color="var(--green)" icon="✓"/>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:20, marginBottom:20 }}>
        {/* Requests over time */}
        <div className="card">
          <div style={{ fontWeight:600, fontSize:13, color:'var(--muted)', marginBottom:16, textTransform:'uppercase', letterSpacing:'.7px' }}>Requests Per Hour (24h)</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={hourData}>
              <XAxis dataKey="h" tick={{fill:'#4a5568',fontSize:11}} tickLine={false} axisLine={false}/>
              <YAxis tick={{fill:'#4a5568',fontSize:11}} tickLine={false} axisLine={false}/>
              <Tooltip contentStyle={{background:'#1a1f35',border:'1px solid #1e2d4a',borderRadius:6,color:'#e2e8f0'}}/>
              <Line type="monotone" dataKey="count" stroke="#00d4ff" strokeWidth={2} dot={false}/>
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status dist */}
        <div className="card">
          <div style={{ fontWeight:600, fontSize:13, color:'var(--muted)', marginBottom:16, textTransform:'uppercase', letterSpacing:'.7px' }}>Status Codes</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusDist?.map(s=>({name:`${s._id}xx`, value:s.count}))||[]} cx="50%" cy="50%"
                innerRadius={50} outerRadius={80} dataKey="value">
                {(statusDist||[]).map((_, i) => <Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
              </Pie>
              <Tooltip contentStyle={{background:'#1a1f35',border:'1px solid #1e2d4a',borderRadius:6,color:'#e2e8f0'}}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Attack types */}
      {alertsByType?.length > 0 && (
        <div className="card">
          <div style={{ fontWeight:600, fontSize:13, color:'var(--muted)', marginBottom:16, textTransform:'uppercase', letterSpacing:'.7px' }}>Attacks (Last 7 Days)</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={alertsByType.map(a => ({ name:a._id.replace(/_/g,' '), count:a.count }))}>
              <XAxis dataKey="name" tick={{fill:'#4a5568',fontSize:10}} tickLine={false} axisLine={false}/>
              <YAxis tick={{fill:'#4a5568',fontSize:11}} tickLine={false} axisLine={false}/>
              <Tooltip contentStyle={{background:'#1a1f35',border:'1px solid #1e2d4a',borderRadius:6,color:'#e2e8f0'}}/>
              <Bar dataKey="count" fill="#ef4444" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

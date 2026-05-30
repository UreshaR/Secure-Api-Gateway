import React, { useState } from 'react';
import api from '../utils/api';

const Box = ({ title, color='var(--cyan)', children }) => (
  <div className="card" style={{ borderTop:`2px solid ${color}` }}>
    <div style={{ fontWeight:700, fontSize:13, color, marginBottom:14, fontFamily:'var(--mono)', textTransform:'uppercase', letterSpacing:'.7px' }}>
      {title}
    </div>
    {children}
  </div>
);

const Result = ({ value }) => value ? (
  <div style={{ marginTop:12, background:'rgba(0,212,255,.05)', border:'1px solid rgba(0,212,255,.2)',
    borderRadius:6, padding:12, fontFamily:'var(--mono)', fontSize:12, color:'var(--cyan)',
    wordBreak:'break-all', maxHeight:100, overflowY:'auto' }}>
    {typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
  </div>
) : null;

export default function CryptoPage() {
  const [aesIn, setAesIn]       = useState('');
  const [aesEnc, setAesEnc]     = useState('');
  const [aesDecIn, setAesDecIn] = useState('');
  const [aesDec, setAesDec]     = useState('');
  const [hashIn, setHashIn]     = useState('');
  const [hashOut, setHashOut]   = useState('');
  const [loading, setLoading]   = useState({});

  const call = async (key, fn) => {
    setLoading(l => ({...l, [key]:true}));
    try { await fn(); } catch (e) { alert(e.response?.data?.message || e.message); }
    setLoading(l => ({...l, [key]:false}));
  };

  const doEncrypt = () => call('enc', async () => {
    const r = await api.post('/crypto/encrypt', { data: aesIn });
    setAesEnc(r.data.data.encrypted);
  });

  const doDecrypt = () => call('dec', async () => {
    const r = await api.post('/crypto/decrypt', { encrypted: aesDecIn });
    setAesDec(typeof r.data.data.decrypted === 'object' ? JSON.stringify(r.data.data.decrypted) : r.data.data.decrypted);
  });

  const doHash = () => call('hash', async () => {
    const r = await api.post('/crypto/hash', { data: hashIn });
    setHashOut(r.data.data.hash);
  });

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <div className="page-title">Cryptography Lab</div>
        <div style={{ color:'var(--muted)', fontSize:13, marginTop:4 }}>AES-256 encryption & SHA-256 hashing tools</div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
        {/* AES Encrypt */}
        <Box title="⚿ AES-256 Encrypt" color="var(--cyan)">
          <textarea rows={3} placeholder='Enter text or JSON to encrypt…' value={aesIn}
            onChange={e => setAesIn(e.target.value)}
            style={{ resize:'vertical', fontFamily:'var(--mono)', fontSize:12 }}/>
          <button className="btn btn-primary" style={{ marginTop:10, width:'100%' }}
            onClick={doEncrypt} disabled={loading.enc || !aesIn}>
            {loading.enc ? 'Encrypting…' : '🔐 Encrypt'}
          </button>
          <Result value={aesEnc}/>
          {aesEnc && (
            <button className="btn btn-ghost btn-sm" style={{ marginTop:8, width:'100%' }}
              onClick={() => { setAesDecIn(aesEnc); }}>
              ↓ Send to Decrypt
            </button>
          )}
        </Box>

        {/* AES Decrypt */}
        <Box title="🔓 AES-256 Decrypt" color="var(--blue)">
          <textarea rows={3} placeholder='Paste encrypted string…' value={aesDecIn}
            onChange={e => setAesDecIn(e.target.value)}
            style={{ resize:'vertical', fontFamily:'var(--mono)', fontSize:12 }}/>
          <button className="btn btn-primary" style={{ marginTop:10, width:'100%', background:'var(--blue)' }}
            onClick={doDecrypt} disabled={loading.dec || !aesDecIn}>
            {loading.dec ? 'Decrypting…' : '🔓 Decrypt'}
          </button>
          <Result value={aesDec}/>
        </Box>
      </div>

      {/* SHA-256 */}
      <Box title="# SHA-256 Hash" color="var(--purple)">
        <div style={{ display:'flex', gap:10 }}>
          <input placeholder='Enter text to hash…' value={hashIn} onChange={e => setHashIn(e.target.value)}
            onKeyDown={e => e.key==='Enter' && doHash()} style={{ fontFamily:'var(--mono)', fontSize:12 }}/>
          <button className="btn btn-primary" style={{ background:'var(--purple)', whiteSpace:'nowrap' }}
            onClick={doHash} disabled={loading.hash || !hashIn}>
            {loading.hash ? '…' : 'Hash'}
          </button>
        </div>
        <Result value={hashOut}/>
      </Box>

      {/* Info */}
      <div className="card" style={{ marginTop:20, background:'rgba(0,212,255,.03)', borderColor:'rgba(0,212,255,.15)' }}>
        <div style={{ fontSize:12, color:'var(--muted)', lineHeight:1.8 }}>
          <strong style={{ color:'var(--cyan)' }}>How it works:</strong><br/>
          <strong>AES-256-CBC</strong> — Symmetric encryption. Same key encrypts & decrypts. Used for API payload protection.<br/>
          <strong>SHA-256</strong> — One-way hash. Cannot be reversed. Used for password fingerprinting and integrity checks.
        </div>
      </div>
    </div>
  );
}

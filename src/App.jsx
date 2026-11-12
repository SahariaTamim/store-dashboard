import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate, useLocation } from 'react-router-dom'
import Orders from './pages/Orders.jsx'
import Support from './pages/Support.jsx'
import Inventory from './pages/Inventory.jsx'
import Courier from './pages/Courier.jsx'
import Sales from './pages/Sales.jsx'
import Errors from './pages/Errors.jsx'
import './index.css'

const PASSWORD  = import.meta.env.VITE_DASHBOARD_PASSWORD || 'admin123'
const SESSION_KEY = 'dash_auth'

/* ── NAV items ── */
const NAV = [
  { to: '/orders',    icon: '📦', label: 'Orders' },
  { to: '/support',   icon: '💬', label: 'Support' },
  { to: '/inventory', icon: '🗂️', label: 'Inventory' },
  { to: '/courier',   icon: '🚚', label: 'Courier' },
  { to: '/sales',     icon: '📊', label: 'Sales' },
  { to: '/errors',    icon: '⚠️',  label: 'Errors' },
]

/* ══════════════════════════════════════
   LOGIN PAGE
══════════════════════════════════════ */
function Login({ onLogin }) {
  const [pw, setPw]   = useState('')
  const [err, setErr] = useState('')
  const submit = e => {
    e.preventDefault()
    if (pw === PASSWORD) { sessionStorage.setItem(SESSION_KEY, '1'); onLogin() }
    else { setErr('Wrong password'); setPw('') }
  }
  return (
    <div style={S.loginWrap}>
      <div style={S.loginBox}>
        <div style={S.loginIcon}>🛍️</div>
        <h1 style={S.loginTitle}>Store Dashboard</h1>
        <p style={S.loginSub}>WooCommerce · BDT · COD</p>
        <form onSubmit={submit} style={{ width:'100%' }}>
          <input
            type="password" value={pw} onChange={e => setPw(e.target.value)}
            placeholder="Enter password" style={S.loginInput} autoFocus
          />
          {err && <p style={S.loginErr}>{err}</p>}
          <button type="submit" style={S.loginBtn}>Login →</button>
        </form>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════
   SIDEBAR (desktop)
══════════════════════════════════════ */
function Sidebar({ onLogout }) {
  return (
    <aside style={S.sidebar}>
      {/* Brand */}
      <div style={S.brand}>
        <div style={S.brandIcon}>🛍️</div>
        <div>
          <div style={S.brandName}>ShopDash</div>
          <div style={S.brandSub}>WooCommerce · BDT</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={S.nav}>
        <div style={S.navLabel}>Main</div>
        {NAV.slice(0,3).map(n => (
          <NavLink key={n.to} to={n.to} style={({ isActive }) => ({ ...S.navLink, ...(isActive ? S.navActive : {}) })}>
            <span style={{ fontSize:16, width:22, textAlign:'center' }}>{n.icon}</span>
            {n.label}
          </NavLink>
        ))}
        <div style={{ ...S.navLabel, marginTop:12 }}>Logistics & Reports</div>
        {NAV.slice(3).map(n => (
          <NavLink key={n.to} to={n.to} style={({ isActive }) => ({ ...S.navLink, ...(isActive ? S.navActive : {}) })}>
            <span style={{ fontSize:16, width:22, textAlign:'center' }}>{n.icon}</span>
            {n.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={S.sideFooter}>
        <div style={S.avatar}>👤</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:12, fontWeight:600, color:'var(--text)' }}>Admin</div>
          <div style={{ fontSize:11, color:'var(--muted)' }}>Store Owner</div>
        </div>
        <button onClick={onLogout} style={S.logoutBtn} title="Logout">⏻</button>
      </div>
    </aside>
  )
}

/* ══════════════════════════════════════
   BOTTOM NAV (mobile)
══════════════════════════════════════ */
function BottomNav() {
  const { pathname } = useLocation()
  return (
    <nav style={S.bottomNav}>
      {NAV.map(n => {
        const active = pathname.startsWith(n.to)
        return (
          <NavLink key={n.to} to={n.to} style={{ textDecoration:'none' }}>
            <div style={{ ...S.bnavItem, ...(active ? S.bnavActive : {}) }}>
              <div style={{ ...S.bnavIcon, ...(active ? S.bnavIconActive : {}) }}>
                {n.icon}
              </div>
              <span style={{ ...S.bnavLabel, ...(active ? { color:'var(--accent)' } : {}) }}>
                {n.label}
              </span>
            </div>
          </NavLink>
        )
      })}
    </nav>
  )
}

/* ══════════════════════════════════════
   TOP BAR
══════════════════════════════════════ */
function TopBar() {
  const { pathname } = useLocation()
  const page = NAV.find(n => pathname.startsWith(n.to)) || NAV[0]
  return (
    <div style={S.topbar}>
      <div>
        <div style={S.topbarTitle}>{page.icon} {page.label}</div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={S.statusPill}>
          <span style={S.statusDot} />
          n8n Active
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════
   LAYOUT
══════════════════════════════════════ */
function Layout({ onLogout }) {
  return (
    <div style={S.shell}>
      <Sidebar onLogout={onLogout} />
      <div style={S.mainWrap}>
        <TopBar />
        <main style={S.main}>
          <Routes>
            <Route path="/orders"    element={<Orders />} />
            <Route path="/support"   element={<Support />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/courier"   element={<Courier />} />
            <Route path="/sales"     element={<Sales />} />
            <Route path="/errors"    element={<Errors />} />
            <Route path="*"          element={<Navigate to="/orders" replace />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </div>
  )
}

/* ══════════════════════════════════════
   APP ROOT
══════════════════════════════════════ */
export default function App() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1')
  const logout = () => { sessionStorage.removeItem(SESSION_KEY); setAuthed(false) }
  if (!authed) return <Login onLogin={() => setAuthed(true)} />
  return (
    <BrowserRouter>
      <Layout onLogout={logout} />
    </BrowserRouter>
  )
}

/* ══════════════════════════════════════
   STYLES
══════════════════════════════════════ */
const S = {
  /* Login */
  loginWrap: {
    minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
    background:'var(--bg)', padding:'0 16px',
  },
  loginBox: {
    background:'var(--surface)', borderRadius:16, padding:'48px 40px', width:'100%', maxWidth:380,
    textAlign:'center', boxShadow:'0 8px 40px rgba(0,0,0,.12)', border:'1px solid var(--border)',
    display:'flex', flexDirection:'column', alignItems:'center', gap:0,
  },
  loginIcon:  { fontSize:52, marginBottom:14 },
  loginTitle: { fontSize:22, fontWeight:700, color:'var(--text)', marginBottom:6 },
  loginSub:   { color:'var(--muted)', fontSize:13, marginBottom:28 },
  loginInput: {
    width:'100%', padding:'12px 16px', borderRadius:8, border:'1px solid var(--border)',
    background:'var(--surface2)', color:'var(--text)', fontSize:15, marginBottom:12,
    display:'block',
  },
  loginErr:  { color:'var(--red)', fontSize:13, marginBottom:10, textAlign:'left' },
  loginBtn: {
    width:'100%', padding:'12px', borderRadius:8, border:'none',
    background:'var(--accent)', color:'#fff', fontSize:15, fontWeight:600, cursor:'pointer',
    boxShadow:'0 4px 12px rgba(37,99,235,.3)',
  },

  /* Shell */
  shell:    { display:'flex', height:'100vh', overflow:'hidden' },
  mainWrap: { flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden' },
  main: {
    flex:1, overflowY:'auto', padding:24,
    paddingBottom:'calc(24px + env(safe-area-inset-bottom, 0px))',
    background:'var(--bg)',
  },

  /* Sidebar */
  sidebar: {
    width:240, background:'var(--surface)', borderRight:'1px solid var(--border)',
    display:'flex', flexDirection:'column', flexShrink:0,
    '@media(max-width:720px)': { display:'none' },
  },
  brand: {
    padding:'18px 20px 16px', borderBottom:'1px solid var(--border)',
    display:'flex', alignItems:'center', gap:12,
  },
  brandIcon: {
    width:38, height:38, background:'var(--accent)', borderRadius:10,
    display:'flex', alignItems:'center', justifyContent:'center', fontSize:20,
    flexShrink:0, boxShadow:'0 4px 10px rgba(37,99,235,.3)',
  },
  brandName: { fontSize:15, fontWeight:700, color:'var(--text)', fontFamily:'Space Grotesk, system-ui, sans-serif' },
  brandSub:  { fontSize:11, color:'var(--muted)', marginTop:1 },
  nav:       { flex:1, padding:'12px 10px', display:'flex', flexDirection:'column', gap:2, overflowY:'auto' },
  navLabel:  { fontSize:10, fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:'var(--muted)', padding:'6px 12px 2px' },
  navLink: {
    display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:8,
    color:'var(--text-dim)', textDecoration:'none', fontSize:13.5, fontWeight:500, transition:'all .15s',
  },
  navActive: { background:'var(--accent-lt)', color:'var(--accent)', fontWeight:600 },
  sideFooter: {
    padding:'14px 16px', borderTop:'1px solid var(--border)',
    display:'flex', alignItems:'center', gap:10,
  },
  avatar: {
    width:30, height:30, borderRadius:'50%', background:'var(--accent-lt)',
    color:'var(--accent)', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center',
    border:'2px solid var(--accent-mid)', flexShrink:0,
  },
  logoutBtn: {
    background:'transparent', border:'1px solid var(--border)', borderRadius:7,
    color:'var(--muted)', cursor:'pointer', padding:'5px 8px', fontSize:13,
  },

  /* Topbar */
  topbar: {
    background:'var(--surface)', borderBottom:'1px solid var(--border)',
    padding:'0 24px', height:58, display:'flex', alignItems:'center',
    justifyContent:'space-between', flexShrink:0,
  },
  topbarTitle: { fontSize:17, fontWeight:700, color:'var(--text)', fontFamily:'Space Grotesk, system-ui, sans-serif' },
  statusPill: {
    display:'flex', alignItems:'center', gap:6, padding:'5px 12px',
    borderRadius:20, background:'var(--accent-lt)', border:'1px solid var(--accent-mid)',
    fontSize:11.5, color:'var(--accent)', fontWeight:600,
  },
  statusDot: {
    width:7, height:7, background:'var(--green)', borderRadius:'50%',
    animation:'pulse 2s infinite', display:'inline-block',
  },

  /* Bottom nav */
  bottomNav: {
    display:'none',
    position:'fixed', bottom:0, left:0, right:0,
    background:'var(--surface)', borderTop:'1px solid var(--border)',
    padding:'8px 16px', paddingBottom:'max(10px, env(safe-area-inset-bottom, 0px))',
    zIndex:50, boxShadow:'0 -4px 20px rgba(0,0,0,.08)',
    '@media(max-width:720px)': { display:'flex' },
  },
  bnavItem: {
    flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3,
    padding:'4px 6px', borderRadius:10, cursor:'pointer', color:'var(--muted)',
    transition:'all .15s',
  },
  bnavActive: { color:'var(--accent)' },
  bnavIcon: {
    width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center',
    borderRadius:8, fontSize:17, transition:'background .15s',
  },
  bnavIconActive: { background:'var(--accent-lt)' },
  bnavLabel: { fontSize:10, fontWeight:600, color:'var(--muted)', letterSpacing:'.01em' },
}

/* Inject mobile bottom nav CSS (React inline styles can't do media queries) */
const mobileCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
  @keyframes spin  { to{transform:rotate(360deg)} }
  @media (max-width: 720px) {
    aside { display: none !important; }
    nav[data-bottomnav] { display: flex !important; justify-content: space-around; }
    main { padding-bottom: calc(90px + env(safe-area-inset-bottom, 0px)) !important; }
    .stats-grid { grid-template-columns: repeat(2,1fr) !important; }
  }
  @media (min-width: 721px) {
    nav[data-bottomnav] { display: none !important; }
  }
  a { text-decoration: none; }
  button { font-family: inherit; }
`
const styleEl = document.createElement('style')
styleEl.textContent = mobileCSS
document.head.appendChild(styleEl)

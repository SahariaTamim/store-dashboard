import React, { useState } from 'react'

/* ══════════════════════════════════════
   CARD
══════════════════════════════════════ */
export function Card({ children, style }) {
  return (
    <div style={{
      background:'var(--surface)', border:'1px solid var(--border)',
      borderRadius:12, padding:20, ...style,
    }}>
      {children}
    </div>
  )
}

/* ══════════════════════════════════════
   BADGE
══════════════════════════════════════ */
export function Badge({ text, color }) {
  const colors = {
    green:  { bg:'var(--green-lt)',  fg:'var(--green)',  bd:'rgba(22,163,74,.2)' },
    red:    { bg:'var(--red-lt)',    fg:'var(--red)',    bd:'rgba(220,38,38,.2)' },
    yellow: { bg:'var(--yellow-lt)', fg:'var(--yellow)', bd:'rgba(217,119,6,.2)' },
    blue:   { bg:'var(--accent-lt)', fg:'var(--accent)', bd:'rgba(37,99,235,.2)' },
    gray:   { bg:'var(--surface2)', fg:'var(--muted)',  bd:'var(--border)' },
    orange: { bg:'var(--orange-lt)', fg:'var(--orange)', bd:'rgba(234,88,12,.2)' },
    purple: { bg:'var(--purple-lt)', fg:'var(--purple)', bd:'rgba(124,58,237,.2)' },
  }
  const c = colors[color] || colors.gray
  return (
    <span style={{
      background:c.bg, color:c.fg, border:`1px solid ${c.bd}`,
      borderRadius:20, padding:'3px 10px', fontSize:12, fontWeight:600,
      whiteSpace:'nowrap', display:'inline-flex', alignItems:'center', gap:4,
    }}>
      {text}
    </span>
  )
}

export function statusBadge(status) {
  const map = {
    pending:    ['⏳ Pending',    'yellow'],
    processing: ['⚙️ Processing', 'blue'],
    'on-hold':  ['⏸ On Hold',    'orange'],
    completed:  ['✅ Completed',  'green'],
    cancelled:  ['❌ Cancelled',  'red'],
    refunded:   ['↩ Refunded',   'purple'],
    failed:     ['✗ Failed',     'red'],
  }
  const [label, color] = map[status] || [status, 'gray']
  return <Badge text={label} color={color} />
}

/* ══════════════════════════════════════
   SPINNER
══════════════════════════════════════ */
export function Spinner() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:60, color:'var(--muted)' }}>
      <div style={{
        width:32, height:32, border:'3px solid var(--border)', borderTopColor:'var(--accent)',
        borderRadius:'50%', animation:'spin 0.8s linear infinite',
      }} />
    </div>
  )
}

/* ══════════════════════════════════════
   ERROR MSG
══════════════════════════════════════ */
export function ErrMsg({ msg }) {
  return (
    <div style={{
      background:'var(--red-lt)', border:'1px solid rgba(220,38,38,.2)',
      borderRadius:8, padding:'14px 16px', color:'var(--red)', margin:'16px 0', fontSize:13,
    }}>
      ⚠️ {msg}
    </div>
  )
}

/* ══════════════════════════════════════
   PAGE HEADER
══════════════════════════════════════ */
export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:22, gap:12, flexWrap:'wrap' }}>
      <div>
        <h1 style={{ fontSize:20, fontWeight:700, color:'var(--text)', lineHeight:1.2 }}>{title}</h1>
        {subtitle && <p style={{ color:'var(--text-dim)', fontSize:13, marginTop:4 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

/* ══════════════════════════════════════
   TABLE
══════════════════════════════════════ */
export function Table({ cols, rows, emptyMsg = 'No data' }) {
  if (!rows || rows.length === 0)
    return (
      <div style={{ textAlign:'center', color:'var(--muted)', padding:48, fontSize:14 }}>
        {emptyMsg}
      </div>
    )
  return (
    <div style={{ overflowX:'auto' }}>
      <table style={{ minWidth:520 }}>
        <thead>
          <tr>
            {cols.map(c => (
              <th key={c.key}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {cols.map(c => (
                <td key={c.key} style={{ verticalAlign:'middle' }}>
                  {c.render ? c.render(row[c.key], row) : (row[c.key] || '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ══════════════════════════════════════
   BUTTON
══════════════════════════════════════ */
export function Button({ children, onClick, variant='primary', size='md', disabled, loading }) {
  const base = {
    display:'inline-flex', alignItems:'center', gap:6, fontFamily:'inherit',
    fontWeight:600, cursor: disabled||loading ? 'not-allowed' : 'pointer',
    opacity: disabled||loading ? 0.5 : 1, transition:'all .15s', border:'1px solid transparent',
    borderRadius: size==='sm' ? 6 : size==='lg' ? 10 : 8,
    padding: size==='sm' ? '4px 10px' : size==='lg' ? '10px 20px' : '7px 14px',
    fontSize: size==='sm' ? 12 : size==='lg' ? 15 : 13,
  }
  const variants = {
    primary: { background:'var(--accent)', color:'#fff', borderColor:'var(--accent)', boxShadow:'0 2px 8px rgba(37,99,235,.25)' },
    success: { background:'var(--green)',  color:'#fff', borderColor:'var(--green)' },
    danger:  { background:'var(--red)',    color:'#fff', borderColor:'var(--red)' },
    ghost:   { background:'transparent',  color:'var(--text-dim)', borderColor:'var(--border)' },
    outline: { background:'transparent',  color:'var(--accent)', borderColor:'var(--accent-mid)' },
  }
  return (
    <button onClick={onClick} disabled={disabled || loading} style={{ ...base, ...variants[variant] }}>
      {loading ? '⟳' : children}
    </button>
  )
}

/* ══════════════════════════════════════
   STAT CARD
══════════════════════════════════════ */
export function StatCard({ icon, label, value, sub, color='blue' }) {
  const iconBg = {
    blue:'var(--accent-lt)', green:'var(--green-lt)', yellow:'var(--yellow-lt)',
    red:'var(--red-lt)', purple:'var(--purple-lt)', orange:'var(--orange-lt)',
  }
  const topBorder = {
    blue:'var(--accent)', green:'var(--green)', yellow:'var(--yellow)',
    red:'var(--red)', purple:'var(--purple)', orange:'var(--orange)',
  }
  return (
    <div style={{
      background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12,
      padding:'18px 16px', display:'flex', flexDirection:'column', gap:8,
      borderTop:`3px solid ${topBorder[color]||topBorder.blue}`,
      transition:'box-shadow .15s',
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{
          width:34, height:34, borderRadius:9, background:iconBg[color]||iconBg.blue,
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, flexShrink:0,
        }}>
          {icon}
        </div>
        <span style={{ color:'var(--text-dim)', fontSize:12, fontWeight:500, textTransform:'uppercase', letterSpacing:'.04em' }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize:28, fontWeight:700, color:'var(--text)', fontVariantNumeric:'tabular-nums', lineHeight:1 }}>
        {value}
      </div>
      {sub && <div style={{ color:'var(--muted)', fontSize:12 }}>{sub}</div>}
    </div>
  )
}

/* ══════════════════════════════════════
   useData HOOK
══════════════════════════════════════ */
export function useData(fetcher) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const load = React.useCallback(() => {
    setLoading(true); setError(null)
    fetcher()
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])
  React.useEffect(() => { load() }, [load])
  return { data, loading, error, reload: load }
}

/* ══════════════════════════════════════
   REFRESH BUTTON
══════════════════════════════════════ */
export function RefreshBtn({ onClick }) {
  return <Button onClick={onClick} variant='ghost' size='sm'>↻ Refresh</Button>
}

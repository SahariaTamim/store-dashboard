import React, { useState } from 'react'
import { Card, Badge, Spinner, ErrMsg, PageHeader, Table, Button, StatCard, useData, RefreshBtn } from '../components/ui.jsx'
import { getSupport } from '../sheets.js'

function intentBadge(intent) {
  const map = {
    order_status:  ['Order Status', 'blue'],
    delivery:      ['Delivery',     'purple'],
    product_info:  ['Product',      'green'],
    return_refund: ['Refund',       'red'],
    general:       ['General',      'gray'],
  }
  const [label, color] = map[intent] || [intent||'Unknown', 'gray']
  return <Badge text={label} color={color} />
}

function ticketStatusBadge(status) {
  const map = { Open:['Open','yellow'], Replied:['Replied','blue'], Escalated:['Escalated','red'], Resolved:['Resolved','green'] }
  const [label, color] = map[status] || [status||'Open','gray']
  return <Badge text={label} color={color} />
}

function TicketModal({ ticket, onClose }) {
  if (!ticket) return null
  return (
    <div style={S.overlay} onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={S.modal}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h2 style={{ color:'#f1f5f9', fontSize:16 }}>Ticket {ticket['Ticket ID']}</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'#64748b', fontSize:20, cursor:'pointer' }}>✕</button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:20 }}>
          <div><div style={S.lbl}>Customer</div><div style={S.val}>{ticket['Customer Name']||'—'}</div></div>
          <div><div style={S.lbl}>Chat ID</div><div style={S.val}>{ticket['Chat ID']||'—'}</div></div>
          <div><div style={S.lbl}>Intent</div><div style={S.val}>{intentBadge(ticket['Intent'])}</div></div>
          <div><div style={S.lbl}>Status</div><div style={S.val}>{ticketStatusBadge(ticket['Status'])}</div></div>
          <div><div style={S.lbl}>Confidence</div><div style={S.val}>{ticket['Confidence'] ? (Number(ticket['Confidence'])*100).toFixed(0)+'%' : '—'}</div></div>
          <div><div style={S.lbl}>Escalated</div><div style={S.val}><Badge text={ticket['Escalated']||'No'} color={ticket['Escalated']==='Yes'?'red':'gray'} /></div></div>
          {ticket['Order ID'] && <div><div style={S.lbl}>Order ID</div><div style={S.val}>{ticket['Order ID']}</div></div>}
          <div><div style={S.lbl}>Created</div><div style={S.val}>{ticket['Created At']?.slice(0,16)||'—'}</div></div>
        </div>
        <div style={{ marginBottom:16 }}>
          <div style={S.lbl}>Customer Message</div>
          <div style={S.bubble}>{ticket['Customer Message']||'—'}</div>
        </div>
        <div style={{ marginBottom:16 }}>
          <div style={S.lbl}>AI Reply</div>
          <div style={{ ...S.bubble, borderColor:'#1e3a8a', background:'#0c1a3d' }}>{ticket['AI Reply']||'—'}</div>
        </div>
        {ticket['Escalation Reason'] && (
          <div>
            <div style={S.lbl}>Escalation Reason</div>
            <div style={{ ...S.bubble, borderColor:'#7f1d1d', background:'#2d0a0a', color:'#f87171' }}>{ticket['Escalation Reason']}</div>
          </div>
        )}
        <div style={{ marginTop:20 }}>
          <Button onClick={onClose} variant='ghost'>Close</Button>
        </div>
      </div>
    </div>
  )
}

export default function Support() {
  const { data: tickets, loading, error, reload } = useData(getSupport)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  const filtered = (tickets||[]).filter(t => filter==='all' || t['Status']===filter || t['Escalated']===filter)
  const counts = (tickets||[]).reduce((a,t) => { a[t['Status']]=(a[t['Status']]||0)+1; return a }, {})
  const escalated = (tickets||[]).filter(t => t['Escalated']==='Yes').length

  if (loading) return <Spinner />
  if (error) return <ErrMsg msg={error} />

  return (
    <div>
      <PageHeader title="💬 Support Tickets" subtitle={`${tickets.length} total tickets`}
        action={<RefreshBtn onClick={reload} />} />

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:12, marginBottom:24 }}>
        <StatCard icon="📋" label="Total" value={tickets.length} color="blue" />
        <StatCard icon="🔓" label="Open" value={counts.Open||0} color="yellow" />
        <StatCard icon="💬" label="Replied" value={counts.Replied||0} color="blue" />
        <StatCard icon="🚨" label="Escalated" value={escalated} color="red" />
        <StatCard icon="✅" label="Resolved" value={counts.Resolved||0} color="green" />
      </div>

      <Card>
        <div style={{ marginBottom:16 }}>
          <select value={filter} onChange={e => setFilter(e.target.value)}
            style={{ padding:'8px 12px', borderRadius:8, border:'1px solid #334155',
              background:'#0f172a', color:'#e2e8f0', fontSize:13 }}>
            <option value="all">All</option>
            <option value="Open">Open</option>
            <option value="Escalated">Escalated</option>
            <option value="Yes">Escalated (flag)</option>
            <option value="Replied">Replied</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
        <Table
          emptyMsg="No tickets"
          cols={[
            { key:'Ticket ID',       label:'Ticket ID', render: v => <span style={{ fontSize:11, color:'#64748b' }}>{v}</span> },
            { key:'Customer Name',   label:'Customer' },
            { key:'Customer Message',label:'Message', render: v => <span style={{ maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', display:'block' }}>{v}</span> },
            { key:'Intent',          label:'Intent', render: v => intentBadge(v) },
            { key:'Status',          label:'Status', render: v => ticketStatusBadge(v) },
            { key:'Escalated',       label:'Escalated', render: v => <Badge text={v||'No'} color={v==='Yes'?'red':'gray'} /> },
            { key:'Created At',      label:'Time', render: v => v?.slice(0,16) },
            { key:'_action',         label:'', render: (_,row) => <Button size='sm' onClick={() => setSelected(row)}>View</Button> },
          ]}
          rows={filtered}
        />
      </Card>
      {selected && <TicketModal ticket={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

const S = {
  overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100 },
  modal: { background:'#1e293b', borderRadius:16, padding:28, width:'min(620px,95vw)', maxHeight:'85vh', overflowY:'auto' },
  lbl: { color:'#64748b', fontSize:11, marginBottom:4 },
  val: { color:'#e2e8f0', fontSize:14 },
  bubble: { background:'#0f172a', border:'1px solid #334155', borderRadius:8, padding:12, color:'#cbd5e1', fontSize:14, lineHeight:1.6, marginTop:4 },
}

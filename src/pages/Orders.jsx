import React, { useState } from 'react'
import { Card, Badge, statusBadge, Spinner, ErrMsg, PageHeader, Table, Button, StatCard, useData, RefreshBtn } from '../components/ui.jsx'
import { getOrders } from '../sheets.js'
import { approveOrder, updateOrderStatus } from '../webhook.js'

const STATUS_OPTIONS = ['pending','processing','on-hold','completed','cancelled']

function OrderModal({ order, onClose, onAction }) {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const doApprove = async () => {
    setLoading(true); setMsg('')
    try {
      await approveOrder(order['Order ID'])
      setMsg('✅ Sent to Steadfast!')
    } catch(e) { setMsg('❌ ' + e.message) }
    setLoading(false)
  }

  if (!order) return null
  return (
    <div style={S.overlay} onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={S.modal}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h2 style={{ color:'#f1f5f9', fontSize:18 }}>Order {order['Order ID']}</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'#64748b', fontSize:20, cursor:'pointer' }}>✕</button>
        </div>
        <div style={S.grid2}>
          <Info label="Customer" value={order['Customer Name']} />
          <Info label="Phone" value={order['Phone']} />
          <Info label="Status" value={statusBadge(order['Status'])} />
          <Info label="Total" value={`${order['Total (BDT)']} BDT`} />
          <Info label="Payment" value={order['Payment Method']} />
          <Info label="City" value={order['City']} />
          <Info label="Items" value={order['Items']} span />
          <Info label="Address" value={order['Address']} span />
          {order['Customer Note'] && <Info label="Note" value={order['Customer Note']} span />}
          <Info label="Date" value={order['Date Created']} />
          <Info label="Courier Status" value={order['Courier Status'] || '—'} />
        </div>
        {msg && <div style={{ margin:'12px 0', color: msg.startsWith('✅') ? '#4ade80' : '#f87171', fontSize:14 }}>{msg}</div>}
        <div style={{ display:'flex', gap:10, marginTop:20, flexWrap:'wrap' }}>
          {order['Status'] === 'processing' && !order['Courier Status'] && (
            <Button onClick={doApprove} variant='success' loading={loading}>
              🚚 Send to Courier
            </Button>
          )}
          <Button onClick={onClose} variant='ghost'>Close</Button>
        </div>
      </div>
    </div>
  )
}

function Info({ label, value, span }) {
  return (
    <div style={{ gridColumn: span ? '1/-1' : undefined }}>
      <div style={{ color:'#64748b', fontSize:11, marginBottom:3 }}>{label}</div>
      <div style={{ color:'#e2e8f0', fontSize:14 }}>{value}</div>
    </div>
  )
}

export default function Orders() {
  const { data: orders, loading, error, reload } = useData(getOrders)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  const filtered = (orders || []).filter(o => {
    const matchStatus = filter === 'all' || o['Status'] === filter
    const matchSearch = !search || [o['Order ID'], o['Customer Name'], o['Phone']]
      .some(v => v?.toLowerCase().includes(search.toLowerCase()))
    return matchStatus && matchSearch
  })

  const counts = (orders || []).reduce((acc, o) => {
    acc[o['Status']] = (acc[o['Status']] || 0) + 1; return acc
  }, {})

  if (loading) return <Spinner />
  if (error) return <ErrMsg msg={error} />

  return (
    <div>
      <PageHeader title="📦 Orders" subtitle={`${orders.length} total orders`}
        action={<RefreshBtn onClick={reload} />} />

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12, marginBottom:24 }}>
        <StatCard icon="📋" label="Total" value={orders.length} color="blue" />
        <StatCard icon="⏳" label="Pending" value={counts.pending||0} color="yellow" />
        <StatCard icon="⚙️" label="Processing" value={counts.processing||0} color="blue" />
        <StatCard icon="✅" label="Completed" value={counts.completed||0} color="green" />
        <StatCard icon="❌" label="Cancelled" value={counts.cancelled||0} color="red" />
      </div>

      <Card>
        <div style={{ display:'flex', gap:12, marginBottom:16, flexWrap:'wrap' }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search order ID, name, phone..."
            style={S.searchInput} />
          <select value={filter} onChange={e => setFilter(e.target.value)} style={S.select}>
            <option value="all">All Status</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <Table
          emptyMsg="No orders found"
          cols={[
            { key:'Order ID',      label:'Order ID' },
            { key:'Customer Name', label:'Customer' },
            { key:'Phone',         label:'Phone' },
            { key:'Status',        label:'Status', render: v => statusBadge(v) },
            { key:'Total (BDT)',   label:'Total', render: v => `৳${v}` },
            { key:'Courier Status',label:'Courier', render: v => v ? <Badge text={v} color="purple" /> : '—' },
            { key:'Date Created',  label:'Date', render: v => v?.slice(0,10) },
            { key:'_action',       label:'', render: (_, row) => (
              <Button size='sm' onClick={() => setSelected(row)}>View</Button>
            )},
          ]}
          rows={filtered}
        />
      </Card>

      {selected && <OrderModal order={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

const S = {
  searchInput: { flex:1, minWidth:200, padding:'8px 12px', borderRadius:8, border:'1px solid #334155',
    background:'#0f172a', color:'#e2e8f0', fontSize:13, outline:'none' },
  select: { padding:'8px 12px', borderRadius:8, border:'1px solid #334155',
    background:'#0f172a', color:'#e2e8f0', fontSize:13, cursor:'pointer' },
  overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex',
    alignItems:'center', justifyContent:'center', zIndex:100 },
  modal: { background:'#1e293b', borderRadius:16, padding:28, width:'min(600px,95vw)',
    maxHeight:'85vh', overflowY:'auto' },
  grid2: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 },
}

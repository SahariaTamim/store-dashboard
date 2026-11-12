import React, { useState } from 'react'
import { Card, Badge, Spinner, ErrMsg, PageHeader, Table, Button, StatCard, useData, RefreshBtn } from '../components/ui.jsx'
import { getCourier } from '../sheets.js'

function deliveryBadge(status) {
  const map = {
    pending:                          ['Pending',    'yellow'],
    in_review:                        ['In Review',  'blue'],
    delivered:                        ['Delivered',  'green'],
    partial_delivered:                ['Partial',    'orange'],
    cancelled:                        ['Cancelled',  'red'],
    hold:                             ['Hold',       'orange'],
    delivered_approval_pending:       ['Approval',   'purple'],
    cancelled_approval_pending:       ['Cancel Pend','red'],
    partial_delivered_approval_pending:['Part Pend', 'orange'],
    unknown_approval_pending:         ['Unknown Pend','gray'],
    unknown:                          ['Unknown',    'gray'],
  }
  const [label, color] = map[status] || [status||'—','gray']
  return <Badge text={label} color={color} />
}

export default function Courier() {
  const { data: rows, loading, error, reload } = useData(getCourier)
  const [filter, setFilter] = useState('all')

  const filtered = (rows||[]).filter(r => filter==='all' || r['Delivery Status']===filter)
  const counts = (rows||[]).reduce((a,r) => { a[r['Delivery Status']]=(a[r['Delivery Status']]||0)+1; return a }, {})

  if (loading) return <Spinner />
  if (error) return <ErrMsg msg={error} />

  return (
    <div>
      <PageHeader title="🚚 Courier Tracking" subtitle={`${rows.length} parcels`}
        action={<RefreshBtn onClick={reload} />} />

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:12, marginBottom:24 }}>
        <StatCard icon="📦" label="Total" value={rows.length} color="blue" />
        <StatCard icon="⏳" label="Pending" value={counts.pending||0} color="yellow" />
        <StatCard icon="🔍" label="In Review" value={counts.in_review||0} color="blue" />
        <StatCard icon="✅" label="Delivered" value={counts.delivered||0} color="green" />
        <StatCard icon="❌" label="Cancelled" value={counts.cancelled||0} color="red" />
        <StatCard icon="⏸️" label="Hold" value={counts.hold||0} color="orange" />
      </div>

      <Card>
        <div style={{ marginBottom:16 }}>
          <select value={filter} onChange={e => setFilter(e.target.value)}
            style={{ padding:'8px 12px', borderRadius:8, border:'1px solid #334155',
              background:'#0f172a', color:'#e2e8f0', fontSize:13 }}>
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="in_review">In Review</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="hold">Hold</option>
          </select>
        </div>
        <Table
          emptyMsg="No courier records"
          cols={[
            { key:'Order ID',        label:'Order ID' },
            { key:'Consignment ID',  label:'Consignment' },
            { key:'Tracking Code',   label:'Tracking' },
            { key:'Customer Name',   label:'Customer' },
            { key:'Phone',           label:'Phone' },
            { key:'COD Amount (BDT)',label:'COD', render: v => `৳${v}` },
            { key:'Delivery Status', label:'Status', render: v => deliveryBadge(v) },
            { key:'Booked At',       label:'Booked', render: v => v?.slice(0,10) },
            { key:'Last Checked',    label:'Checked', render: v => v?.slice(0,16) },
          ]}
          rows={filtered}
        />
      </Card>
    </div>
  )
}

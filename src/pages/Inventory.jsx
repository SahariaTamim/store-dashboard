import React, { useState } from 'react'
import { Card, Badge, Spinner, ErrMsg, PageHeader, Table, Button, StatCard, useData, RefreshBtn } from '../components/ui.jsx'
import { getInventory } from '../sheets.js'
import { updateReorderLevel } from '../webhook.js'

function stockBadge(status) {
  const map = { OK:['OK','green'], LOW:['Low','yellow'], OUT:['Out','red'] }
  const [label, color] = map[status] || [status,'gray']
  return <Badge text={label} color={color} />
}

function EditReorder({ row, onDone }) {
  const [val, setVal] = useState(row['Reorder Level'] || '5')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const save = async () => {
    setLoading(true); setMsg('')
    try {
      await updateReorderLevel(row['Product ID'], Number(val))
      setMsg('✅ Saved!')
    } catch(e) { setMsg('❌ ' + e.message) }
    setLoading(false)
  }

  return (
    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
      <input type="number" value={val} onChange={e => setVal(e.target.value)}
        style={{ width:60, padding:'4px 8px', borderRadius:6, border:'1px solid #334155',
          background:'#0f172a', color:'#e2e8f0', fontSize:13 }} />
      <Button size='sm' variant='success' onClick={save} loading={loading}>Save</Button>
      <Button size='sm' variant='ghost' onClick={onDone}>✕</Button>
      {msg && <span style={{ fontSize:12, color: msg.startsWith('✅')?'#4ade80':'#f87171' }}>{msg}</span>}
    </div>
  )
}

export default function Inventory() {
  const { data: items, loading, error, reload } = useData(getInventory)
  const [editing, setEditing] = useState(null)
  const [filter, setFilter] = useState('all')

  const filtered = (items || []).filter(i => filter==='all' || i['Stock Status']===filter)
  const counts = (items||[]).reduce((a,i) => { a[i['Stock Status']]=(a[i['Stock Status']]||0)+1; return a }, {})

  if (loading) return <Spinner />
  if (error) return <ErrMsg msg={error} />

  return (
    <div>
      <PageHeader title="🛒 Inventory" subtitle={`${items.length} products`}
        action={<RefreshBtn onClick={reload} />} />

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12, marginBottom:24 }}>
        <StatCard icon="📦" label="Total Products" value={items.length} color="blue" />
        <StatCard icon="✅" label="In Stock" value={counts.OK||0} color="green" />
        <StatCard icon="⚠️" label="Low Stock" value={counts.LOW||0} color="yellow" />
        <StatCard icon="❌" label="Out of Stock" value={counts.OUT||0} color="red" />
      </div>

      <Card>
        <div style={{ marginBottom:16 }}>
          <select value={filter} onChange={e => setFilter(e.target.value)}
            style={{ padding:'8px 12px', borderRadius:8, border:'1px solid #334155',
              background:'#0f172a', color:'#e2e8f0', fontSize:13 }}>
            <option value="all">All</option>
            <option value="LOW">Low Stock</option>
            <option value="OUT">Out of Stock</option>
            <option value="OK">In Stock</option>
          </select>
        </div>
        <Table
          emptyMsg="No products"
          cols={[
            { key:'Product Name', label:'Product' },
            { key:'SKU',          label:'SKU' },
            { key:'Stock Qty',    label:'Stock', render: v => <strong style={{color:'#f1f5f9'}}>{v}</strong> },
            { key:'Reorder Level',label:'Reorder Level', render: (v, row) =>
              editing === row['Product ID']
                ? <EditReorder row={row} onDone={() => setEditing(null)} />
                : <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                    {v}
                    <Button size='sm' variant='ghost' onClick={() => setEditing(row['Product ID'])}>✏️</Button>
                  </span>
            },
            { key:'Stock Status', label:'Status', render: v => stockBadge(v) },
            { key:'Alert Sent',   label:'Alert', render: v => <Badge text={v||'No'} color={v==='Yes'?'yellow':'gray'} /> },
            { key:'Last Synced',  label:'Last Synced', render: v => v?.slice(0,16) },
          ]}
          rows={filtered}
        />
      </Card>
    </div>
  )
}

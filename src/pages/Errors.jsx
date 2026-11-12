import React, { useState } from 'react'
import { Card, Badge, Spinner, ErrMsg, PageHeader, Table, Button, StatCard, useData, RefreshBtn } from '../components/ui.jsx'
import { getErrors } from '../sheets.js'
import { resolveError } from '../webhook.js'

function sevBadge(sev) {
  const map = { Critical:['Critical','red'], High:['High','orange'], Medium:['Medium','yellow'], Low:['Low','gray'] }
  const [label, color] = map[sev] || [sev||'—','gray']
  return <Badge text={label} color={color} />
}

function statusBadge(s) {
  const map = { Open:['Open','red'], Investigating:['Investigating','yellow'], Resolved:['Resolved','green'] }
  const [label, color] = map[s] || [s||'Open','gray']
  return <Badge text={label} color={color} />
}

export default function Errors() {
  const { data: errs, loading, error, reload } = useData(getErrors)
  const [filter, setFilter] = useState('all')
  const [resolving, setResolving] = useState(null)

  const filtered = (errs||[]).filter(e => filter==='all' || e['Severity']===filter || e['Status']===filter)
  const counts = (errs||[]).reduce((a,e) => { a[e['Severity']]=(a[e['Severity']]||0)+1; return a }, {})
  const open = (errs||[]).filter(e => e['Status']==='Open').length

  const doResolve = async (row) => {
    setResolving(row['Error ID'])
    try { await resolveError(row['Error ID']) }
    catch(e) { alert('Error: ' + e.message) }
    setResolving(null)
    reload()
  }

  if (loading) return <Spinner />
  if (error) return <ErrMsg msg={error} />

  return (
    <div>
      <PageHeader title="⚠️ Error Log" subtitle={`${open} open errors`}
        action={<RefreshBtn onClick={reload} />} />

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:12, marginBottom:24 }}>
        <StatCard icon="🔴" label="Critical" value={counts.Critical||0} color="red" />
        <StatCard icon="🟠" label="High" value={counts.High||0} color="yellow" />
        <StatCard icon="🟡" label="Medium" value={counts.Medium||0} color="yellow" />
        <StatCard icon="✅" label="Open" value={open} color="red" />
      </div>

      <Card>
        <div style={{ marginBottom:16 }}>
          <select value={filter} onChange={e => setFilter(e.target.value)}
            style={{ padding:'8px 12px', borderRadius:8, border:'1px solid #334155',
              background:'#0f172a', color:'#e2e8f0', fontSize:13 }}>
            <option value="all">All</option>
            <option value="Open">Open</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
          </select>
        </div>
        <Table
          emptyMsg="No errors — system running clean ✅"
          cols={[
            { key:'Timestamp',     label:'Time', render: v => v?.slice(0,16) },
            { key:'Workflow Name', label:'Workflow' },
            { key:'Node Name',     label:'Node' },
            { key:'Error Message', label:'Message', render: v =>
              <span style={{ maxWidth:280, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', display:'block', color:'#fca5a5', fontSize:12 }}>{v}</span>
            },
            { key:'Severity',     label:'Severity', render: v => sevBadge(v) },
            { key:'Status',       label:'Status',   render: v => statusBadge(v) },
            { key:'_action',      label:'', render: (_,row) =>
              row['Status'] !== 'Resolved'
                ? <Button size='sm' variant='success' loading={resolving===row['Error ID']}
                    onClick={() => doResolve(row)}>✓ Resolve</Button>
                : null
            },
          ]}
          rows={filtered}
        />
      </Card>
    </div>
  )
}

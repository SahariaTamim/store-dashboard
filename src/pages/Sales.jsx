import React, { useState } from 'react'
import { Card, Spinner, ErrMsg, PageHeader, Table, StatCard, useData, RefreshBtn } from '../components/ui.jsx'
import { getSalesReport } from '../sheets.js'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const TIP_STYLE = { background:'#1e293b', border:'1px solid #334155', borderRadius:8, color:'#e2e8f0', fontSize:13 }

export default function Sales() {
  const { data: reports, loading, error, reload } = useData(getSalesReport)

  const sorted = [...(reports||[])].sort((a,b) => a['Period Start'] > b['Period Start'] ? 1 : -1)
  const last7 = sorted.slice(-7)

  const chartData = last7.map(r => ({
    date: r['Period Start']?.slice(5,10) || r['Report ID']?.slice(6),
    gross: Number(r['Gross Sales (BDT)'])||0,
    net: Number(r['Net Sales (BDT)'])||0,
    orders: Number(r['Order Count'])||0,
  }))

  const totals = (reports||[]).reduce((a,r) => {
    a.gross += Number(r['Gross Sales (BDT)'])||0
    a.net   += Number(r['Net Sales (BDT)'])||0
    a.orders+= Number(r['Order Count'])||0
    a.refunds+= Number(r['Refunds (BDT)'])||0
    return a
  }, { gross:0, net:0, orders:0, refunds:0 })

  if (loading) return <Spinner />
  if (error) return <ErrMsg msg={error} />

  return (
    <div>
      <PageHeader title="📊 Sales Report" subtitle={`${reports.length} daily reports`}
        action={<RefreshBtn onClick={reload} />} />

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:12, marginBottom:24 }}>
        <StatCard icon="💰" label="Total Gross" value={`৳${totals.gross.toLocaleString()}`} color="green" />
        <StatCard icon="📈" label="Net Sales" value={`৳${totals.net.toLocaleString()}`} color="blue" />
        <StatCard icon="📦" label="Total Orders" value={totals.orders} color="purple" />
        <StatCard icon="↩️" label="Refunds" value={`৳${totals.refunds.toLocaleString()}`} color="red" />
      </div>

      {chartData.length > 0 && (
        <Card style={{ marginBottom:24 }}>
          <h3 style={{ color:'#94a3b8', fontSize:14, marginBottom:16 }}>Last 7 Days — Net Sales (BDT)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" tick={{ fill:'#64748b', fontSize:12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'#64748b', fontSize:12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TIP_STYLE} formatter={v => [`৳${v}`, 'Net Sales']} />
              <Bar dataKey="net" fill="#3b82f6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      <Card>
        <Table
          emptyMsg="No sales reports yet — run WF5 to generate"
          cols={[
            { key:'Report ID',              label:'Report ID' },
            { key:'Period Start',           label:'Date', render: v => v?.slice(0,10) },
            { key:'Order Count',            label:'Orders' },
            { key:'Gross Sales (BDT)',      label:'Gross', render: v => `৳${Number(v||0).toLocaleString()}` },
            { key:'Refunds (BDT)',          label:'Refunds', render: v => `৳${Number(v||0).toLocaleString()}` },
            { key:'Net Sales (BDT)',        label:'Net', render: v => <strong style={{color:'#4ade80'}}>৳{Number(v||0).toLocaleString()}</strong> },
            { key:'Average Order Value (BDT)', label:'AOV', render: v => `৳${Number(v||0).toLocaleString()}` },
            { key:'Generated At',           label:'Generated', render: v => v?.slice(0,16) },
          ]}
          rows={[...sorted].reverse()}
        />
      </Card>
    </div>
  )
}

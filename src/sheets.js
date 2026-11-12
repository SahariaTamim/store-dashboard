// Google Sheets API v4 — reads data from your spreadsheet
// Uses API Key (read-only, public sheet) OR Service Account (private sheet)
// We use API Key approach: simpler, free, no backend needed
// Sheet must be shared: "Anyone with the link can view"

const SHEET_ID = import.meta.env.VITE_SHEET_ID
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY

const BASE = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}`

async function fetchRange(range) {
  const url = `${BASE}/values/${encodeURIComponent(range)}?key=${API_KEY}`
  const res = await fetch(url)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `Sheets API error ${res.status}`)
  }
  const data = await res.json()
  return data.values || []
}

function rowsToObjects(rows) {
  if (!rows || rows.length < 2) return []
  const headers = rows[0]
  return rows.slice(1).map(row => {
    const obj = {}
    headers.forEach((h, i) => { obj[h] = row[i] ?? '' })
    return obj
  })
}

export async function getOrders() {
  const rows = await fetchRange('Orders!A:R')
  return rowsToObjects(rows).filter(r => r['Data Type'] === 'LIVE')
}

export async function getSupport() {
  const rows = await fetchRange('Support!A:N')
  return rowsToObjects(rows).filter(r => r['Data Type'] === 'LIVE')
}

export async function getInventory() {
  const rows = await fetchRange('Inventory!A:J')
  return rowsToObjects(rows).filter(r => r['Data Type'] === 'LIVE')
}

export async function getCourier() {
  const rows = await fetchRange('Courier!A:K')
  return rowsToObjects(rows).filter(r => r['Data Type'] === 'LIVE')
}

export async function getSalesReport() {
  const rows = await fetchRange('Sales Report!A:K')
  return rowsToObjects(rows).filter(r => r['Data Type'] === 'LIVE')
}

export async function getErrors() {
  const rows = await fetchRange('Errors!A:J')
  return rowsToObjects(rows).filter(r => r['Data Type'] === 'LIVE')
}

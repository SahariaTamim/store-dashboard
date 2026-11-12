// Calls n8n webhooks for dashboard actions
const BASE = import.meta.env.VITE_N8N_WEBHOOK_URL?.replace(/\/$/, '')

export async function callWebhook(path, body) {
  const url = `${BASE}/webhook/${path}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  if (!res.ok) throw new Error(`Webhook error ${res.status}`)
  return res.json().catch(() => ({ ok: true }))
}

// Order: approve + send to Steadfast
export const approveOrder = (orderId) =>
  callWebhook('dashboard/approve-order', { order_id: orderId })

// Order: update status
export const updateOrderStatus = (orderId, status) =>
  callWebhook('dashboard/update-order-status', { order_id: orderId, status })

// Inventory: update reorder level
export const updateReorderLevel = (productId, level) =>
  callWebhook('dashboard/update-reorder-level', { product_id: productId, reorder_level: level })

// Error: mark resolved
export const resolveError = (errorId) =>
  callWebhook('dashboard/resolve-error', { error_id: errorId })

import killPort from 'kill-port'

const port = Number(process.env.MTBM_BACKEND_PORT || 5001)

try {
  await killPort(port)
  console.log(`[dev] Freed backend port ${port}`)
} catch (error) {
  const message = String(error?.message || '')
  if (message.toLowerCase().includes('no process')) {
    console.log(`[dev] Backend port ${port} is already free`)
  } else {
    // Do not block dev startup if kill-port cannot find/kill a process.
    console.warn(`[dev] Could not free backend port ${port}: ${message}`)
  }
}

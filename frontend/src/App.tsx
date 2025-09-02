// src/App.tsx   (or src/app.tsx depending on your naming)
import React, { useEffect, useState } from 'react'
import { getWaku } from './lib/wakuClient'
import type { Waku } from '@waku/sdk'
import { Message } from '@waku/interfaces'

export default function App() {
  // UI state ---------------------------------------------------------
  const [status, setStatus] = useState<string>('⏳ Initialising…')
  const [waku, setWaku] = useState<Waku | null>(null)

  // -----------------------------------------------------------------
  // 1️⃣ Initialise Waku once on mount
  // -----------------------------------------------------------------
  useEffect(() => {
    ;(async () => {
      try {
        // Pass the hostname of the node; defaults to current page host.
        const client = await getWaku()
        setWaku(client)
        setStatus('✅ Connected to markop2pworld')
      } catch (err) {
        console.error(err)
        setStatus('❌ Could not connect – see console')
      }
    })()
  }, [])

  // -----------------------------------------------------------------
  // 2️⃣ OPTIONAL: Subscribe to the default relay topic to see inbound msgs
  // -----------------------------------------------------------------
  useEffect(() => {
    if (!waku) return

    const sub = waku.relay.subscribe(
      '/waku/2/default-waku/proto',
      (msg: Message) => {
        const txt = new TextDecoder().decode(msg.payload ?? new Uint8Array())
        console.log('📩 Received (relay):', txt)
      }
    )

    // Cleanup on unmount
    return () => sub?.unsubscribe()
  }, [waku])

  // -----------------------------------------------------------------
  // 3️⃣ Publish a test payload via LightPush (fast, no gossip)
  // -----------------------------------------------------------------
  const sendTest = async () => {
    if (!waku) return

    const payload = new TextEncoder().encode('👋 Hello from Lumo‑powered React app!')
    try {
      await waku.lightPush.publish(payload, {
        contentTopic: '/example/1/app' // arbitrary, just needs to be a string
      })
      alert('✅ Message pushed to the node')
    } catch (e) {
      console.error('Publish failed', e)
      alert('❌ Publish error – check console')
    }
  }

  // -----------------------------------------------------------------
  // Render UI
  // -----------------------------------------------------------------
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>🚀 Markop2pworld Demo</h1>
      <p>{status}</p>

      {waku && (
        <button
          onClick={sendTest}
          style={{
            marginTop: '1rem',
            padding: '0.6rem 1.2rem',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          Send test LightPush message
        </button>
      )}
    </div>
  )
}

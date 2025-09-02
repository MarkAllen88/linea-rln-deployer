// src/App.tsx
import React, { useEffect, useState } from 'react'
import { getWaku } from './lib/wakuClient'
import type { Waku } from '@waku/sdk'
import type { Message } from '@waku/interfaces'

// We will send and receive messages on this topic.
const contentTopic = '/markop2pworld/1/chat/proto'

export default function App() {
  const [status, setStatus] = useState<string>('⏳ Initialising���')
  const [waku, setWaku] = useState<Waku | null>(null)

  useEffect(() => {
    if (waku) return
    ;(async () => {
      try {
        const client = await getWaku()
        setWaku(client)
        setStatus('✅ Connected to local Waku node')
      } catch (err) {
        console.error('Error connecting to local Waku node:', err)
        setStatus('❌ Could not connect. Is the local nwaku node running?')
      }
    })()
  }, [waku])

  // **FEEDBACK LOOP:** This useEffect subscribes to our topic.
  useEffect(() => {
    if (!waku || !waku.relay) return

    let unsubscribe: (() => void) | undefined;
    
    // Give the connection a moment to stabilize before subscribing. This handles the race condition.
    const timer = setTimeout(() => {
      (async () => {
        try {
          const subscription = await waku.relay.subscribe(
            contentTopic,
            (msg: Message) => {
              const txt = new TextDecoder().decode(msg.payload ?? new Uint8Array())
              console.log('���� Message Received:', txt)
              alert(`📩 New Message Received:\n\n${txt}`)
            }
          )
          unsubscribe = subscription.unsubscribe
          console.log('✅ Subscribed to Relay topic:', contentTopic)
        } catch (e) {
          console.error(`Failed to subscribe to Relay topic: ${e.message}`)
        }
      })();
    }, 500); // 500ms delay for stabilization

    // Cleanup function to unsubscribe when the component unmounts
    return () => {
      clearTimeout(timer);
      unsubscribe?.()
    }
  }, [waku])

  const sendTest = async () => {
    // We removed the failing `waitForRemotePeer` check.
    if (!waku || !waku.lightPush) {
      alert('Waku lightPush is not ready yet, please wait a moment.')
      return
    }

    try {
      const payload = new TextEncoder().encode(`👋 Hello! The time is ${new Date().toLocaleTimeString()}`)
      const result = await waku.lightPush.send({
        contentTopic: contentTopic, // Send to the same topic we are listening on
        payload: payload,
      })

      if (result.successes.length > 0) {
        console.log(`Message successfully sent to local node!`)
        // The success alert will now come from our subscription callback.
      } else {
        alert(`❌ Message failed to send. Check the nwaku node console.`)
        console.error('Push failures:', result.failures)
      }
    } catch (e) {
      console.error('Publish failed:', e)
      alert('❌ Publish error – check console')
    }
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>🚀 Markop2pworld Demo</h1>
      <p>{status}</p>
      {waku && (
        <button onClick={sendTest} style={{ marginTop: '1rem', padding: '0.6rem', fontSize: '1rem' }}>
          Send test LightPush message
        </button>
      )}
    </div>
  )
}

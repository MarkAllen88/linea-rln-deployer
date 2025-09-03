import { useEffect, useState } from 'react';
import { waitForRemotePeer, Protocols } from '@waku/sdk';
import { getWaku } from './lib/wakuClient';

export default function App() {
  const [status, setStatus] = useState<string>('⏳ Initialising…');
  // Use 'any' to avoid type issues with SDK versions
  const [waku, setWaku] = useState<any>(null);

  useEffect(() => {
    if (waku) return;
    (async () => {
      try {
        const client = await getWaku();
        setWaku(client);
        setStatus('✅ Connected to local Waku node');
      } catch (err) {
        console.error('Error connecting to local Waku node:', err);
        setStatus('❌ Could not connect. Is the local nwaku node running?');
      }
    })();
  }, [waku]);

  const sendTest = async () => {
    if (!waku || !waku.lightPush) {
      alert('Waku lightPush is not ready yet.');
      return;
    }

    try {
      await waitForRemotePeer(waku, [Protocols.LightPush]);

      const payload = new TextEncoder().encode(
        `👋 Hello! The time is ${new Date().toTimeString()}`
      );

      const result = await waku.lightPush.send({
        contentTopic: '/example/1/app',
        payload
      });

      if (result.successes.length > 0) {
        alert(`✅ Message successfully sent to ${result.successes.length} peer(s)!`);
      } else {
        alert('❌ Message failed to send. Check the nwaku node console.');
        console.error('Push failures:', result.failures);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('Publish failed:', e);
      alert(`❌ Publish error: ${msg}`);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>🚀 Markop2pworld Demo</h1>
      <p>{status}</p>
      {waku && (
        <button
          onClick={sendTest}
          style={{ marginTop: '1rem', padding: '0.6rem', fontSize: '1rem' }}
        >
          Send test LightPush message
        </button>
      )}
    </div>
  );
}

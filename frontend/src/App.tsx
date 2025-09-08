import { useEffect, useState, useRef } from 'react';
import { getWaku } from './lib/wakuClient';
import { createEncoder } from '@waku/sdk';

export default function App() {
  const [status, setStatus] = useState<string>('⏳ Initialising…');
  const [isReady, setIsReady] = useState<boolean>(false);
  const [waku, setWaku] = useState<any>(null);

  // useRef to prevent double-initialization in React Strict Mode
  const isInitializing = useRef(false);

  useEffect(() => {
    if (isInitializing.current || waku) return;
    isInitializing.current = true;

    (async () => {
      try {
        setStatus('⏳ Connecting to local Waku node...');
        const client = await getWaku();
        setWaku(client);
        setStatus('✅ Waku node is ready!');
        setIsReady(true);
      } catch (err) {
        console.error('Error initializing Waku node:', err);
        setStatus('❌ Could not connect. Is the local nwaku node running and configured?');
      }
    })();
  }, [waku]);

  const sendTest = async () => {
    console.log('Button clicked - starting sendTest');
    if (!waku || !waku.lightPush) {
      console.error('Waku or lightPush not ready');
      alert('Waku lightPush is not ready yet.');
      return;
    }

    try {
      console.log('Preparing payload');
      const payload = new TextEncoder().encode(
        `👋 Hello! The time is ${new Date().toTimeString()}`
      );

        console.log('Preparing encoder');
        const encoder = createEncoder({ contentTopic: '/example/1/app/proto' });
        if (!encoder.routingInfo) encoder.routingInfo = {};
        encoder.routingInfo.pubsubTopic = '/waku/2/rs/0/0'; // Explicitly set pubsubTopic in routingInfo
        console.log('Encoder object:', encoder);

      console.log('Sending LightPush message');
      const result = await waku.lightPush.send(encoder, { payload });

      console.log('Send result:', result);

      if (result.successes.length > 0) {
        alert(`✅ Message successfully sent to ${result.successes.length} peer(s)!`);
      } else {
        // Corrected line:
        console.log('Push failures:', result.failures.map(f => f.error));
        const failureReason = result.failures.length > 0
          ? (result.failures[0] as any).error || 'Unknown' // Type assertion for safety
          : 'Unknown reason';
        alert(`❌ Message failed to send. Reason: ${failureReason}`);
      }
    } catch (e) {
      console.error('Send error:', e);
      const msg = e instanceof Error ? e.message : String(e);
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
          disabled={!isReady}
          style={{
            marginTop: '1rem',
            padding: '0.6rem',
            fontSize: '1rem',
            cursor: isReady ? 'pointer' : 'not-allowed',
            opacity: isReady ? 1 : 0.6
          }}
        >
          {isReady ? 'Send test LightPush message' : 'Waiting for connection...'}
        </button>
      )}
    </div>
  );
}

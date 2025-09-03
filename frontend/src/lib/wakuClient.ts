import { createLightNode } from '@waku/sdk';
import { multiaddr } from '@multiformats/multiaddr';

// Multiaddress for the local nwaku node
// const localNodeMultiaddr = '/ip4/127.0.0.1/tcp/60000/ws';
// const localNodeMultiaddr = '/dns4/localhost/tcp/60000/ws/p2p/16Uiu2HAkw8wAzCndKyvfHZj5JqLEU5i7VcUAgxpjzZUPVw5F2qiz';
// const localNodeMultiaddr = '/ip4/127.0.0.1/tcp/60000/ws/p2p/16Uiu2HAkw8wAzCndKyvfHZj5JqLEU5i7VcUAgxpjzZUPVw5F2qiz';
// const localNodeMultiaddr = '/dns4/localhost/tcp/60000/ws/p2p/32ee547b3decdb2a326625d1af592c695181fc219cf8571bd3b1e029963ffb6b';
const localNodeMultiaddr = import.meta.env.VITE_WAKU_NODE_MULTIADDR!;
// const localNodeMultiaddr = '/ip4/127.0.0.1/tcp/60000/ws/32ee547b3decdb2a326625d1af592c695181fc219cf8571bd3b1e029963ffb6b';

let wakuSingleton: any = null;

export async function getWaku(): Promise<any> {
  if (wakuSingleton) return wakuSingleton;

  const node = await createLightNode({
    defaultBootstrap: false
  });

  await node.start();

  try {
    await node.libp2p.dial(multiaddr(localNodeMultiaddr));
  } catch (err) {
    console.warn('Could not dial local Waku node at', localNodeMultiaddr, err);
  }

  console.log('✅ Waku node started and connecting to local peer');
  wakuSingleton = node;
  return node;
}

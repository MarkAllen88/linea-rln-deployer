import { createLightNode, waitForRemotePeer, Protocols } from "@waku/sdk";
import { multiaddr } from "@multiformats/multiaddr";
// These imports are required to explicitly enable the WebSocket transport
import { webSockets } from "@libp2p/websockets";
import { all } from "@libp2p/websockets/filters";

const localNodeMultiaddr = import.meta.env.VITE_WAKU_NODE_MULTIADDR!;

let wakuSingleton: any = null;

export async function getWaku(): Promise<any> {
  // If the singleton instance already exists, return it
  if (wakuSingleton) return wakuSingleton;

  console.log("Creating Waku Light Node with WebSocket transport...");
  const node = await createLightNode({
    defaultBootstrap: false,
    // This is the critical missing piece.
    // We must explicitly tell the node how to handle WebSocket addresses.
    libp2p: {
      transports: [webSockets({ filter: all })],
    },
    shardInfo: { clusterId: 16, shards: [0] }
  });

  await node.start();

  try {
    console.log("Waku node dialing...");
    await node.libp2p.dial(multiaddr(localNodeMultiaddr));
    console.log("Waku node waiting for a peer with Light Push...");
    await waitForRemotePeer(node, [Protocols.LightPush]);
  } catch (err) {
    console.error(
      "Could not dial or find peer with required protocols at",
      localNodeMultiaddr,
      err
    );
    throw err;
  }

  console.log("✅ Waku node started and connected to a peer with Light Push");
  wakuSingleton = node;
  return node;
}

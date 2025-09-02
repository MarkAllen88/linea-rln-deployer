// src/lib/wakuClient.ts
import { createLightNode } from '@waku/sdk'
import type { Waku } from '@waku/sdk'

// Multiaddress for the local nwaku node running from the rln-hardhat-standalone project
const localNodeMultiaddr = '/ip4/127.0.0.1/tcp/60000/ws'

let wakuSingleton: Waku | null = null

export async function getWaku(): Promise<Waku> {
  if (wakuSingleton) return wakuSingleton

  wakuSingleton = await createLightNode({
    // Do not use the public fleet
    defaultBootstrap: false,
    // Connect directly to our known, local node
    bootstrap: () => {
      return [localNodeMultiaddr]
    },
  })

  await wakuSingleton.start()
  console.log('✅ Waku node started and connecting to local peer')

  return wakuSingleton
}

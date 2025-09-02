// src/lib/wakuClient.ts
import { createLibp2p } from '@libp2p/libp2p'
import { Noise } from '@chainsafe/libp2p-noise'
import { Mplex } from '@libp2p/mplex'
import { WebSockets } from '@libp2p/websockets'
import { Waku } from '@waku/sdk'

let wakuSingleton: Waku | null = null

/***
 * Initialise (or retrieve) a global Waku client.
 *
 * @param host  – DNS name or IP where the nwaku node lives.
 *                Default points to the same host the browser served from.
 * @returns    – Ready‑to‑use Waku instance.
 */
export async function getWaku(host: string = window.location.hostname): Promise<Waku> {
  if (wakuSingleton) return wakuSingleton

  // -----------------------------------------------------------------
  // 1️⃣ Build a libp2p node that mirrors the transports the nwaku binary
  //    advertises (WebSockets + Noise + Mplex).
  // -----------------------------------------------------------------
  const libp2p = await createLibp2p({
    transports: [new WebSockets()],          // WS transport
    streamMuxers: [new Mplex()],             // multiplexing
    connectionEncryption: [new Noise()]      // encrypted channels
  })

  // -----------------------------------------------------------------
  // 2️⃣ Dial the remote multi‑address.
  //    Format: /dns4/<host>/tcp/60000/ws
  // -----------------------------------------------------------------
  const remoteMa = `/dns4/${host}/tcp/60000/ws`
  try {
    await libp2p.dial(remoteMa)
    console.info(`🔗 Libp2p dialed ${remoteMa}`)
  } catch (e) {
    console.error('❌ Failed to dial Waku node', e)
    throw e
  }

  // -----------------------------------------------------------------
  // 3️⃣ Wrap the libp2p instance with the high‑level Waku API.
  // -----------------------------------------------------------------
  wakuSingleton = await Waku.create({ libp2p })
  console.info('✅ Waku client instantiated')
  return wakuSingleton
}

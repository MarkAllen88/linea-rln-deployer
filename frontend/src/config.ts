// src/config.ts
export const WAKU_WS_URL   = import.meta.env.VITE_WAKU_WS_URL;             // ws://localhost:8000
export const WAKU_HTTP_URL = import.meta.env.VITE_WAKU_HTTP_URL;           // http://localhost:8003 (optional)
export const LINEA_RPC_URL = import.meta.env.VITE_LINEA_SEPOLIA_RPC_URL;
export const ETH_PRIV_KEY  = import.meta.env.VITE_ETH_PRIVATE_KEY;         // keep secret!
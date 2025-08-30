import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';  // Assuming React; add if not present
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
